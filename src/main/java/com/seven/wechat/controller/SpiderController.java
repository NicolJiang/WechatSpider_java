package com.seven.wechat.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.seven.wechat.bean.Article;
import com.seven.wechat.bean.ReportModel;
import com.seven.wechat.service.AccountService;
import com.seven.wechat.service.ArticleService;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 最爱吃小鱼
 */
@RestController
public class SpiderController {

    private Logger log = LoggerFactory.getLogger(SpiderController.class);
    /**
     * 更新时将biz放入，更新截止时删除, lock保证发起的调用保持顺序执行
     */
    private final Map<String, Object> bizMap = new ConcurrentHashMap<>();

    @Autowired
    AccountService accountService;

    @Autowired
    ArticleService articleService;

    // 上传微信公众号信息及文章信息, 历史记录的第一页
    @RequestMapping("/spider/firstpage")
    public void firstpage(String biz, String content) {
        Object lock = new Object();
        synchronized (lock) {
            if (StringUtils.isBlank(content)) {

                return;
            }
            ReportModel model = JSONObject.parseObject(content, ReportModel.class);
            if (model == null) {
                return;
            }
            accountService.batchSave(model);
            bizMap.put(biz, lock);
        }
    }

    // 上传微信公众号信息及文章信息, 历史记录下拉数据
    @RequestMapping("/spider/nextpage")
    public void nextpage(String biz, String content) {
        Object lock = bizMap.get(biz);
        synchronized (lock) {
            if (StringUtils.isBlank(content)) {
                return;
            }
            List<Article> articles = JSONArray.parseArray(content, Article.class);
            if (CollectionUtils.isEmpty(articles)) {
                return;
            }
            articleService.batchSave(articles);
        }
    }



}
