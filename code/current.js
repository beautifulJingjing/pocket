/**
 * Created by LXP on 2016/2/26.
 * 用户相关
 */
"use strict";

function createCurrent(request) {

//当前SPInfoCode
    this.spinfocode = function (val) {
        if (arguments.length > 0) request.session.spinfocode = val;
        else {
            var spinfocode =
                request.query.spinfocode ||
                request.body.spinfocode ||
                request.session.spinfocode || CONST.SPINFOCODE||'00000550255';
            //排除短信地址链接带上短信内容问题
            if (/[^\d]+/.test(spinfocode))
                spinfocode = spinfocode.substr(0, 11);
            return spinfocode;
        }
    }

//是否登录状态,无手机号、非联通号且非DIY的登录认为是未登录
    this.isLogin = function () {
        var u = this.user();
        //如微信登录未绑定手机号认为未登录
        if (u&&u.token) {

        } else {
            if (!u || !u.id || !u.phone)
                return false;
        }
        //非联通号码非会员状态认为未登录
        if(!CONST.UNICOM_PHONE_REGEX.test(u.phone))
            return parseInt(u.orderstate) !== 4;
        return true;
    }

//登录状态，val=JSON，=null清理
    this.user = function (val) {
        if (arguments.length > 0) request.session.USER = val;
        else return request.session.USER;
    }

//到达标识，val=boolean
    this.visit = function (val) {
        if (arguments.length > 0) request.session.VISIT = val;
        else return request.session.VISIT;
    }

//透传key, val=string
    this.comkey = function (val) {
        if (arguments.length > 0) request.session.COMKEY = val;
        else return request.session.COMKEY;
    }

//透传结果状态，val=1-透传到号码，2-参数带号码，3-头信息带号码，0-无号码
    this.comkeyStatus = function (val) {
        if (arguments.length > 0) request.session.COMKEY_STATUS = val;
        else return request.session.COMKEY_STATUS;
    }

//DIY开通失败标识，长期cookie, val=boolean
    this.isOpenOrderFail = function (val) {
        if (this.isLogin()) {
            //session同时写，不写session，cookie未写回时返回值错误
            var cookiename = 'order-openfail-' + this.user().phone;
            if (arguments.length > 0) {
                if (val) {
                    request.session[cookiename] = val;
                    //request.res.cookie(cookiename, val);
                }
                else {
                    request.session[cookiename] = null;
                    //request.res.clearCookie(cookiename);
                }
            }
            else {
                val = request.session[cookiename];
                //if (!val) val = request.cookies[cookiename];
                return val;
            }
        }
        else return false;
    }

//彩铃状态缓存，避免彩铃状态、0元开通检查时重复调用，彩铃开通接口调用时需要清理，val=JSON, =null清理
    this.crbtState = function (val) {
        if (arguments.length > 0) request.session.CRBT_STATE = val;
        else return request.session.CRBT_STATE;
    }

// 彩铃开通等待标识,24小时cookie，用于开通成功查询未开通时的处理，val=boolean
    this.isOpenCrbtWaiting = function (val) {
        if (this.isLogin()) {
            var cookiename = 'crbt-openwait-' + this.user().phone;
            if (arguments.length > 0) {
                if (val) {
                    request.session[cookiename] = val;
                    var exp = new Date();
                    exp.setHours(exp.getHours() + 24);
                    //request.res.cookie(cookiename, val, {expires: exp});
                }
                else {
                    request.session[cookiename] = null;
                    //request.res.clearCookie(cookiename);
                }
            }
            else{
                val = request.session[cookiename];
                //if (!val) val = request.cookies[cookiename];
                return val;
            }
        }
        else return false;
    }

//获取X-Forwarded-For内的IP
    this.ip = function () {
        return request.headers['x-forwarded-for'] || request.ip;
    }

//是否微信浏览器
    this.isMicroMessenger = function () {
        return request.headers['user-agent'].indexOf('MicroMessenger') > -1;
    }
}

exports.create = createCurrent;