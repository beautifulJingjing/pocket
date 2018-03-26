"use strict"

var assert = require('assert');
var url = require('url');
var inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;
//var proxy = require('../proxy-modules/index');
//var orderdao = require('../../dao/orderDao');
var http = require('http');
var querystring = require('querystring');
var crypto = require('crypto');
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var helper = require('../helper_pay_wx');
var xml2js = require('xml2js');
var interfaces = require('../../../code/interface-modules');
var trace = require('../../trace');
var current = require('../../../code/current');

var default_wxpay_config = {
    partner: '' //合作身份者id，以2088开头的16位纯数字
    , key: ''//安全检验码，以数字和字母组成的32位字符
    , seller_email: '' //卖家支付宝帐户 必填
    , host: global.host //域名
    , cacert: 'cacert.pem'//ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
    , transport: 'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
    , input_charset: 'utf-8'//字符编码格式 目前支持 gbk 或 utf-8
    , sign_type: "MD5"//签名方式 不需修改
    , create_direct_pay_by_user_return_url: '/wxpay/create_direct_pay_by_user/return_url'
    , create_direct_pay_by_user_notify_url: '/wxpay/create_direct_pay_by_user/notify_url'

    , refund_fastpay_by_platform_pwd_notify_url: '/wxpay/refund_fastpay_by_platform_pwd/notify_url'
    , create_partner_trade_by_buyer_notify_url: '/wxpay/create_partner_trade_by_buyer/notify_url'
    , create_partner_trade_by_buyer_return_url: '/wxpay/create_partner_trade_by_buyer/return_url'
    , trade_create_by_buyer_return_url: '/wxpay/returnurl'
    , trade_create_by_buyer_notify_url: '/wxpay/notifyurl'
};

function Wxpay(wxpay_config) {
    EventEmitter.call(this);
    //default config
    this.wxpay_config = default_wxpay_config;
    //config merge
    for (var key in wxpay_config) {
        this.wxpay_config[key] = wxpay_config[key];
    }
}

/**
 * @ignore
 */
inherits(Wxpay, EventEmitter);

Wxpay.prototype.route = function (app) {
    var self = this;
    //当前交易模式用到下面2个消息验证
    //create_direct_pay_by_user_return ，create_direct_pay_by_user_notify 一个是返回url,一个是通知url
    app.get(this.wxpay_config.create_direct_pay_by_user_return_url, function (req, res) {
        self.create_direct_pay_by_user_return(req, res)
    });
    app.post(this.wxpay_config.create_direct_pay_by_user_return_url, function (req, res) {
        self.create_direct_pay_by_user_return(req, res)
    });
    app.post(this.wxpay_config.create_direct_pay_by_user_notify_url, function (req, res) {
        req.current = new current.create(req);
        self.create_direct_pay_by_user_notify(req, res)
    });
    app.get(this.wxpay_config.create_direct_pay_by_user_notify_url, function (req, res) {
        req.current = new current.create(req);
        self.create_direct_pay_by_user_notify(req, res)
    });
    ///////////////////////////////////////
    //app.post(this.wxpay_config.refund_fastpay_by_platform_pwd_notify_url, function (req, res) {
    //    self.refund_fastpay_by_platform_pwd_notify(req, res)
    //});
    //app.get(this.wxpay_config.create_partner_trade_by_buyer_return_url, function (req, res) {
    //    self.create_partner_trade_by_buyer_return(req, res)
    //});
    //app.post(this.wxpay_config.create_partner_trade_by_buyer_notify_url, function (req, res) {
    //    self.create_partner_trade_by_buyer_notify(req, res)
    //});
    //app.get(this.wxpay_config.trade_create_by_buyer_return_url, function (req, res) {
    //    self.trade_create_by_buyer_return(req, res)
    //});
    //app.post(this.wxpay_config.trade_create_by_buyer_notify_url, function (req, res) {
    //    self.trade_create_by_buyer_notify(req, res)
    //});
}

function addNode(key, value,doc){
    var root = doc.documentElement;
    var node = doc.createElement(key);
    node.appendChild(doc.createCDATASection(value));
    root.appendChild(node);
}

function SignVerify(sign,data,callback){
    var result_sign = helper.cryptoParams(data,default_wxpay_config.key);
    //logger.log('normal').info("sign:"+sign);
    //logger.log('normal').info("result_sign:"+result_sign);
    callback(sign==result_sign);
}

