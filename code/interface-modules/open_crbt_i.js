/**
 *  开通运营商彩铃功能
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     uid（可缺省）:用户ID，缺省时userphone必不为空；
 *     userphone（可缺省）:手机号，为空时使用uid绑定的号码；
 *     patype（可缺省）:开通方式，0（默认）-由号码本身决定，4-短信2次确认，5-联通0元彩铃；
 *     key（可缺省）:运营商短信验证，需要验证码时-1:发送验证码；
 *     smsdebug（可缺省）:仅pwd=-1时有效，1-返回值message中携带验证码；
 *     inqueue（可缺省）:开通失败时进入等待开通队列，1-进入，0-不进；
 *     withdiy（可缺省）:同时开通DIY标识，0（默认）-不开DIY，1-开通DIY，只在彩铃开通失败时有效，彩铃开通失败进入等待开通队列时，1开通彩铃时同步开通DIY，否则只开通彩铃功能；
 *   },
 *   success(int): 成功完成时触发
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = extend({}, option.data);
    data.service= 'open_crbt';
    if(data.hasOwnProperty('key')) {
        data.pwd = data.key;
        delete data.key;
    }

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
            else {
                rec = rec.data;
                rec.res = parseInt(rec.res);
                //res=1001进入队列, 2002表示短信已下发
                if (rec.res === 1 || rec.res === 1001 || rec.res === 2002) {
                    if (rec.res === 1 || rec.res === 1001) {
                        trace.interface({
                            req: option.req,
                            name: 'open_crbt',
                            params: data
                        });
                    }
                    if (option.success)
                        option.success(rec.res);

                    return;
                }
                else {
                    err = new Error(rec.message);
                    err.res = rec.res;
                }
            }
            if (!err.message)
                err.message = 'sorry ~由于系统原因，彩铃功能开通失败了。\r\n　　请拨打当地运营商进行开通。';

            if (option.error) option.error(err);
            else console.error(err);
            if (data.pwd!=-1) {
                trace.error({
                    req: option.req,
                    name: 'open_crbt',
                    params: data,
                    msg: err.message
                });
            }
            else{
                trace.error({
                    req: option.req,
                    name: 'send_vcode',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};
