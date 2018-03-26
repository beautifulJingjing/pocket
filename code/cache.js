"use strict";


var nodecache;
//if (process.env.NODE_ENV === 'development') {
    var node_cache = require('node-cache');

    nodecache = new node_cache({
        stdTTL: 1800,//标准缓存元素的秒数，0=无限
        checkperiod: 300 //自动删除检查间隔，0=不检查
    });
//}
//else{
//    nodecache = new global.ACESDK.CACHE('ringbox');
//}


var cache = {
    //设置缓存, 存取值必为string
    set: function(key, val, expires, callback){
        nodecache.set(key, val, expires, callback);
    },
    //获取缓存, 存取值必为string
    get: function(key, callback) {
        //if (process.env.NODE_ENV === 'development')
            return nodecache.get(key, callback);
        //else
        //    return nodecache.get(key, function (err, data) {
        //        if (data) callback(err, data.val.toString());
        //        else callback(err, data);
        //    });
    },
    //删除缓存
    del: function(key, callback){
        //if (process.env.NODE_ENV === 'development')
            return nodecache.del(key, callback);
        //else
        //    return nodecache.delete(key, callback);
    },
    //生成缓存键
    key: function(val){
        if(typeof val === "object"){
            var d = {};
            //spinfocode是否做缓存键，有待确定
            if(val.spinfocode){
                for(var k in val){
                    if(k.toLowerCase() === 'spinfocode'|| k.toLowerCase() === '_') continue;
                    d[k] = val[k];
                }
            }
            else d = val;
            return JSON.stringify(d);
        }
        else
            return val;
    }
};

module.exports = cache;