//微信即时到帐交易接口*******************************************（网页支付接口当前可用）
/*data{
 out_trade_no:'' //商户订单号, 商户网站订单系统中唯一订单号，必填
 ,subject:'' //订单名称 必填
 ,total_fee:'' //付款金额,必填
 ,body:'' //订单描述
 ,show_url:'' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
 }*/

Wxpay.prototype.create_direct_pay_by_user = function (data, res) {
    var doc = new DOMParser().parseFromString('<xml></xml>','text/xml');
    addNode("service","pay.weixin.wappay",doc);
    addNode("device_info","AND_WAP",doc);
    addNode("mch_app_name","ringbox",doc);
    addNode("mch_app_id","http://mt.ringbox.cn",doc);
    addNode("mch_id",default_wxpay_config.partner,doc);
    addNode("out_trade_no",data.cporderid,doc);
    addNode("body",data.waresname,doc);
    addNode("total_fee",data.price,doc);
    addNode("notify_url",url.resolve(default_wxpay_config.host, default_wxpay_config.create_direct_pay_by_user_notify_url),doc);
    addNode("callback_url",url.resolve(default_wxpay_config.host, default_wxpay_config.create_direct_pay_by_user_return_url+'?attach='+data.attach),doc);
    addNode("nonce_str",data.cporderid,doc);
    addNode("mch_create_ip",helper.IpAddress(res.req.current.ip()),doc);
    var parameter = new XMLSerializer().serializeToString(doc);
    xml2js.parseString(parameter,{explicitArray: false}, function (err, result) {
        if (result){
            addNode("sign",helper.cryptoParams(result.xml,default_wxpay_config.key),doc);
            parameter = new XMLSerializer().serializeToString(doc);
            helper.callpost({
                req: res.req,
                data: parameter,
                success: function (rec) {
                    xml2js.parseString(rec,{explicitArray: false}, function (err, result) {
                        if (result){
                            var sign = helper.cryptoParams(result.xml,default_wxpay_config.key);
                            if (sign==result.xml.sign){
                                var urlstr = result.xml.pay_info;
                                var sHtml = "<script>window.location.href='" + urlstr + "';</script>";
                                res.send(sHtml);
                            }
                        }else{
                            res.send('fail');
                        }
                    });
                },
                error: function (rec) {
                    res.send('fail');
                }
            });
        }
    });
}

//微信即时到帐交易接口,扫码支付*******************************************（网页支付接口当前可用）
/*data{
 out_trade_no:'' //商户订单号, 商户网站订单系统中唯一订单号，必填
 ,subject:'' //订单名称 必填
 ,total_fee:'' //付款金额,必填
 ,body:'' //订单描述
 ,show_url:'' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
 }*/

Wxpay.prototype.create_direct_pay_by_user_scan = function (data, res) {
    var doc = new DOMParser().parseFromString('<xml></xml>','text/xml');
    addNode("service","pay.weixin.native",doc);
    addNode("device_info","AND_WAP",doc);
    addNode("mch_app_name","ringbox",doc);
    addNode("mch_app_id","http://mt.ringbox.cn",doc);
    addNode("mch_id",default_wxpay_config.partner,doc);
    addNode("out_trade_no",data.cporderid,doc);
    addNode("body",data.waresname,doc);
    addNode("total_fee",data.price,doc);
    addNode("notify_url",url.resolve(default_wxpay_config.host, default_wxpay_config.create_direct_pay_by_user_notify_url),doc);
    addNode("callback_url",url.resolve(default_wxpay_config.host, default_wxpay_config.create_direct_pay_by_user_return_url),doc);
    addNode("nonce_str",data.cporderid,doc);
    addNode("mch_create_ip",helper.IpAddress(res.req.current.ip()),doc);
    var parameter = new XMLSerializer().serializeToString(doc);
    xml2js.parseString(parameter,{explicitArray: false}, function (err, result) {
        if (result){
            addNode("sign",helper.cryptoParams(result.xml,default_wxpay_config.key),doc);
            parameter = new XMLSerializer().serializeToString(doc);
            helper.callpost({
                req: res.req,
                data: parameter,
                success: function (rec) {
                    xml2js.parseString(rec,{explicitArray: false}, function (err, result) {
                        if (result){
                            var sign = helper.cryptoParams(result.xml,default_wxpay_config.key);
                            if (sign==result.xml.sign){
                                res.redirect(data.attach+'&imageurl='+result.xml.code_img_url);
                            }else{
                                res.send('swiftpass error '+ result.xml.err_code);
                            }
                        }else{
                            res.send('fail');
                        }
                    });
                },
                error: function (rec) {
                    res.send('fail');
                }
            });
        }
    });
}

