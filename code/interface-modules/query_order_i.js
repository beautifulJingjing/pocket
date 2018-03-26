"use strict";

var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'getpayorderinfo';
    helper.call({
        req: option.req,
        data: data,
        success: function(rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                if (option.success) {
                    var orderinfo = {};
                    orderinfo.po_us_order_num = rec.data.orderid;
                    orderinfo.po_objname = rec.data.name;
                    orderinfo.po_buy_price = rec.data.price;
                    orderinfo.po_user_id = rec.data.phone;
                    orderinfo.po_pay_type = rec.data.ptype;
                    orderinfo.po_pay_state = rec.data.state;
                    orderinfo.po_return_url = rec.data.returnUrl;
                    option.success(orderinfo);
                }
                trace.interface({
                    req: option.req,
                    name: 'getpayorderinfo',
                    params: data
                });
            }
            else {
                var err = new Error(rec.msg);
                err.code = rec.code;

                if (option.error)
                    option.error(err);
                trace.error({
                    req: option.req,
                    name: 'getpayorderinfo',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};