/**
 * Created by majun on 2016/8/30.
 * * option={
 *   req: 客户端请求对象,
 *   data: {
 *     type：类型  0 推荐歌手
 *     start：起始读取记录，默认从0开始;
 *     records：读取记录数，-1(默认)时为读取所有记录;
 *   },
 *   success(JSON): 成功完成时触发{
 *     list: 结果列表
 *     count：符合记录总数
 *   },
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var cache = require('../cache');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'get_taglist';

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
                        //写缓存
                        if (result.list && result.list.length > 0) cache.set(cachekey, JSON.stringify(result));
                        trace.interface({
                            req: option.req,
                            name: 'get_taglist',
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
                            name: 'get_taglist',
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
