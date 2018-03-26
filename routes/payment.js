/**
 * 数据接口
 */
"use strict";

var express = require('express');
var router = express.Router();
var current = require('../code/current');
var alipay = require('../code/payment-modules/alipay_config').alipay;
var wxpay = require('../code/payment-modules/wxpay_config').wxpay;
var interfaces = require('../code/interface-modules');
//var json2csv = require('json2csv');
//var fs= require('fs');
//var iconv = require('iconv-lite');

function getNowFormatDate() {
    var day = new Date();
    var Year = 0;
    var Month = 0;
    var Day = 0;
    var hour = 0;
    var minute = 0;
    var second = 0;
    var CurrentDate = "";
//初始化时间
    Year = day.getFullYear();//ie火狐下都可以
    Month = day.getMonth() + 1;
    Day = day.getDate();
    hour = day.getHours();
    minute = day.getMinutes();
    second = day.getSeconds();
    CurrentDate += Year;
    if (Month >= 10) {
        CurrentDate += '-' + Month;
    } else {
        CurrentDate += "-0" + Month;
    }

    if (Day >= 10) {
        CurrentDate += '-' + Day;
    } else {
        CurrentDate += "-0" + Day;
    }
    if (hour >= 10) {
        CurrentDate += ' ' + hour;
    } else {
        CurrentDate += ' 0' + hour;
    }
    if (minute >= 10) {
        CurrentDate += ':' + minute;
    } else {
        CurrentDate += ':0' + minute;
    }
    if (second >= 10) {
        CurrentDate += ':' + second;
    } else {
        CurrentDate += ':0' + second;
    }
    return CurrentDate;
}

function getNewBatchNo() {
    var day = new Date();
    var Year = 0;
    var Month = 0;
    var Day = 0;
    var hour = 0;
    var minute = 0;
    var second = 0;
    var CurrentDate = "";
//初始化时间
    Year = day.getFullYear();//ie火狐下都可以
    Month = day.getMonth() + 1;
    Day = day.getDate();
    hour = day.getHours();
    minute = day.getMinutes();
    second = day.getSeconds();
    CurrentDate += Year;
    if (Month >= 10) {
        CurrentDate += Month;
    } else {
        CurrentDate += "0" + Month;
    }

    if (Day >= 10) {
        CurrentDate += Day;
    } else {
        CurrentDate += "0" + Day;
    }
    CurrentDate += hour;
    CurrentDate += minute;
    CurrentDate += second;
    return CurrentDate;
}

function paymentRouterHandle(req, res, next) {
    req.current = new current.create(req);
    var params = extend({}, req.method == 'POST' ? req.body : req.query);
    interfaces.query_order({
        req: req,
        data: params,
        success: function (data) {
            if (data) {
                try {
                    if (data.po_us_order_num) {
                        var return_url = new Buffer(data.po_return_url).toString('base64');
                        if (data.po_pay_type == 6) {
                            var ret = {
                                out_trade_no: data.po_us_order_num,
                                subject: data.po_objname,
                                body: return_url,
                                //total_fee: 0.01
                                total_fee: data.po_buy_price
                            };
                            alipay.create_direct_pay_by_user(ret, res);
                        } else if (data.po_pay_type == 7) {
                            var ret = {
                                cporderid: data.po_us_order_num,
                                waresname: data.po_objname,
                                waresid: 1,
                                attach: return_url,
                                //price: 1,
                                price: data.po_buy_price * 100,
                                appuserid: data.po_user_id
                            };
                            wxpay.create_direct_pay_by_user(ret, res);
                        }else if (data.po_pay_type == 8) {
                            var ret = {
                                cporderid: data.po_us_order_num,
                                waresname: data.po_objname,
                                waresid: 1,
                                attach: data.po_return_url,
                                //price: 1,
                                price: data.po_buy_price * 100,
                                appuserid: data.po_user_id
                            };
                            wxpay.create_direct_pay_by_user_scan(ret, res);
                        }
                    }
                } catch (e) {
                }
            }
        },
        error: function (err) {
            //这里需要添加失败代码
        }
    });
};

//function refundRouterHandle(req, res, next) {
//    req.current = new current.create(req);
//    var params = extend({}, req.method == 'POST' ? req.body : req.query);
//    orderdao.queryExceptionOrderById({
//        req: req,
//        data: params,
//        success: function (data) {
//            if (data.length > 0) {
//                //支付宝退款
//                if (params.paytype == 1) {
//                    try {
//                        var refund_date = getNowFormatDate();
//                        var batch_no = getNewBatchNo();
//                        var detail_data = '';
//                        for (var key in data) {
//                            if (detail_data == '') {
//                                detail_data += data[key].po_out_order_no + '^' + data[key].po_buy_price + '^' + '流量充值未成功';
//                            } else {
//                                detail_data += '#' + data[key].po_out_order_no + '^' + data[key].po_buy_price + '^' + '流量充值未成功';
//                            }
//                        }
//                        var ret = {
//                            refund_date: refund_date,
//                            batch_no: batch_no,
//                            batch_num: data.length,
//                            detail_data: detail_data
//                        };
//                        alipay.refund_fastpay_by_platform_pwd(ret, res);
//                    } catch (e) {
//                    }
//                //微信退款
//                } else if ((params.paytype == 2)||(params.paytype == 3)) {
//                    var totalcount  = data.length;
//                    var refuedcount = 0;
//                    var successcount = 0;
//                    for (var key in data) {
//                        var ret = {
//                            po_us_order_num: data[key].po_us_order_num,
//                            price: data[key].po_buy_price*100,
//                        };
//                        try {
//                            wxpay.refund_fastpay_by_platform_pwd(ret, res,function (payinfo) {
//                                if (payinfo) {
//                                    successcount = successcount + 1;
//                                    orderdao.updateRefundOrders({
//                                        data: {
//                                            order_nos: payinfo
//                                        }
//                                    });
//                                }
//                                refuedcount = refuedcount + 1;
//                                if (refuedcount>=totalcount){
//                                    res.send({
//                                        result: 'SUCCESS',
//                                        outparam: {
//                                            successcount:successcount,
//                                            totalcount:totalcount
//                                        }
//                                    });
//                                }
//                            });
//                        } catch (e) {
//                        }
//                    }
//                }
//            }
//        },
//        error: function (err) {
//            //这里需要添加失败代码
//        }
//    });
//};
//
//
//function redoRouterHandle(req, res, next) {
//    req.current = new current.create(req);
//    var params = extend({}, req.method == 'POST' ? req.body : req.query);
//    orderdao.updateRedoOrders({
//        req: req,
//        data: params,
//        success: function (data) {
//            res.send('成功');
//        },
//        error: function (err) {
//            res.send('失败:'+ err.message);
//        }
//    });
//};

router.get('/webpay', paymentRouterHandle);
router.post('/webpay', paymentRouterHandle);
//router.get('/refund', refundRouterHandle);
//router.post('/refund', refundRouterHandle);
//router.get('/redo', redoRouterHandle);
//router.post('/redo', redoRouterHandle);
//router.get('/exportcsv', exportcsvRouterHandle);
//router.post('/exportcsv', exportcsvRouterHandle);


module.exports = router;
