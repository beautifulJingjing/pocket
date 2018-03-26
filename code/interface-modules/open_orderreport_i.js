/**
 * Created by shengaozhou on 2016/2/29.
 *  开通DIY功能报告，江苏安讯开通接口在使用
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     phone: 手机号
 *     orderid： 订购产品，-1-预订购，0000000764、0000000809等
 *     isrsms：预订购时是否发送短信（缺省=0）
 *     isosms：正式订购时是否发送短信（缺省=0）
 *     isqsms：回复确认短信（缺省=0）
 *   },
 *   success: 成功完成时触发,无参数
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'open_orderreport';

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            var err;
            rec = JSON.parse(rec);
            if (rec.code != 1) {
                err = new Error(rec.msg);
                err.code = rec.code;
            }
            else if (parseInt(rec.data.res) != 1) {
                err = new Error(rec.data.resmsg);
                err.res = rec.data.res;
            }
            else {
                if (option.success)
                    option.success();

                trace.interface({
                    req: option.req,
                    name: 'open_orderreport',
                    params: data
                });
                return;
            }
            if (option.error) option.error(err);
            else console.error(err);

            trace.error({
                req: option.req,
                name: 'open_orderreport',
                params: data,
                msg: err
            });
        },
        error: option.error
    });
};
