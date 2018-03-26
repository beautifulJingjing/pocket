/**
 * Created by majun on 2016/8/2.
 * 获取领取礼包的人数
 */

"use strict";

var helper = require('../helper');
var cache = require('../cache');
var trace = require('../trace');

exports = module.exports = function(option){
    var data = option.data || {};

    var cachekey = cache.key(data);
    cache.get(cachekey,function(err, result){
        if (result) {
            var _newnum = parseInt(result) + parseInt(Math.random()*100);
            console.log(result + '_' + _newnum);
            cache.set(cachekey, _newnum.toString());
            if (option.success)
                option.success(_newnum);
            else
                option.error();
        }
        else{
            var init_num = 38925 + parseInt(Math.random()*100);
            cache.set(cachekey, init_num.toString());
            if (option.success)
                option.success(init_num);
            else
                option.error();
        }
    })
}