/**
 * Created by shengaozhou on 2016/2/29.
 *  查询用户运营商彩铃状态
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     phone（可缺省）:手机号,优先级高于uid
 *     uid（可缺省）:用户ID，无此参数时，phone不能为空
 *     isgetgtype（可缺省）:是否查询号码类型，0-否（默认），1-是
 *   },
 *   success(JSON): 成功完成时触发,
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
= */
"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'get_user_crbt_state';

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                if (option.success)
                    option.success(rec.data);
                trace.interface({
                    req: option.req,
                    name: 'get_user_crbt_state',
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
                    name: 'get_user_crbt_state',
                    params: data,
                    msg: err
                })
            }
        },
        error: option.error
    });
};
