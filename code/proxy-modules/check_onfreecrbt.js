/**
 * Created by XUER on 2016-3-6.
 * 检查能否参加0元彩铃
 */
"use strict";

var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    var data = {};
    if (typeof query.phone == 'string') {
        query.phone = query.phone.trim();
        if (CONST.PHONE_REGEX.test(query.phone)) {
            data.phone = query.phone;
        }
        else {
            res.send({
                s: 0,
                msg: '参数错误！'
            });
        }
    }

    business.isCrbtFreeSupport({
        req: req,
        data: data,
        callback: function (isSupport) {
            res.send({
                s: isSupport ? 1 : 0
            });
        }
    });
}