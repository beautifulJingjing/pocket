/**
 * call参数对象值：
 * option={
 *   req: 客户端请求对象
 *   data: API接口请求参数
 *   returnType: 返回数据类型，data=响应内容（默认），response=响应对象
 *   success(string || responseObject): 接口调用成功事件，statusCode等于200，且returnType等于data时，data非空时触发
 *   error(Error): 接口调用失败事件，statusCode不等于200，或returnType等于data时，data为空时触发
 * }
 */
"use strict";

var https = require('https');
var crypto = require('crypto');
var querystring = require('querystring');
var url = require('url');
var iconv = require("iconv-lite");
var wxconfig = require('./wxpay_config');

//API接口参数
var api = {
    id: 1,
    account: 'zmkj',
    version: '1.1',
    key: '4dc432c5b29722ba63dcf98ba005fbe5',
    host: 'https://pay.swiftpass.cn/pay/gateway',
    partner_trade_notify_url: '/pay/flow/cg_partner_trade/notify_url',
};

//MD5方法
exports.MD5 = function (s) {
    return crypto.createHash('md5').update(s, 'utf8').digest('hex');
};

//SHA1方法
exports.SHA1 = function (s) {
    return crypto.createHash('sha1').update(s, 'utf8').digest('hex');
};

exports.gbk2utf8 = function gbk2utf8(str) {
    str = str.replace(/%([a-zA-Z0-9]{2})/g, function (_, code) {
        return String.fromCharCode(parseInt(code, 16));
    });
    return iconv.decode((new Buffer(str, 'binary')), 'gb2312');
};

//得到当前16位的ip地址
exports.IpAddress = function (s) {
    if (s.length>16){
        s = s.substr(0,16);
    }
    return s;
};

//API参数加密
exports.cryptoParams = function (data,key) {
    var ps = [];
    for (var name in data) {
        if (name != 'sign') {
            ps.push({key: name, val: data[name]});
        }
    }
    ps.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });
    data = '';
    for (var i in ps) {
        if (data == '') {
            data += ps[i].key.toString() + '=' + ps[i].val.toString();
        } else {
            data += '&' + ps[i].key.toString() + '=' + ps[i].val.toString();
        }
    }
    data += '&key=' + key;
    return exports.MD5(data).toUpperCase();
};

exports.notify_pay_result = function (option) {
    var data = {};
    var request = option.req;
    data.merchantid = request.query.merchantid;
    data.orderno = request.query.orderno;
    data.orderstatus = request.query.orderstatus;
    data.rechargetime = request.query.rechargetime;
    data.rechargeresult = exports.gbk2utf8(request.query.rechargeresult);
    data.sign = cryptoParams(data);
    if (data.sign == request.query.sign) {
        if (data.orderstatus == 'order_success') {
            option.success(data);
        } else {
            option.error(data);
        }
    } else {
        option.error(data);
    }
}

function gbk2utf8(str){
    str = str.replace(/%([a-zA-Z0-9]{2})/g,function(_,code){
        return String.fromCharCode(parseInt(code,16));
    });
    return iconv.decode((new Buffer(str,'binary')),'gb2312');
}

//POST API接口
exports.callpost = function (option) {
    var request = option.req;
    var data = option.data;//gbk2utf8(option.data);
    //POST方式
    var host = url.parse(api.host);
    var req = https.request({
        hostname: host.hostname,
        port: 443,
        path: host.pathname,
        method: 'POST',
    }, function (res) {
        res.setEncoding('utf8');
        if (res.statusCode == 200) {
            //API响应内容的返回
            var rec = '';
            res.on('data', function (chunk) {
                rec += chunk;
            });
            res.on('end', function () {
                if (rec) {
                    if (option.success)
                        option.success(rec);
                }
                else {
                    var err = new Error('响应内容为空！');
                    if (option.error) option.error(err);
                    else console.error(err);
                }
            });
        }
        else {
            var err = new Error(res.statusCode + res.statusMessage);
            if (option.error) option.error(err);
        }
    });
    req.write(data);
    req.end();
};


//GET API接口
exports.callget = function (option) {
    var request = option.req;
    var data = extend({}, option.data);
    var signdata = extend({}, option.signdata);
    signdata.account = api.account;
    data.account = api.account;
    data.v = api.version;
    data.sign = cryptoParams(signdata);
    data = querystring.stringify(data);

    //GET方式
    var host = url.parse(api.host + data);
    var req = http.get(host.href.toString(), function (res) {
        res.setEncoding('utf8');
        if (res.statusCode == 200) {
            if (!option.returnType)
                option.returnType = 'data';
            //API响应对象的返回
            if (option.returnType.toLowerCase() == 'response') {
                if (option.success)
                    option.success(res);
            }
            else {
                //API响应内容的返回
                var rec = '';
                res.on('data', function (chunk) {
                    rec += chunk;
                });
                res.on('end', function () {
                    if (rec) {
                        if (option.success)
                            option.success(rec);
                    }
                    else {
                        var err = new Error('响应内容为空！');

                        if (option.error) option.error(err);
                        else console.error(err);
                    }
                });
            }
        }
        else {
            var err = new Error(res.statusCode + res.statusMessage);
            if (option.error) option.error(err);
            else console.error(err);
            //接口失败日志
            //trace.error({
            //    req: request,
            //    name: 'call',
            //    params: data,
            //    msg: err
            //});
        }
    });
};
