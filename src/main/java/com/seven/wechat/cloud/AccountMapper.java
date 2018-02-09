package com.seven.wechat.cloud;

import com.baomidou.mybatisplus.mapper.BaseMapper;
import com.seven.wechat.bean.Account;
import org.apache.ibatis.annotations.Param;

/**
 * 
 * @author seven
 *
 */
public interface AccountMapper extends BaseMapper<Account> {

    void replaceInsert(@Param("bean") Account parent);
}
