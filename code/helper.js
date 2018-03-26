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

var http = require('https');
var crypto = require('crypto');
var querystring = require('querystring');
var url = require('url');
var trace = require('./trace');

//API接口参数
var api = {
    id: 1,
    key: 'sky',
    //host: 'http://127.0.0.1:8809/rs/phone.htm'
    //host: 'http://60.191.59.46:22387/ringsetting/phone.htm'
    //host: 'https://api.ringbox.com.cn:8808/ringsetclientv3/phone.htm'
    host: 'https://api.ringbox.com.cn/ringsetclientv3/phone.htm'  //正式使用
     //host: 'http://10.161.187.76:8808/ringsetclientv3/phone.htm'
    //host: 'http://115.29.165.32:8808/ringsetclientv3/phone.htm'
    //host: 'http://192.168.3.252/ringsetting/phone.htm'
};

//MD5方法
exports.MD5 = function(s){
    return crypto.createHash('md5').update(s, 'utf8').digest('hex');
};

//SHA1方法
exports.SHA1 = function(s){
    return crypto.createHash('sha1').update(s, 'utf8').digest('hex');
};

//API参数加密
var cryptoParams = function(data){
    var ps = [];
    for(var name in data){
        ps.push({key: name, val: data[name]});
    }
    ps.sort(function(a, b){
        return a.key.localeCompare(b.key);
    });
    data = '';
    for(var i in ps){
        data += ps[i].val.toString();
    }
    return exports.MD5(data + api.key).toUpperCase();
};

//POST API接口
exports.call = function(option){
    var request = option.req;
    var data = extend({}, option.data);
    if(!data.spinfocode) data.spinfocode = request.current.spinfocode();
    if(!data.version) data.version = '30';
    data.format = 'JSON';
    data.timespan = new Date().getTime();
    data.appid = api.id;
    data.hash = cryptoParams(data);
    data = querystring.stringify(data);

    console.log(api.host+"?"+data);


        //POST方式
        var host = url.parse(api.host);
        var req = http.request({
            hostname: host.hostname,
            port: host.port,
            path: host.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Content-Length': data.length
            }
        }, function (res) {
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
                            console.log(rec);
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
                trace.error({
                    req: request,
                    name: 'call',
                    params: data,
                    msg: err
                });
            }
        });

    try{
        req.write(data);
        req.end();
    }catch (err) {
        if (option.error) option.error(err);
        else {
            if (option.callback) option.callback(false);
            console.error(err);
        }
    }

};
