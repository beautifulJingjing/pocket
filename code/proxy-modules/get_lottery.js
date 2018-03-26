/**
 * Created by shengaozhou on 2016/2/26.
 * 抽奖
 *   lid：活动id;
 *   phone：手机号 *   checkcode（缺省为空）：效验码
 */
"use strict";

var interfaces = require('../interface-modules');
var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        res = req.res;
    var query = extend({}, req.method == 'POST' ? req.body : req.query);
    if(typeof query.phone === 'string') query.phone = query.phone.trim();
    if (!query.phone)
        res.send({
            s: 0,
            msg: '请输入手机号码！'
        });
    else {
        //检查是否DIY会员
        business.isOrder({
            req: req,
            data: {phone: query.phone},
            callback: function (r) {
                if (r) {
                    //是会员，去抽奖
                    delete query.cmd;
                    interfaces.get_lottery({
                        req: req,
                        data: query,
                        success: function (data) {
                            if(data.code == -4){
                                res.send({
                                    s: -4,
                                    msg: data.msg
                                })
                            }
                            else{
                                res.send({
                                    s: data.code,//-1:抽奖机会已用完
                                    data: data.res_str,
                                    validcount: data.valid_count
                                });
                            }
                        },
                        error: function (err) {
                            res.send({
                                s: 0,
                                msg: err.message
                            });
                        }
                    });
                }
                else
                    res.send({
                        s: -3,
                        msg: '您还没有抽奖机会，只有彩铃DIY会员才可参与抽奖哦。'
                    });
            }
        });
    }
};
