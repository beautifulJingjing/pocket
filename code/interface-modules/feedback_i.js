/**
 * Created by shengaozhou on 2016/2/24.
 *  意见反馈
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     content：反馈内容
 *     usercode：用户标识
 *     ver：应用版本号
 *   },
 *   success(true): 反馈成功时触发,
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'feedback';

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
                    name: 'feedback',
                    params: data
                });
            }
            else {
                var err = new Error(rec.msg);
                err.code = rec.code;

                if (option.error)
                    option.error(err);
                trace.error({
                    req: option.req,
                    name: 'feedback',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};
