/**
 * Created by XUER on 2016-2-28.
 * 检查是否开通彩铃
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     phone（可缺省）:手机号，优先级高于uid;
 *     uid（可缺省）:用户ID，无此参数时，使用当前uid;
 *     iscache（可缺省）：是否从缓存取，默认true, 只在查询当前用户时有效
 *   },
 *   callback(boolean): 结果回调,
 *   error(Error):有错误触发，缺省时触发callback
 */
"use strict";
var get_crbt_state = require('./get_crbt_state');

function isCrbt(option){
    var req = option.req;
    var current = req.current;
    var data = option.data || {};

    get_crbt_state({
        req: req,
        data: data,
        callback: function(r) {
            if (r) {
                var isCrbt = parseInt(r.iscrbt) === 1;
                if (isCrbt)
                    current.isOpenCrbtWaiting(null);//彩铃开通状态，清理彩铃等待开通cookie标识
                if (option.callback)
                    option.callback(isCrbt);
            }
            else if (option.callback)
                option.callback(false);
        },
        error: function(err) {
            if(option.error) option.error(err);
            else {
                if (option.callback) option.callback(false);
                console.error(err);
            }
        }
    });
}

module.exports = isCrbt;