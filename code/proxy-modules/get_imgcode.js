/**
 * Created by majun on 2016/3/3.
 * 获取验证码
 */
"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(option) {
    var req = option.req;
    var res = req.res;
    var query = extend({}, req.method == 'POST' ? req.body : req.query);
    try {
        if (typeof query.phone == 'string') query.phone = query.phone.trim();
        if (!query.phone) throw new Error('请输入您的手机号码。');

        if (CONST.MOBILE_PHONE_REGEX.test(query.phone) ) {
            interfaces.get_imgcode({
                req: req,
                data: {
                    cphone:query.phone
                },
                success: function (url) {
                    res.send({
                        s: 1,
                        url: url
                    });
                },
                error: function (e) {
                    res.send({
                        s: 0,
                        msg: e.message
                    });
                }
            });
        }else{
            res.send({
                s: 0,
                msg: '非移动号码'
            });
        }

    }
    catch (e) {
        res.send({
            s: 0,
            msg: e.message
        });
    }
}