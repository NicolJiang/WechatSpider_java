/**
 * 微信公众号爬虫, 抓取流程参考`README.MD`文档
 *
 * @author 最爱吃小鱼
 */

var url = require('url');
var http = require('http');
var querystring = require('querystring');
var cheerio = require('cheerio');
var config = {
    autoNextScroll: false, // 是否自动下拉采取数据
    autoPostData: true, // 是否提交数据到服务器
    m: 3000, // 自动下拉的时间间隔 m ~ n 秒之间
    n: 5000
}

module.exports = {
    // 模块介绍
    summary: '微信公众号爬虫',
    // 发送响应前处理
    *beforeSendResponse(requestDetail, responseDetail) {
        try {
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
                serverPost(biz, account, '/spider/firstpage')

                // 判断是否自动下拉请求数据
                if (!config.autoNextScroll) {
                    return null;
                }

                // 根据返回的数据状态组装相应的自动滚动加载JS
                var autoNextScrollJS = getAutoNextScrollJS();

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
                return null;
            }

            // 文章页跳转
            if (/\/s\?__biz/.test(link) || /mp\/appmsg\/show/.test(link)) {
                var article = getArticle(link, responseDetail);
                console.log(article);
                serverPost(article.biz, article, '/spider/updateArticleContent');
                return null;
            }

            // 微信公众号的跟贴评论
            if (/\/mp\/appmsg_comment/.test(link)){
                console.log("TODO 微信公众号的跟贴评论");
                return null;
            }

            // 获取点赞量和阅读量
            if (link.indexOf('getappmsgext') > -1) {
                var article = getArticleOfReadNumAndLikeNum(link, responseDetail);
                serverPost(article.biz, article, '/spider/updateArticleNum');
                return null;
            }

            return null;
        } catch (e) {
            console.log("程序运行异常");
            console.log(e);
            throw e;
        }

    }
};

// 转义符换成普通字符
function escape2Html(str){
    const arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
}

/**
 * 取得文章的详细信息, 通过biz,mid聚合主键找些此文章，更新文章内容
 *
 * @param link
 * @param responseDetail
 * @returns {{biz: *, mid: *, idx: *, content: (*|jQuery|string)}}
 */
function getArticle(link, responseDetail) {
    var identifier = querystring.parse(url.parse(link).query);
    var content = responseDetail.response.body.toString();
    var $ = cheerio.load(content, { decodeEntities: false });
    var articleContent = $('#js_content').html() || '';
    if (articleContent.trim() == '') {
        return null;
    }
    return {
        biz: identifier.__biz,
        mid: identifier.mid,
        idx: identifier.idx,
        content: articleContent
    }
}


function getArticleOfReadNumAndLikeNum(link, responseDetail) {
    var identifier = querystring.parse(url.parse(link).query);
    content = JSON.parse(responseDetail.response.body.toString());
    return {
        biz: identifier.__biz,
        mid: identifier.mid,
        idx: identifier.idx,
        readNum: content.appmsgstat.read_num,
        likeNum: content.appmsgstat.like_num
    }
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
        var obj = getMidAndIdx(amei.content_url);

        articles.push({
            biz: biz,
            mid: obj.mid,
            title: amei.title,
            digest: amei.digest,
            contentUrl: amei.content_url,
            sourceUrl: amei.source_url,
            author: amei.author,
            cover: amei.cover,
            copyrightStat: amei.copyright_stat,
            datetime: cmi.datetime,
            idx: obj.idx
        });
    }
    return articles;
}

/**
 * 从连接取得mid及idx
 * @param link
 * @returns {{mid: *, idx: *}}
 */
function getMidAndIdx(link) {
    var identifier = querystring.parse(url.parse(link.replace(/amp;/g, '')).query);
    return {
        mid: identifier.mid,
        idx: identifier.idx
    }
}

/**
 * 向服务上传抓取到的数据
 * @param data 数据
 * @param path 请求路径
 */
function serverPost(biz, data, path) {
    if (data == null || !config.autoPostData) {
        return;
    }
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

function getAutoNextScrollJS() {
    var nextJS = '';
    nextJS += '<script type="text/javascript">';
    nextJS += '    var end = document.createElement("p");';
    nextJS += '    document.body.appendChild(end);';
    nextJS += '    (function scrollDown(){';
    nextJS += '        end.scrollIntoView();';
    nextJS += '        var loadMore = document.getElementsByClassName("loadmore with_line")[0];';
    nextJS += '        if (loadMore.style.display) {';
    nextJS += '            setTimeout(scrollDown,Math.floor(Math.random()*('+config.n+'-'+config.m+')+'+config.m+'));';
    nextJS += '        } ';
    nextJS += '    })();';
    nextJS += '<\/script>';
    return nextJS;
}