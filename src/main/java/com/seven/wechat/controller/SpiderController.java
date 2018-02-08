package com.seven.wechat.controller;

import com.alibaba.fastjson.JSONObject;
import com.seven.wechat.bean.ReportModel;
import com.seven.wechat.service.AccountService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author 最爱吃小鱼
 */
@RestController
public class SpiderController {

    private Logger log = LoggerFactory.getLogger(SpiderController.class);

    @Autowired
    AccountService accountService;

    // 上传微信公众号信息及文章信息
    @RequestMapping("/spider/report")
    public void report(String content) {
        try {
            if (StringUtils.isBlank(content)) {
                return;
            }
            ReportModel model = JSONObject.parseObject(content, ReportModel.class);
            accountService.batchSave(model);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }
    }

}
