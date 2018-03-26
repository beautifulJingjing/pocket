/**
 * Created by shengaozhou on 2016/3/1.
 *  彩铃设置
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     uid（可缺省）:用户ID，缺省时phone必不为空
 *     phone（可缺省）：被叫号码，为空时使用uid绑定的手机号
 *     idtype（可缺省）：铃声id来源，1（默认）-从内容列表，2-从个人彩铃列表，3-活动栏目，4-用户DIY铃声列表
 *     ringid：铃声id
 *     isasyn（可缺省）：铃声设置时效(默认=0)，0-同步，1-完全异步
 *   },
 *   success(true): 成功完成时触发
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var req = option.req;
    var current = req.current;
    var data = option.data || {};
    data.service = 'set_user_crbt';

    if(!data.caller)data.caller="";
    if(!data.callername)data.callername="";

    if (!data.hasOwnProperty('idtype')) data.idtype = 1;


    try {
        if (isNaN(data.ringid)) throw new Error('参数错误');
        if (current.isLogin()) data.uid = current.user().id;
        else throw new Error('未登录错误');

        helper.call({
            req: option.req,
            data: data,
            success: function (rec) {
                var err;
                rec = JSON.parse(rec);
                if (rec.code != 1) {
                    err = new Error(rec.msg);
                    err.code = rec.code;
                }
                else if (parseInt(rec.data.res) != 1) {
                    err = new Error(rec.data.message);
                    err.code = rec.data.res;
                }
                else {
                    if (option.callback)
                        option.callback(true);
                    trace.interface({
                        req: option.req,
                        name: 'set_user_crbt',
                        params: data
                    });
                    return;

                }

                if (option.error) option.error(err);
                else console.error(err);

                trace.error({
                    req: option.req,
                    name: 'set_user_crbt',
                    params: data,
                    msg: err
                });
            },
            error: option.error
        });
    }
    catch (err) {
        if (option.error) option.error(err);
        else {
            if (option.callback) option.callback(false);
            console.error(err);
        }
    }
};

