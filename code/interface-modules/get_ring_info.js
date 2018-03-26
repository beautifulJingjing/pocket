/**
 * Created by shengaozhou on 2016/2/24.
 *  获取铃音详细
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     ringid:铃音id
 *   },
 *   success(JSON): 成功完成时触发
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */

"use strict";
var helper = require('../helper');
var cache = require('../cache');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'get_ring_info';

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
                        result = rec.data;
                        if (option.success)
                            option.success(result);
                        //写缓存
                        if (result) cache.set(cachekey, JSON.stringify(result));
                        trace.interface({
                            req: option.req,
                            name: 'get_ring_info',
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
                            name: 'get_ring_info',
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