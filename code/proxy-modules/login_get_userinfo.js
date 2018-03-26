/**
 * Created by majun on 2017/3/1.
 * 通过登录获得用户信息
 */
"use strict";
var interfaces = require('../interface-modules');
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
    var result = {};
    if(current.isLogin()){
        business.login({
            req: req,
            data: {
                userinfo: query.phone,
                type: 2
            },
            callback: function () {
                if(current.user().orderstate!=4) {  //会员
                    result = {
                        s: 1,
                        data: req.current.user()
                    };
                    res.send(result);
                }
                else {//非会员
                    result = {
                        s: -1003,
                        data: req.current.user()
                    };
                    res.send(result);
                }
            },
            error: function (err) {
                result = {
                    s: -1002,
                    msg: err.message
                };
                res.send(result);
            }
        });
    }
    else{
        if(!current.user()){
            res.send({
                s: -10,
                msg: '尚未登录！'
            });
        }else{
            res.send({
                s: -11,
                msg: '已登录，未开通会员',
                data:current.user()
            });
        }
    }

}


