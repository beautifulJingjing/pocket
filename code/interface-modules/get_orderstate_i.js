/**
 * Created by shengaozhou on 2016/2/29.
 *  用户付费状态查询
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
    data.service = 'get_user_orderstate';

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                rec = rec.data;
                switch (parseInt(rec.orderstate)) {
                    case 1:
                        rec.orderstate = 0;
                        break;
                    case 2:
                    case 3:
                        if (parseInt(rec.orderendtime) == -1) rec.orderstate = 2;
                        else rec.orderstate = 3;
                        break;
                    case 0:
                    case 4:
                    case 5:
                        rec.orderstate = 4;
                        break;
                    case 6:
                        rec.orderstate = 1;
                        break;
                }
                if (option.success)
                    option.success(rec);
                trace.interface({
                    req: option.req,
                    name: 'get_user_orderstate',
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
                    name: 'get_user_orderstate',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};
