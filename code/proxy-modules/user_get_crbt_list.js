/**
 * 获取个人铃音库列表
 *  type：类型（1 查询铃音设置库数据 2 查询运营商数据，并更新铃音设置库数据）;
 *  start：起始读取记录，从0开始，缺省=1;
 *  records：读取记录数，设为-1时为读取所有记录，缺省=-1;
 */
"use strict";

var interfaces = require('../interface-modules/index');

exports = module.exports = function(option) {
    var req = option.req;
    var current = req.current;
    var res = req.res;
    var query = extend({}, req.query || req.body);
    delete query.cmd;
    if (!query.hasOwnProperty('start')) query.start = 0;
    if (!query.hasOwnProperty('records')) query.records = 10;
    query.uid = current.user().id;
    //query.uid = 2;
    option.params = query;
    interfaces.user_get_crbt_list({
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
