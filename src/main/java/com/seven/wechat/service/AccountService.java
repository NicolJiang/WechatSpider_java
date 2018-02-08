package com.seven.wechat.service;

import com.seven.core.IBaseService;
import com.seven.wechat.bean.Account;
import com.seven.wechat.bean.ReportModel;

/**
 * 
 * @author seven
 *
 */
public interface AccountService extends IBaseService<Account> {

    void batchSave(ReportModel model);
}
