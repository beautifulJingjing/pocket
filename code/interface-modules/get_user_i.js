/**
 * Created by shengaozhou on 2016/2/29.
 *  用户登录/注册
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     type：登录类型：1-设备标识码登录，2-手机号登录，3-用户名/密码，4-新浪微博登录，5-QQ，6-微信
 *     userinfo：登录信息
 *     autoregister（可缺省）：当用户不存在时，是否自动注册：0-不注册（默认），1-注册
 *     ischeckorder（可缺省）：是否与运营商同步号码状态：0-否（默认），1-是
 *   },
 *   success(JSON): 成功完成时触发,返回用户信息
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'login';

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                if (option.success)
                    option.success(rec.data);

                // trace.interface({
                //     req: option.req,
                //     name: 'login',
                //     params: data
                // });
            } else {
                var err = new Error(rec.msg);
                err.code = rec.code;

                if (option.error) option.error(err);
                else console.error(err);

                trace.error({
                    req: option.req,
                    name: 'login',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};
