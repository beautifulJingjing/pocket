/**
 * Created by shengaozhou on 2016/2/29.
 *  用户信息绑定
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     uid: 绑定用户ID；
 *     info：绑定内容；
 *     type：内容类型，1-手机号，2X-微博（21-新浪微博，22-腾讯微博），3-QQ（33-微信）；
 *     operating：0-解除绑定，1-绑定；
 *   },
 *   success(true): 绑定成功触发,
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'user_binding';

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
                    name: 'user_binding',
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
                    name: 'user_binding',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};
