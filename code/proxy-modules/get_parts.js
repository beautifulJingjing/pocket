/**
 * 榜单/专题列表
 * type：类型（支持多选以","分隔）:1-专题,2-榜单,3-分类,4-在线素材;
 * pid：专题id（此参数不为空时，参数type不起作用），缺省=空;
 * w：图片高度,可缺省;
 * h：图片宽度,可缺省;
 * start：起始读取记录，从0开始，缺省=0;
 * records：读取记录数，设为-1时为读取所有记录，缺省=-1;
 */
"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(options) {
    var req = options.req,
        res = req.res;
    var params = extend({}, req.query || req.body);
    delete params.cmd;
    if (params.w) {
        params.picwide = params.w;
        delete params.w;
    }
    if (params.h) {
        params.pichigh = params.h;
        delete params.h;
    }
    if (!params.hasOwnProperty('start')) params.start = 0;
    if (!params.hasOwnProperty('records')) params.records = 20;
    options.params = params;
    interfaces.get_parts({
        req: req,
        data: params,
        success: function (data) {

            res.send({
                s: 1,
                data: data
            });
        },
        error: function (err) {
            res.send({
                s: 0,
                msg: err.msg
            });
        }
    });
};