//即时到账批量退款有密接口
/* 	data{
 refund_date:'',//退款当天日期, 必填，格式：年[4位]-月[2位]-日[2位] 小时[2位 24小时制]:分[2位]:秒[2位]，如：2007-10-01 13:13:13
 batch_no: '', //批次号, 必填，格式：当天日期[8位]+序列号[3至24位]，如：201008010000001
 batch_num:'', //退款笔数, 必填，参数detail_data的值中，“#”字符出现的数量加1，最大支持1000笔（即“#”字符出现的数量999个）
 detail_data: '',//退款详细数据 必填，具体格式请参见接口技术文档
 } */
Wxpay.prototype.refund_fastpay_by_platform_pwd = function (data, res,callback) {
    var doc = new DOMParser().parseFromString('<xml></xml>','text/xml');
    addNode("service","unified.trade.refund",doc);
    addNode("mch_id",default_wxpay_config.partner,doc);
    addNode("out_trade_no",data.po_us_order_num,doc);
    addNode("out_refund_no",data.po_us_order_num,doc);
    addNode("total_fee",data.price,doc);
    addNode("refund_fee",data.price,doc);
    addNode("refund_channel","BALANCE",doc);
    addNode("op_user_id",default_wxpay_config.partner,doc);
    addNode("nonce_str",data.cporderid,doc);
    var parameter = new XMLSerializer().serializeToString(doc);
    xml2js.parseString(parameter,{explicitArray: false}, function (err, result) {
        if (result){
            addNode("sign",helper.cryptoParams(result.xml,default_wxpay_config.key),doc);
            parameter = new XMLSerializer().serializeToString(doc);
            helper.callpost({
                req: res.req,
                data: parameter,
                success: function (rec) {
                    xml2js.parseString(rec,{explicitArray: false}, function (err, result) {
                        if (result){
                            var sign = helper.cryptoParams(result.xml,default_wxpay_config.key);
                            if (sign==result.xml.sign) {
                                if ((result.xml.status == 0) && (result.xml.result_code == 0)) {
                                    callback(data.po_us_order_num);
                                }else{
                                    callback(null);
                                }
                            }else{
                                callback(null);
                            }
                        }else{
                            callback(null);
                        }
                    });
                },
                error: function (rec) {
                    callback(null);
                }
            });
        }
    });
}

////////////////////////////////////当前可用的2个通知验证接口
Wxpay.prototype.create_direct_pay_by_user_notify = function (req, res) {
    var self = this;
    var _POST = req.method == 'POST' ? req.body : req.query;
    //logger.log('normal').info("create_direct_pay_by_user_notify---------");
    //logger.log('normal').info(_POST);
    //logger.log('normal').info("create_direct_pay_by_user_notify---------");
    xml2js.parseString(_POST,{explicitArray: false}, function (err, result) {
        if (result){
            var transdata = result.xml;
            var sign = transdata.sign;
            //计算得出通知验证结果
            SignVerify(sign,transdata,function (verify_result) {
                if (verify_result) {//验证成功
                    //商户订单号
                    var out_trade_no = transdata.out_trade_no;
                    //微信交易号
                    var trade_no = transdata.transaction_id;
                    if ((transdata.status==0)&&(transdata.result_code==0)&&(transdata.pay_result==0)) {
                        var total_fee = transdata.total_fee;
                        interfaces.confirm_order({
                            req: req,
                            data: {
                                orderID: out_trade_no,
                                outgoodisID: trade_no,
                                total_fee:total_fee/100,
                                paytype:1,
                            }
                        });
                        res.send("success");
                    }else{
                        res.send('fail');
                    }
                }else{
                    res.send('fail');
                }
            });
        }else{
            res.send('fail');
        }
    });
}

Wxpay.prototype.create_direct_pay_by_user_return = function (req, res) {
    var self = this;
    var _POST = req.method == 'POST' ? req.body : req.query;
    var return_url = _POST.attach;
    return_url = new Buffer(return_url, 'base64').toString();
    res.redirect(return_url);
}

exports.Wxpay = Wxpay;




