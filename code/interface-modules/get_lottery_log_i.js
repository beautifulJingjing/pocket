/**
 * Created by shengaozhou on 2016/2/26.
 *  获奖列表
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     lid：活动id;
 *     phone：手机号码，无手机号码时返回整个活动的中奖列表，有手机号码时返回该号码的抽奖记录;
 *     start：起始读取记录，从0开始，缺省=1;
 *     records：读取记录数，设为-1时为读取所有记录，缺省=-1;
 *   },
 *   success(JSON): 成功完成时触发,
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var cache = require('../cache');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'act_get_lotterylog';

    var cachekey = cache.key(data);
    cache.get(cachekey, function (err, result) {
        if (result) {
            if (option.success)
                option.success(JSON.parse(result));
        }
        else {
            helper.call({
                req: option.req,
                data: data,
                success: function (rec) {
                    rec = JSON.parse(rec);
                    if (rec.code == 1) {
                        result = {
                            list: rec.data.list,
                            count: rec.data.total_count
                        };
                        if (option.success)
                            option.success(result);
                        trace.interface({
                            req: option.req,
                            name: 'act_get_lotterylog',
                            params: data
                        });
                        //写缓存, 不论有无数据
                        cache.set(cachekey, JSON.stringify(result));
                    }
                    else {
                        var err = new Error(rec.msg);
                        err.code = rec.code;

                        if (option.error) option.error(err);
                        else console.error(err);
                        trace.error({
                            req: option.req,
                            name: 'act_get_lotterylog',
                            params: data,
                            msg: err
                        });
                    }
                },
                error: option.error
            });
        }
    });
};