/**
 * Created by XUER on 2016-2-27.
 * 检查是否开通DIY
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     uid（可缺省）:用户ID;
 *     phone（可缺省）:手机号，uid、phone都没有时查当前用户
 *   },
 *   callback(boolean): 结果回调方法,
 *   error(Error):有错误触发，缺省时触发callback
 */

"use strict";

var interfaces = require('../interface-modules');

function isOrder(option) {
    var req = option.req;
    var current = req.current;
    var data = option.data ;
    if (typeof data.phone === 'string') data.phone = data.phone.trim();
    if (typeof data.uid === 'string') data.uid = data.uid.trim();
    if (data.phone) {
        //通过手机号查DIY状态
        interfaces.get_user({
            req: req,
            data: {
                userinfo: data.phone,
                type: 2,
                autoregister:1
            },
            success: function (r) {
                //是当前用户，更新状态
                //var u = current.user();
                //if (u && u.phone === data.phone) {
                //    u.orderstate = r.orderstate;
                //    u.orderendtime = r.orderendtime;
                //}
                if (option.callback)
                    option.callback(r.orderstate !== 4);
            },
            error: function (err) {
                if (option.error) option.error(err);
                else {
                    if (option.callback) option.callback(false);
                    console.error(err);
                }
            }
        });
    }
    else if (data.uid) {
        interfaces.get_orderstate({
            req: req,
            data: {
                uid: data.uid
            },
            success: function (r) {
                //是当前用户，更新状态
                var u = current.user();
                if (u && u.id.toString() === data.uid.toString()) {
                    u.orderstate = r.orderstate;
                    u.orderendtime = r.orderendtime;
                }
                if (option.callback)
                    option.callback(parseInt(r.orderstate) !== 4);
            },
            error: function (err) {
                if (option.error) option.error(err);
                else{
                    if (option.callback) option.callback(false);
                    console.error(err);
                }
            }
        });
    }
    else if (current.isLogin()) {
        if (option.callback)
            option.callback(parseInt(current.user().orderstate) !== 4);
    }
    else if (option.callback)
        option.callback(false);
}

exports = module.exports = isOrder;