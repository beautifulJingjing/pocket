/**
 * Created by LXP on 2016/3/2.
 * 彩铃是否等待开通中
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     phone（可缺省）:手机号，优先级高于uid;
 *     uid（可缺省）:用户ID，无此参数时，使用当前uid;
 *     isgetgtype（可缺省）:是否查询号码类型，0-否，1-是，根据配置，0元彩铃默认值1，否则0
 *     iscache（可缺省）：是否从缓存取，默认true, 只在查询当前用户时有效
 *   },
 *   callback(boolean): 结果回调方法,
 *   error(Error):有错误触发，缺省时触发callback
 */
"use strict";
var get_crbt_state = require('./get_crbt_state');

function isCrbtOpening(option){
    var req = option.req,
        current = req.current;
    var data = option.data || {};

    get_crbt_state({
        req: req,
        data: data,
        callback: function(r) {
            if (parseInt(r.iscrbt) == 0) {
                var isOpening = parseInt(r.crbtinfo.waitstate) == 1 || req.current.isOpenCrbtWaiting();
                if (isOpening)//是等待状态，彩铃缓存清楚，以便下次查询时更新状态
                    current.crbtState(null);
                if (option.callback)
                    option.callback(isOpening);
            }
            else if (option.callback)
                option.callback(false);
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

module.exports = isCrbtOpening;