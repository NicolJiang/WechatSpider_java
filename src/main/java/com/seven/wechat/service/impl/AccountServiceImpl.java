package com.seven.wechat.service.impl;

import com.seven.core.BaseServiceImpl;
import com.seven.wechat.bean.Account;
import com.seven.wechat.bean.ReportModel;
import com.seven.wechat.cloud.AccountMapper;
import com.seven.wechat.service.AccountService;
import com.seven.wechat.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 *
 * @author seven
 *
 */
@Service
public class AccountServiceImpl extends BaseServiceImpl<AccountMapper, Account> implements AccountService {

    @Autowired
    ArticleService articleService;

    @Transactional(rollbackFor = Exception.class)
    @Async("reportTaskExecutor")
    @Override
    public void batchSave(ReportModel model) {
        insert(model.parent());
        articleService.insertBatch(model.getArticles());
    }
}
