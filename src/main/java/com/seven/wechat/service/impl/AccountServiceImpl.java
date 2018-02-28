package com.seven.wechat.service.impl;

import com.baomidou.mybatisplus.toolkit.IdWorker;
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
 * @author 最爱吃小鱼
 *
 */
@Service
public class AccountServiceImpl extends BaseServiceImpl<AccountMapper, Account> implements AccountService {

    @Autowired
    ArticleService articleService;

    @Override
    @Async("reportTaskExecutor")
    @Transactional(rollbackFor = Exception.class)
    public void batchSave(ReportModel model) {
        if (model == null) {
            return;
        }
        Account account = model.parent();
        account.setId(IdWorker.getId());
        baseMapper.replaceInsert(account);
        articleService.batchSave(model.getArticles());
    }
}
