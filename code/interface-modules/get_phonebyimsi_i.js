/**
 * 获取手机号
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     unikey：识别码，为空时返回结果为unikey
 *     sptype：运营商，0-未知，1-移动，2-电信，3-联通（默认）;
 *   },
 *   success(string): 手机号或识别码,
 *   error(Error): 错误信息
 * }
 */
"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'getphonebyimsi';
    data.ipstr = option.req.current.ip().replace(/\./g, '_');

    if (isNaN(data.sptype)) data.sptype = 3; //缺省为联通
    if (typeof data.unikey == 'string') data.type = 1;
    else delete data.unikey;

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1 || rec.code == 2) {
                if (option.success)
                    option.success(rec.data.phone);
                trace.interface({
                    req: option.req,
                    name: 'getphonebyimsi',
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
                    name: 'getphonebyimsi',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};


