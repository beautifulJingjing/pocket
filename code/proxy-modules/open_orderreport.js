"use strict";

var interfaces = require('../interface-modules');
var trace = require('../trace');


exports = module.exports = function (option) {
    //开始取用户信息+
    var req = option.req,
        config = req.config,
        current = req.current,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    var user = current.user();
    if(user){
        //订购用户通知
        interfaces.open_orderreport({
            req: req,
            data: {
                phone: user.phone,
                orderid:query.orderid,
                type:query.type||1
            },
            success: function () {
                res.send({});
            },
            error: function (err) {
                res.send(err);
                console.error(err);
            }
        });
    }else{
        res.send({});
    }

};