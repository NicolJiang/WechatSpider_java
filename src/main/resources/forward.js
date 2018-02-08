/**
 *
 * AnyProxy的二次开发，参考文档 http://anyproxy.io/cn/#rule%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3
 *
 * 启动命令：`anyproxy --intercept --silent true --rule ~/WechatSpider/src/main/resources/forward.js`
 *
 * @author 最爱吃小鱼
 */

var http = require('http');
var querystring = require('querystring');


module.exports = {
    // 模块介绍
    summary: '微信公众号抓取',
    // 发送请求前拦截处理
    //*beforeSendRequest(requestDetail) { /* ... */ },
    // 发送响应前处理
    *beforeSendResponse(requestDetail, responseDetail) {

        try {
            // 过滤下请求不成功的连接
            if(responseDetail.response.statusCode != 200) {
                return;
            }
            // 查看历史消息页面
            if(/mp\/profile_ext\?action=home/i.test(requestDetail.url)){
                combProfileData(responseDetail.response.body.toString())
                return;
            }

        } catch (e) {
            console.log("抓取异常, 错误信息如下")
            console.log(e)
        }
    },
    // 是否处理https请求
    //*beforeDealHttpsRequest(requestDetail) { /* ... */ },
    // 请求出错的事件
    *onError(requestDetail, error) { /* ... */ },
    // https连接服务器出错
    *onConnectError(requestDetail, error) { /* ... */ }
};

// 转义符换成普通字符
function escape2Html(str){
    const arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
}
// 整理文章
function combArticles(content, biz) {
    content = JSON.parse(escape2Html(content).replace(/\\\//g,'/'));
    content = content.list;
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

function combProfileData(serverResData) {
    var woa = {};
    console.log("==============================")

    // 解析公众号的数据
    woa.nickname = /var nickname = "(.+?)"/.exec(serverResData)[1];
    woa.headimg = /var headimg = "(.+?)"/.exec(serverResData)[1];
    woa.biz = /var __biz = "(.+?)"/.exec(serverResData)[1];
    woa.crawlTime = new Date().getTime();

    // 解析文章列表数据
    var msgList = /var msgList = '(.+)';\n/.exec(serverResData)[1];
    woa.articles = combArticles(msgList, woa.biz);

    reportData(woa, '/spider/report');


    console.log("==============================")
}

function reportData(data, path) {
    //console.log(data);

    var post_data = querystring.stringify({
        content: JSON.stringify(data)
    });

    //1、创建消息
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
