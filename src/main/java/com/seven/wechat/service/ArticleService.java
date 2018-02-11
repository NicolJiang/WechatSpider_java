package com.seven.wechat.service;


import com.seven.core.IBaseService;
import com.seven.wechat.bean.Article;

import java.util.List;

/**
 * 
 * @author seven
 *
 */
public interface ArticleService extends IBaseService<Article> {

    void batchSave(List<Article> articles);

    void updateContent(Article article);

    void updateReadAndLikeNum(Article article);
}
