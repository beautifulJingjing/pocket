/**
 * Created by shengaozhou on 2016/3/1.
 *  下发业务短信
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     uphone:手机号
 *   },
 *   success(true): 成功完成时触发
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var req = option.req;
    var data = option.data || {};
    data.service = 'send_business_sms';

    //2分钟内不重复发送短信
    var lastTime = new Date(req.session.SEND_BUSINESS_SMS);
    if (lastTime.setMinutes(lastTime.getMinutes() + 2) > new Date()) {
        if (option.success)
            option.success(true);
    }

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                if (option.success)
                    option.success(true);

                //记录发送时间
                option.req.session.SEND_BUSINESS_SMS = new Date();

                trace.interface({
                    req: option.req,
                    name: 'send_business_sms',
                    params: data
                });
            }
            else {
                var err = new Error(rec.msg);
                err.code = rec.code;

                if (option.error) option.error(err);
                else console.error(err);

                trace.error({
                    req: option.req,
                    name: 'send_business_sms',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};
