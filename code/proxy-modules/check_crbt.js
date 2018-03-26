/**
 * Created by XUER on 2016-3-6.
 * 检查彩铃状态
 */
"use strict";

var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        current = req.current,
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
            return;
        }
    }
    else if (!current.isLogin()){ //未登录直接返回
        res.send({
            s: -10,
            msg: '无登录状态！'
        });
        return;
    }

    business.isCrbt({
        req: req,
        data: data,
        callback: function (isCrbt) {
            if (isCrbt)
                res.send({
                    s: 1
                });
            else {
                business.isCrbtOpening({
                    req: req,
                    callback: function (isOpening) {
                        res.send({
                            s: isOpening ? 31 : 0
                        });
                    }
                });
            }
        }
    });
}
