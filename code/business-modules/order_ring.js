/**
 * Created by LXP on 2016/3/3.
 * 订购彩铃（单首计费）,要求登录状态
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     ringid：铃声id
 *   },
 *   callback(boolean): 结果回调方法,
 *   error(Error):有错误触发，缺省时触发callback
 * }
 */
"use strict";
var interfaces = require('../interface-modules');

function orderRing(option) {
    var req = option.req;
    var current = req.current;
    var data = option.data || {};
    if (typeof data.ringid == 'string') data.ringid = data.ringid.trim();

    try {
        if (isNaN(data.ringid)) throw new Error('参数错误');
        if (current.isLogin()) data.uid = current.user().id;
        else throw new Error('未登录错误');


        interfaces.order_ring({
            req: option.req,
            data: data,
            success: function (r) {
                if (option.callback)
                    option.callback(true);
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

module.exports = orderRing;