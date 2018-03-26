/**
 * Created by shengaozhou on 2016/2/29.
 *  号码运营商校验
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     uid:用户ID
 *   },
 *   success(JSON): 成功完成时触发,
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'phonechecked';

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                if (option.success)
                    option.success(true);
                trace.interface({
                    req: option.req,
                    name: 'phonechecked',
                    params: data
                });
            }
            else {
                var err = new Error(rec.msg);
                err.code = rec.code;
                err.msg = rec.msg;

                if (option.error) option.error(err);
                else console.error(err);

                trace.error({
                    req: option.req,
                    name: 'phonechecked',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};
