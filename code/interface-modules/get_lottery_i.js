/**
 * Created by shengaozhou on 2016/2/26.
 * 抽奖
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     lid：活动id;
 *     phone：手机号码;
 *     checkcode（缺省为空）：效验码
 *   },
 *   success(JSON): 成功完成时触发{
 *     code: 结果
 *     res_str：中奖内容;
 *     valid_count：可用抽奖次数;
 *   },
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'act_lottery';

    helper.call({
        req: option.req,
        data: data,
        success: function(rec) {
            rec = JSON.parse(rec);
            if (rec.code == 0) {
                var err = new Error(rec.msg);
                err.code = rec.code;

                if(option.error) option.error(err);
                else console.error(err);
                trace.interface({
                    req: option.req,
                    name: 'act_lottery',
                    params: data
                });
            }
            else if(rec.code == -4){
                if (option.success)
                    option.success(rec);
                trace.interface({
                    req: option.req,
                    name: 'act_lottery',
                    params: data
                });
            }
            else {
                rec.data.code = rec.code;
                rec = rec.data;
                if (option.success)
                    option.success(rec);
                trace.error({
                    req: option.req,
                    name: 'act_lottery',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};