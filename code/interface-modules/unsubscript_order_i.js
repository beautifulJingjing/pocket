/**
 * Created by shengaozhou on 2016/2/29.
 *  退订DIY
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     uid（可缺省）:用户ID，缺省时phone必不为空
 *     phone（可缺省）: 手机号
 *   },
 *   success(JSON): 成功完成时触发, {
 *      unsubscript（true）: 退订结果
 *      orderstate: 退订后会员状态
 *      orderendtime: 退订后会员到期时间
 *   }
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'unsubscribe_ringset_order';

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            var err;
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                rec = rec.data;
                if (parseInt(rec.res) == 1 || parseInt(rec.res) == 1012 || parseInt(rec.res) == 1013) {
                    switch (parseInt(rec.orderstate)) {
                        case 1:
                        case 2:
                        case 3:
                            if (parseInt(rec.orderendtime) == -1) {
                                if (parseInt(rec.orderstate) == 2) rec.orderstate = 2;
                                else rec.orderstate = 0;
                            }
                            else rec.orderstate = 3;
                            break;
                        case 0:
                        case 4:
                        case 5:
                        case 6:
                            rec.orderstate = 4;
                            break;
                    }
                    if (option.success)
                        option.success({
                            unsubscript: trace,
                            orderstate: rec.orderstate,
                            orderendtime: rec.orderendtime,
                            res: rec.res,
                            msg: rec.message
                        });
                    trace.interface({
                        req: option.req,
                        name: 'unsubscribe_ringset_order',
                        params: data
                    });
                    return;
                }
                else {
                    err = new Error(rec.message);
                    err.res = rec.res;
                }
            }
            else {
                err = new Error(rec.msg);
                err.code = rec.code;
            }
            if (option.error) option.error(err);
            else console.error(err);
            trace.error({
                req: option.req,
                name: 'unsubscribe_ringset_order',
                params: data,
                msg: err
            });
        },
        error: option.error
    });
};

