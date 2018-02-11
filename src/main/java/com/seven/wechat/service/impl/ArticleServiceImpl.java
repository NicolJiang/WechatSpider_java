package com.seven.wechat.service.impl;

import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.baomidou.mybatisplus.toolkit.IdWorker;
import com.seven.core.BaseServiceImpl;
import com.seven.wechat.bean.Article;
import com.seven.wechat.cloud.ArticleMapper;
import com.seven.wechat.service.ArticleService;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


/**
 *
 * @author seven
 *
 */
@Service
public class ArticleServiceImpl extends BaseServiceImpl<ArticleMapper, Article> implements ArticleService {

    @Override
    @Async("reportTaskExecutor")
    @Transactional(rollbackFor = Exception.class)
    public void batchSave(List<Article> articles) {
        if (CollectionUtils.isEmpty(articles)) {
            return;
        }
        for (Article article : articles) {
            article.setId(IdWorker.getId());
            baseMapper.replaceInsert(article);
        }
    }

    @Override
    @Async("reportTaskExecutor")
    @Transactional(rollbackFor = Exception.class)
    public void updateContent(Article article) {
        Article bean = selectOne(new EntityWrapper<Article>().eq("biz", article.getBiz()).eq("mid", article.getMid()));
        if (bean == null) {
            return;
        }
        Article updateObj = new Article();
        updateObj.setId(bean.getId());
        updateObj.setContent(article.getContent());
        updateById(updateObj);
    }

    @Override
    @Async("reportTaskExecutor")
    @Transactional(rollbackFor = Exception.class)
    public void updateReadAndLikeNum(Article article) {
        Article bean = selectOne(new EntityWrapper<Article>().eq("biz", article.getBiz()).eq("mid", article.getMid()));
        if (bean == null) {
            return;
        }
        Article updateObj = new Article();
        updateObj.setId(bean.getId());
        updateObj.setReadNum(article.getReadNum());
        updateObj.setLikeNum(article.getLikeNum());
        updateById(updateObj);
    }
}
