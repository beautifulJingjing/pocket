/**
 * Created by shengaozhou on 2016/2/26.
 *  查询抽奖机会
 *  lid：活动id;
 *  phone：手机号码;、
 */
"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(options) {
    var req = options.req,
        res = req.res;
    var param = extend({}, req.query || req.body);
    delete param.cmd;
    if(typeof param.phone === 'string') param.phone = param.phone.trim();
    if (!param.phone)
        res.send({
            s: 0,
            msg: '请输入手机号码！'
        });
    else if (!options.user.isOrder({phone: param.phone}))
        res.send({
            s: -3,
            msg: '您还没有抽奖机会，只有彩铃DIY会员才可参与抽奖哦。'
        });
    else {
        options.params = param;
        interfaces.get_lottery_num({
            req: req,
            data: params,
            success: function (data) {
                res.send({
                    s: 1,
                    data: data.valid_count
                });
            },
            error: function (err) {
                res.send({
                    s: 0,
                    msg: err.msg
                });
            }
        });
    }
};
