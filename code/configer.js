/**
 * Created by XUER on 2016-2-21.
 * 读取spinfocode配置
 */
"use strict";

var http = require('http');
var url = require('url');

var app= require.cache[require.resolve('../app.js')];
var cache = require('./cache');

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (prefix){
        return this.slice(0, prefix.length) === prefix;
    };
}

//统计访问密度
exports.setDense = function(id) {
    var density = app.exports.locals.density;
    if (!density) {
        density = {};
        app.exports.locals.density = density;
    }
    var dense = density[id];
    if (!dense) {
        dense = {
            last_time: new Date(),
            number: 0
        };
        density[id] = dense;
    }
    else {
        var last_time = new Date(dense.last_time.toString());
        if (dense.number >= 10 &&
            last_time.setMinutes(last_time.getMinutes() + 29) < new Date()) {
            //两次访问间隔大于30分钟，退出密集模式
            dense.number = 0;
        }
        else {
            last_time = new Date(dense.last_time.toString());
            if (last_time.setMinutes(last_time.getMinutes() + 15) > new Date()) {
                //两次访问间隔小于15分钟，累计
                dense.number++;
            }
            else {
                //间隔大于15分钟，从新累计
                dense.number = 0;
            }
        }
        dense.last_time = new Date();
    }
};
//判断访问密度
exports.isDense = function(id) {
    var density = app.exports.locals.density;
    if (density) {
        var dense = density[id];
        if (dense) {
            return dense.number >= 10;
        }
    }
    return false;
};
//获取配置
exports.get = function(id, handle) {
    var config_url_old = 'http://diy.10155.com/manage.v2/data/',
        config_url = 'http://config.ringbox.cn/options/',
        cachekey_config = 'CONFIG-' + id, cachekey_def = 'CONFIG-DEFAULT',
        config = null,ishttp=true,
        def = null;

    //if(id.substr(7,3)=='045'||id=='02000530411'){
    //    ishttp=true;
    //}
    //取配置
    cache.get(cachekey_config, function (err, data) {

        if (data){
            console.log(id+'configif');
            //console.trace('has config cache!!!!!!!');
            //console.trace(data);
            config = data;
        }
        else {
            console.log('cacheGetError_getConfig');
            var onResponse = function (response) {
                console.log(id+'configelse');
                if (response.statusCode == 200) {
                    var out = '';
                    response.setEncoding('utf8');
                    response.on('data', function (chunk) {
                        out += chunk;
                    });
                    response.on('end', function () {
                        config = out;
                        cache.set(cachekey_config, config, 43200);//缓存12小时
                    });
                }
                else{
                    //if(ishttp)
                        //http.get(url.resolve(config_url, '00000350451'), onResponse);
                        http.get(url.resolve(config_url, '00000550471'), onResponse);
                    //else
                    //    http.get(url.resolve(config_url_old, '00000550471.data'), onResponse);
                }
            };
            if(ishttp)
                http.get(url.resolve(config_url, id), onResponse);
            else
                http.get(url.resolve(config_url_old, id + '.data'), onResponse);
        }
    });
    ////取配置默认设置
    //cache.get(cachekey_def, function (err, data) {
    //    if (data) {
    //        //console.trace('has def cache!!!!!!!');
    //        //console.trace(data);
    //        def = eval('(' + data + ')');
    //    }
    //    else {
    //        http.get(url.resolve(config_url_old, 'default.data'), function (response) {
    //            var out = '';
    //            response.setEncoding('utf8');
    //            response.on('data', function (chunk) {
    //                out += chunk;
    //            });
    //            response.on('end', function () {
    //                def = eval('(' + out + ')');//default.data文件格式不规范，JSON.parse方式抛出异常
    //                cache.set(cachekey_def, out, 0);//永久缓存
    //            });
    //        });
    //    }
    //});
    var interval = setInterval(function () {
        if (config) {
            clearInterval(interval);
            config = JSON.parse(config);
            parse({
                config: config,
                def: def
            });
            handle(config);
        }
    }, 100);
};
//配置标准化
function parse(options){
    var config = options.config;
    var def = options.def;
    ////登录标准设定
    //if (parseInt(config.login.pop.norm) == 1) {
    //    var pop = null;
    //    switch (parseInt(config.login.mode)) {
    //        case 1:
    //            pop = def.login.mode_1;
    //            break;
    //        case 2:
    //            if (!config.order.mode.startsWith('9'))
    //                pop = eval('def.order.mode_' + config.order.mode + '.login');
    //            break;
    //        case 3:
    //            pop = eval('def.crbt.mode_' + config.crbt.mode + '.login');
    //            break;
    //    }
    //    if (pop)
    //        config.login.pop = pop;
    //}
    var login_pop = config.login.pop;
    ////单首彩铃标准设定
    //if (parseInt(config.ringset.singleset.succ.norm) == 1) {
    //    config.ringset.singleset.succ = def.ringset.singleset.succ;
    //}
    //if (parseInt(config.ringset.singleset.fail.norm) == 1) {
    //    config.ringset.singleset.fail = def.ringset.singleset.fail;
    //}
    ////多首彩铃标准设定
    //if (parseInt(config.ringset.muchset.succ.norm) == 1){
    //    config.ringset.muchset.succ = def.ringset.muchset.succ;
    //}
    //if (parseInt(config.ringset.muchset.fail.norm) == 1){
    //    config.ringset.muchset.fail = def.ringset.muchset.fail;
    //}
    //业务开通使用配置
    var order_pop = config.order.pop;
    //if (parseInt(order_pop.norm.norm) == 1) {
    //    if (!config.order.mode.startsWith('9'))
    //        order_pop.norm = eval('def.order.mode_' + config.order.mode + '.open');
    //}
    var crbt_pop = config.crbt.pop;
    //if (parseInt(crbt_pop.norm.norm) == 1){
    //    crbt_pop.norm = eval('def.crbt.mode_' + config.crbt.mode + '.open');
    //}
    var remind = config.declare.remind;
    //if (parseInt(remind.norm.type) != 0){
    //    if (!config.order.mode.startsWith('9')) {
    //        remind.norm.content = eval('def.order.mode_' + config.order.mode + '.remind.norm_' + remind.norm.type);
    //        console.log("_temp:"+remind.norm.content);
    //    }
    //}
    //自动状态下判断是使用标准还是配置
    var set = parseInt(config.set);
    if (set == 0){
        if (exports.isDense(config.id)) set = 2;
        else set = 1;
    }
    //根据使用配置，变更结构以适应标准对象
    switch (set){
        case 1:
            for (var propert in login_pop.norm){
                if (propert == 'norm') continue;
                login_pop[propert] = login_pop.norm[propert];
            }
            for (var propert in order_pop.norm){
                if (propert == 'norm') continue;
                order_pop[propert] = order_pop.norm[propert];
            }
            for (var propert in crbt_pop.norm){
                if (propert == 'norm') continue;
                crbt_pop[propert] = crbt_pop.norm[propert];
            }
            for (var propert in remind.norm){
                remind[propert] = remind.norm[propert];
            }
            break;
        case 2:
            for (var propert in login_pop.custom) {
                login_pop[propert] = login_pop.custom[propert];
            }
            for (var propert in order_pop.custom) {
                order_pop[propert] = order_pop.custom[propert];
            }
            for (var propert in crbt_pop.custom) {
                crbt_pop[propert] = crbt_pop.custom[propert];
            }
            for (var propert in remind.custom){
                remind[propert] = remind.custom[propert];
            }
            break;
    }
    delete login_pop.norm;
    delete order_pop.norm;
    delete crbt_pop.norm;
    delete remind.norm;
    delete login_pop.custom;
    delete order_pop.custom;
    delete crbt_pop.custom;
    delete remind.custom;
    //说明标准
    var declare_intro = config.declare.intro || '';
    //if (parseInt(declare_intro.norm) == 1){
    //    declare_intro.content = eval('def.order.mode_' + config.order.mode + '.intro');
    //}
    var user_center_explain = config.user_center.explain;
    //if (parseInt(user_center_explain.norm) == 1){
    //    user_center_explain.content = eval('def.order.mode_' + config.order.mode + '.intro');
    //}
    //新增节点的初始化
    if (!config.downring){
        config.downring = { serve: config.ringset.serve };
    }
    if (!config.crbt.asyncsucc) {
        config.crbt.asyncsucc = { title: '', content: '' };
    }
};