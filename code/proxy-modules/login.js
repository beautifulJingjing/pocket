/**
 * Created by LXP on 2016/3/4.
 * 登录
 */
"use strict";

var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    if (typeof query.phone == 'string') query.phone = query.phone.trim();
    if (!CONST.PHONE_REGEX.test(query.phone)) {
        res.send({
            s: 0,
            msg: '请输入一个有效的手机号！'
        });
        return;
    }
    if (typeof query.checkcode == 'string') query.checkcode = query.checkcode.trim();
    if(!query.checkcode){
        res.send({
            s:0,
            msg:'请输入验证码！'
        });
        return;
    }

    business.checkCode.check({
        req: req,
        data: {
            phone: query.phone,
            checkcode: query.checkcode
        },
        callback: function () {
            business.login({
                req: req,
                data: {
                    userinfo: query.phone.replace(/^(\\+)?(86)?/, ''),
                    type: 2
                },
                callback: function () {
                    res.send({
                        s: 1,
                        data: req.current.user()
                    });
                },
                error: function (err) {
                    res.send({
                        s: 0,
                        msg: err.message
                    });
                }
            });
        },
        error: function (err) {
            res.send({
                s: 0,
                msg: err.message
            });
        }
    });
}