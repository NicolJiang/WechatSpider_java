/**
 * 微信公众号爬虫, 抓取流程参考`README.MD`文档
 *
 * @author 最爱吃小鱼
 */

var url = require('url');
var http = require('http');
var querystring = require('querystring');

module.exports = {
    // 模块介绍
    summary: '微信公众号爬虫',
    // 发送响应前处理
    *beforeSendResponse(requestDetail, responseDetail) {

        // 解析连接中的参数信息
        var link = requestDetail.url;

        // 历史页面第一页数据
        if(/mp\/profile_ext\?action=home/i.test(link)){
            // 取得响应内容
            var serverResData = responseDetail.response.body.toString();
            // 取得公众号唯一标识biz
            var biz = getBizByLink(link);

            // 取得微信公众号历史数据的第一页数据，包含公众号详情及最新的文章信息
            var account = getAccount(biz, serverResData);
            // 数据上传到服务器
            serverPost(biz, account, '/spider/firstpage');

            // 根据返回的数据状态组装相应的自动滚动加载JS
            var autoNextScrollJS = getAutoNextScrollJS(biz);

            // 修改返回的body内容，插入JS
            var newResponse = Object.assign({}, responseDetail.response);
            newResponse.body += autoNextScrollJS;
            return {
                response: newResponse
            };
        }

        // 向下翻页的数据的AJAX请求处理
        if(/mp\/profile_ext\?action=getmsg/i.test(link)){
            var biz = getBizByLink(link);
            var content = JSON.parse(responseDetail.response.body.toString());
            content = JSON.parse(content.general_msg_list);

            var articles = getArticles(biz, content.list);
            serverPost(biz, articles, '/spider/nextpage');
            return;
        }

        return null;
    }
};

// 转义符换成普通字符
function escape2Html(str){
    const arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
}

/**
 * 从URL中解析出biz
 * @param link
 * @returns {biz}
 */
function getBizByLink(link) {
    var identifier = querystring.parse(url.parse(link).query);
    return identifier.__biz;
}

/**
 * 取得微信公众号及最新的文章信息
 * @param biz
 * @param serverResData
 * @returns {{}}
 */
function getAccount(biz, serverResData) {
    var account = {};
    // 解析公众号的数据
    account.nickname = /var nickname = "(.+?)"/.exec(serverResData)[1];
    account.headimg = /var headimg = "(.+?)"/.exec(serverResData)[1];
    account.biz = biz;
    account.crawlTime = new Date().getTime();

    // 解析文章列表数据
    var msgList = /var msgList = '(.+)';\n/.exec(serverResData)[1];
    msgList = JSON.parse(escape2Html(msgList).replace(/\\\//g,'/'));
    msgList = msgList.list;
    account.articles = getArticles(biz, msgList);
    return account;
}

/**
 * 解析封装取得自己想要文章信息
 * @param biz
 * @param content
 * @returns {Array}
 */
function getArticles(biz, content) {
    var articles = [];
    for (var i=0, len=content.length ; i < len ; i++) {
        var post = content[i];
        var cmi = post.comm_msg_info;
        var amei = post.app_msg_ext_info;
        articles.push({
            biz: biz,
            title: amei.title,
            digest: amei.digest,
            contentUrl: amei.content_url,
            sourceUrl: amei.source_url,
            author: amei.author,
            cover: amei.cover,
            copyrightStat: amei.copyright_stat,
            datetime: cmi.datetime
        });
    }
    return articles;
}

/**
 * 向服务上传抓取到的数据
 * @param data 数据
 * @param path 请求路径
 */
function serverPost(biz, data, path) {
    var post_data = querystring.stringify({
        biz: biz,
        content: JSON.stringify(data)
    });
    var options = {
        host: '127.0.0.1',
        port: 8080,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };
    var req = http.request(options, function (serverFeedback) {
        if (serverFeedback.statusCode == 200) {
            // ignore
        } else {
            console.log("请求失败，请查看异常信息");
        }
    });
    req.write(post_data);
    req.end();
}

function getAutoNextScrollJS(biz) {
    var nextJS = '';
    nextJS += '<script type="text/javascript">';
    nextJS += '    var end = document.createElement("p");';
    nextJS += '    document.body.appendChild(end);';
    nextJS += '    (function scrollDown(){';
    nextJS += '        end.scrollIntoView();';
    nextJS += '        var loadMore = document.getElementsByClassName("loadmore with_line")[0];';
    nextJS += '        if (loadMore.style.display) {';
    nextJS += '            setTimeout(scrollDown,Math.floor(Math.random()*2000+5000));';
    nextJS += '        } ';
    nextJS += '    })();';
    nextJS += '<\/script>';
    return nextJS;
}