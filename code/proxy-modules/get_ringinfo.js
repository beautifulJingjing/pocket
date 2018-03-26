/**
 * 榜单/专题内容列表
 * pid：榜单id（特殊id -1：最新，-2：最热，-3：背景音，-4：DIY素材）;
 * start：起始读取记录，从0开始，缺省=1;
 * records：读取记录数，设为-1时为读取所有记录，缺省=-1;
 */
"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(option) {
    var req = option.req,
        res = req.res;
    var query = req.method == 'POST' ? req.body : req.query;
    delete query.cmd;
    interfaces.get_ring_info({
        req: req,
        data: query,
        success: function (data) {
            res.send({
                s: 1,
                data: data
            });
        },
        error: function (err) {
            res.send({
                s: 0,
                msg: err.message
            });
        }
    });
};
