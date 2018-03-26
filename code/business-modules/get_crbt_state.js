/**
 * Created by LXP on 2016/3/1.
 * 查询用户运营商彩铃状态并缓存
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     phone（可缺省）:手机号，优先级高于uid;
 *     uid（可缺省）:用户ID，无此参数时，使用当前uid;
 *     isgetgtype（可缺省）:是否查询号码类型，0-否，1-是，根据配置，0元彩铃默认值1，否则0
 *     iscache（可缺省）：是否从缓存取，默认true, 只在查询当前用户时有效
 *   },
 *   callback(JSON): 结果回调方法，JSON可能为null，
 *   error(Error):有错误触发，缺省时触发callback
 */
"use strict";

var interfaces = require('../interface-modules');

function getCrbtState(option) {
    var req = option.req,
        current = req.current,
        config = req.config;

    var data = option.data || {};
    if (typeof data.phone === 'string') data.phone = data.phone.trim();
    if (typeof data.uid === 'string') data.uid = data.uid.trim();
    if (!data.hasOwnProperty('iscache')) data.iscache = true;

    var crbtState;
    if (data.phone) delete data.uid;
    else if (!data.uid) {
        //phone、uid都没有，用当前登录用户id
        if (current.isLogin()) {
            data.uid = current.user().id;
            delete data.phone;
            if (data.iscache)
                crbtState = current.crbtState();//从session取彩铃状态
        }
        else {//未登录直接返回
            var err = new Error('无登录状态');
            if (option.error) option.error(err);
            else {
                if (option.callback)option.callback(null);
                console.error(err)
            }
            return;
        }
    }
    if (!crbtState || crbtState.phone !== data.phone || crbtState.uid !== data.uid) {
        if (!data.hasOwnProperty('isgetgtype')) {
            if (config.crbt.mode.toString() == '2') data.isgetgtype = 1;
            else data.isgetgtype = 0;
        }
        interfaces.get_crbtstate({
            req: req,
            data: data,
            success: function (r) {
                if (data.phone) r.phone = data.phone;
                else r.uid = data.uid;
                current.crbtState(r);//彩铃状态写session
                if (option.callback)
                    option.callback(r);
            },
            error: function (err) {
                if (option.error) option.error(err);
                else {
                    if (option.callback) option.callback(null);
                    console.error(err);
                }
            }
        });
    }
    else if (option.callback)
        option.callback(crbtState);
}

module.exports = getCrbtState;