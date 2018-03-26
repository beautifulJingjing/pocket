/**
 * Created by shengaozhou on 2016/2/26.
 *  查询抽奖机会
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     lid：活动id;
 *     phone：手机号码;
 *   },
 *   success(JSON): 成功完成时触发{
 *     valid_count：可用次数;
 *     valid_count2：猜铃后抽奖次数;
 *   },
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'act_lottery_num';

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
                    name: 'act_lottery_num',
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
                    name: 'act_lottery_num',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};