/**
 * Created by LXP on 2016/3/3.
 * 退订DIY
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     phone（可缺省）: 手机号，为空时使用当前uid
 *   },
 *   callback(boolean): 结果回调方法,
 *   error(Error):有错误触发，缺省时触发callback
 */
"use strict";
var interfaces = require('../interface-modules');

function unsubscriptOrder(option) {
    var req = option.req;
    var current = req.current;
    var data = option.data || {};
    if (typeof data.phone == 'string') data.phone = data.phone.trim();

    try {
        if (data.phone) delete data.uid;
        else if (current.isLogin()) data.uid = current.user().id;
        else throw new Error('参数错误');

        interfaces.unsubscript_order({
            req: req,
            data: data,
            success: function (r) {
                if (current.isLogin()) {
                    var u = current.user();
                    if ((data.uid && data.uid == u.id) || (data.phone && data.phone == u.phone)) {
                        u.orderstate = r.orderstate;
                        u.orderendtime = r.orderendtime;
                    }
                }
                if(option.success){
                    if(parseInt(r.res) == 1) option.success(r.msg);
                }
                else{
                    if (option.callback) option.callback(true);
                }
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
    catch (err) {
        if (option.error) option.error(err);
        else {
            if (option.callback) option.callback(false);
            console.error(err);
        }
    }
}

module.exports = unsubscriptOrder;

