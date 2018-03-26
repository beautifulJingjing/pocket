/**
 * Created by LXP on 2016/2/24.
 * 获取手机号、且返回当前用户状态
 * unikey：识别码，为空时返回结果为unikey;
 * sptype（可缺省）：运营商，0-未知，1-移动，2-电信，3-联通（默认）;
 */
"use strict";

var url = require('url');
var interfaces = require('../interface-modules');
var business = require('../business-modules');
var phoneencry = require('../phoneencry');
var trace = require('../trace');


exports = module.exports = function (option) {
    //取用户信息前记录访问到达日志
    trace.visit(option);

    //开始取用户信息+
    var req = option.req,
        config = req.config,
        current = req.current,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    if(query.cancel){
        current.user(null);
        res.send(current.user()||{});
        return;
    }

    if (current.user()) {
        var _user = current.user();
        _user.ringinfo={};
        if(query.token){
            _user.token = query.token;
        }
        if(query.phone){
            _user.phone = query.phone;
        }
        if(query.orderstate){
            _user.orderstate = query.orderstate;
        }
        if(query.ringstate){
            _user.ringstate = query.ringstate;
        }
        if(query.smsconfirm){
            _user.smsconfirm = query.smsconfirm;
        }
        if(query.orderidD){
            _user.orderidD = query.orderidD;
        }
        current.user(_user);
        //qry state orderid
        /*if(_user.orderidD){
            current.user().orderidD = 0;
            res.send(current.user() || {});
        }
        else{*/
            res.send(current.user()||{});
            return;
        /*}*/
    }

    //if(query.token){//移动登录用户
    //    var user = {
    //        id: '1',
    //        phone: '',
    //        weixinid: '',
    //        orderstate: 4,
    //        smsconfirm: 0,
    //        orderendtime: '',
    //        setcrbtnum: '',
    //        ordernum: 0,
    //        token:query.token,
    //        ringstate:0,
    //        ringinfo:{}
    //    };
    //    current.user(user);//用户信息写session
    //    current.crbtState(null);//清理彩铃状态session
    //    res.send(current.user() || {});
    //
    //}else {
        if (config.getphone.toString() == '0') { //不自动取号
            res.send({});
            return;
        }

        if (config.getphone.toString() == '2') { //参数取号
            if (typeof query.a == 'string') query.a = query.a.trim();
            if (query.a) {
                var phone = phoneencry.encodePhone(query.a);
                if (phone) {
                    current.comkey(phone);
                    current.comkeyStatus(2);
                    //透传结果日志
                    trace.comkey({
                        req: req,
                        phone: phone
                    });
                    business.login({
                        req: req,
                        data: {
                            type: 2,
                            userinfo: phone,
                            unikey: current.comkeyStatus()
                        },
                        callback: function () {
                            res.send(current.user() || {});
                        }
                    });
                    return;
                }
            }
        }

        //透传取号
        current.comkey(true);//透传取号关停,默认置为已透传
        if (current.comkey()) {
            res.send(current.user() || {});
        }
        else {
            if (typeof query.unikey == 'string') query.unikey = query.unikey.trim();
            if (query.unikey) //写透传标识，有透传标识后不再进行透传
                current.comkey(query.unikey);

            //透传号码
            interfaces.get_phonebyimsi({
                req: req,
                data: {
                    unikey: query.unikey
                },
                success: function (phone) {
                    if (query.unikey) {
                        //透传结果日志
                        trace.comkey({
                            req: req,
                            phone: phone
                        });

                        //透传到号码处理
                        if (phone) {
                            phone = phone.replace('^(\\+)?(86)?', '');
                            if (/^145/.test(phone) || !/^1\d{10}$/.test(phone)) phone = null;
                        }
                        if (!phone) phone = query.test_mobile;
                        if (!phone) {
                            phone = req.headers['x-up-calling-line-id'];
                            if (phone)
                                res.send({phone: phone});
                            else
                                res.send({});
                        }
                        else {
                            current.comkeyStatus(1);
                            business.login({
                                req: req,
                                data: {
                                    type: 2,
                                    userinfo: phone,
                                    unikey: current.comkeyStatus()
                                },
                                callback: function () {
                                    res.send(current.user() || {});
                                }
                            });
                        }
                    }
                    else {
                        //透传日志
                        trace.comkey({req: req});

                        //生成透传地址，去透传
                        var dir = url.parse(req.originalUrl);
                        dir.query = {
                            unikey: phone,
                            spinfocode: current.spinfocode()
                        };
                        delete dir.search; //不删除将会替代query属性
                        res.redirect(url.format(dir));
                    }
                },
                error: function (err) {
                    res.send({});
                    console.error(err);
                }
            });
        }
    //}
};