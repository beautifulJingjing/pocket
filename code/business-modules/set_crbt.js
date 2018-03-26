/**
 * Created by LXP on 2016/3/3.
 * 彩铃设置，要求登录状态
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     ringid：铃声id, 可以是数组;
 *     idtype（可缺省）：铃声id来源，1（默认）-从内容列表，2-从个人彩铃列表，3-活动栏目，4-用户DIY铃声列表
 *   },
 *   callback(boolean): 结果回调方法,
 *   error(Error):有错误触发，缺省时触发callback
 */
"use strict";
var interfaces = require('../interface-modules');

function setCrbt(option){
    var req = option.req;
    var current = req.current;
    var data = option.data ||{};
    if (data.ringid instanceof String) data.ringid = data.ringid.trim();
    try {
        if (!data.ringid) throw new Error('参数错误');
        if (!current.isLogin()) throw new Error('未登录错误');

        var rids = data.ringid.replace(/, *,/g, ',').split(',');
        for (var i in rids) {
            if (isNaN(rids[i])) {
                throw new Error('参数错误');
                break;
            }
        }

        //根据ringid数据确定使用同步/异步
        if (rids.length > 1) data.isasyn = parseInt(config.ringset.muchset.sync) == 1 ? 0 : 1;
        else data.isasyn = parseInt(config.ringset.singleset.sync) == 1 ? 0 : 1;
        //确定ringid类型，缺省为内容列表
        if (isNaN(data.idtype)) data.idtype = 1;
        //设置用户
        data.uid = current.user().id;
        var succ = 0;
        var set_crbt_option = {
            req: req,
            data: data,
            success: function (r) {
                succ++;
            },
            error: function (err) {
                //有一次错误回调后，不再回调
                set_crbt_option.error = null;
                //清理成功回调
                clearInterval(interval);

                if (option.error) option.error(err);
                else {
                    if (option.callback) option.callback(false);
                    console.error(err);
                }
            }
        };
        for (var i in rids) {
            set_crbt_option.data.ringid = rids[i];
            interfaces.set_crbt(set_crbt_option);
        }
        var interval = setInterval(function () {
            //全部成功设置
            if (succ == rids.length) {
                clearInterval(interval);
                if (option.callback)
                    option.callback(true);
            }
        }, 100);
    }
    catch (err){
        if (option.error) option.error(err);
        else {
            if (option.callback) option.callback(false);
            console.error(err);
        }
    }
}

module.exports=setCrbt;
