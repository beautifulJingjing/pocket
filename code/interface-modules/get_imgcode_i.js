/**
 * Created by majun on 2016/7/29.
 *  获取图片验证码
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     mobile:手机号
 *     type(可缺省):用途，0(默认)-绑定手机;1-订购;2-退订;3-预付费;4-集团炫铃;5-母亲节活动
 *   },
 *   success(string): 成功完成时触发, 返回短信验证码,部分用途无返回,
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'getcaptcha';
    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                if (option.success)
                    option.success(rec.data.value || '');

                trace.interface({
                    req: option.req,
                    name: 'getcaptcha',
                    params: data
                });
            }
            else {
                var err = new Error(rec.msg);
                err.code = rec.code;

                if(option.error) option.error(err);
                else console.error(err);

                trace.error({
                    req: option.req,
                    name: 'getcaptcha',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};