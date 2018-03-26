/**
 * Created by majun on 2016/8/25.
 * 榜单/专题内容列表
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     pid：榜单id（特殊id -1：最新，-2：最热，-3：背景音，-4：DIY素材）;
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

exports.get_ringlist = function (option) {
    var data = option.data || {};
    data.service = 'get_ring_list';
    var i = data.i||0;
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
                            i:i,
                            list: rec.data.list,
                            count: rec.data.total_count
                        };
                        if (option.success)
                            option.success(result);
                        //写缓存
                        if (result.list && result.list.length > 0) cache.set(cachekey, JSON.stringify(result));
                    }
                    else {
                        var err = new Error(rec.msg);
                        err.code = rec.code;

                        if (option.error) option.error(err);
                        else console.error(err);
                    }
                },
                error: option.error
            });
        }
    });
}

//exports = module.exports = function(req, res, next) {
//    var param = req.query || req.body;
//    delete param.cmd;
//    param.service = 'get_ring_list';
//    if (!param.records) param.records = 20;
//    var cachekey = cache.key(param);
//    var out = cache.get(cachekey);
//    if(out){
//        res.send(out);
//    }
//    else {
//        helper.call(param, function (apiRes) {
//            /* 方法一：管道直接输出
//             res.setHeader("Content-Type", "text/json; charset=UTF-8");
//             apiRes.pipe(res);
//             /*******/
//            /* 方法二: response.write分块输出
//             res.setHeader("Content-Type", "text/json; charset=UTF-8");
//             apiRes.on('data', function (chunk) {
//             res.write(chunk);
//             });
//             apiRes.on('end', function(){
//             res.end();
//             });
//             /*******/
//            var rec = '';
//            apiRes.setEncoding('utf8');
//            apiRes.on('data', function (chunk) {
//                rec += chunk;
//            });
//            apiRes.on('end', function () {
//                rec = JSON.parse(rec);
//                out = {
//                    s: 0,
//                    data: {}
//                };
//                if (rec.code == 1) {
//                    out.s = 1;
//                    out.data.list = rec.data.list;
//                    out.data.count = rec.data.total_count;
//                    if (out.data.list.length > 0)
//                        //写缓存
//                        cache.set(cachekey, out);
//                }
//                res.send(out);
//            });
//        });
//    }
//};
