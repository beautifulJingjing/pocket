"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.spinfocode = CONST.SPINFOCODE;
    data.service = 'noticeOther';
    helper.call({
        req: option.req,
        data: data,
        success: function(rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                if (option.success)
                    option.success(rec);
                trace.interface({
                    req: option.req,
                    name: 'notice_other',
                    params: data
                });
            }
            else {
                var err = new Error(rec.msg);
                err.code = rec.code;

                if (option.error)
                    option.error(err);
                trace.error({
                    req: option.req,
                    name: 'notice_other',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};