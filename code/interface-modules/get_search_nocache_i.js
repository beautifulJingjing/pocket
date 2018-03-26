/**
 * Created by 9sky on 2016/8/16.
 *  铃音搜索
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     key：关键字
 *     type：搜索范围，多选用“,”分隔，2-电信，3-移动，4-联通，6-个推；
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
    data.service = 'search_ring';

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                var result = {
                    list: rec.data.list,
                    count: rec.data.total_count
                };
                if (option.success)
                    option.success(result);

                trace.interface({
                    req: option.req,
                    name: 'search_ring',
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
                    name: 'search_ring',
                    params: data,
                    msg: err
                });

            }
        },
        error: option.error
    });
};
