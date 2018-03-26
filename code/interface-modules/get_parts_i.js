/**
 * 榜单/专题列表
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     type：类型（支持多选以","分隔）:1-专题,2-榜单,3-分类,4-在线素材;
 *     pid：专题id（此参数不为空时，参数type不起作用），缺省=空;
 *     picwide：图片高度,可缺省;
 *     pichigh：图片宽度,可缺省;
 *     pictype：图片类型，0-普通(缺省)，1-默认，2-ios默认，3-androi默认，4-PC默认；
 *     start：起始读取记录，从0开始，缺省=0;
 *     records：读取记录数，设为-1时为读取所有记录，缺省=-1;
 *   },
 *   success(JSON): 成功完成时触发
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var cache = require('../cache');
var trace = require('../trace');
var ringlist = require('./get_ringlist_exp_i');
exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'get_part_list';

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
                        if(data.type == 2){
                            var c_num = rec.data.list.length;
                            for(var i = 0;i < rec.data.list.length;i++){
                                var p_id = rec.data.list[i].pid;  //获得榜单ID
                                ringlist.get_ringlist({         //循环获取每个榜单ID下的三首歌曲列表
                                    req: option.req,
                                    data: {
                                        start: 0,
                                        records: 3,
                                        pid: p_id,
                                        i:i
                                    },
                                    success: function (_data) {
                                        extend(rec.data.list[_data.i],{rlistdata: _data.list});
                                        c_num--;
                                    }
                                });
                            }
                            var timer = 8000;
                            var wait = setInterval(function () {
                                timer = timer-500;
                                if (c_num <= 0||timer<= 0) {
                                    clearInterval(wait);
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
                                        name: 'get_part_list',
                                        params: data
                                    });
                                }
                            }, 500);
                        }
                        else{
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
                                name: 'get_part_list',
                                params: data
                            });
                        }

                    }
                    else {
                        var err = new Error(rec.msg);
                        err.code = rec.code;

                        if (option.error) option.error(err);
                        else console.error(err);
                        trace.error({
                            req: option.req,
                            name: 'get_part_list',
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