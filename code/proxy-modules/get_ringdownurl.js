/**
 * Created by XUER on 2016-3-6.
 * 获取下载地址
 */
"use strict";

var business = require('../business-modules');
var interfaces = require('../interface-modules');
var proxy = require('./base_proxy');

exports = module.exports = function(option) {
    var req = option.req,
        config = req.config,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    if (isNaN(query.rid)) {
        res.send({
            s: 0,
            msg: '无效的铃声ID！'
        });
    }
    else query.rid = parseInt(query.rid);
    if (isNaN(query.source)) query.source = 1; else query.source = parseInt(query.source);
    if (isNaN(query.type)) query.type = 1; else query.type = parseInt(query.type);

    var getUrls = function (r) {
        if (query.source == 100 || query.source == 101) {
            res.send({
                s: 0,
                msg: 'DIY铃声下载代码未实现'
            });
        }
        else {
            interfaces.get_ring_urls({
                req: req,
                data: {
                    ringid: query.rid,
                    source: query.source,
                    type: query.type
                },
                success: function (urls) {
                    var url = null;
                    if (urls) {
                        for (var i in urls) {
                            if (urls[i].type.toString() == '2') {
                                url = urls[i].url+'&rname='+encodeURI(query.rname);
                                console.info(url);
                                break;
                            }
                        }
                    }
                    if (url) {
                        r.s = 1;
                        r.data = url;
                        res.send(r);
                    }
                    else {
                        r.s = 0;
                        r.msg = '获取地址失败！';
                        res.send(r);
                    }
                },
                error: function (err) {
                    r.s = 0;
                    r.msg = err.message;
                    res.send(r);
                }
            });
        }
    };
    var freeDownLoad = true;
    if (freeDownLoad || config.downring.serve.toString() == '0') {
        getUrls({});
    }
    else {
        proxy.loginCheck({
            req: req,
            yes: function () {
                if (config.downring.serve.toString() == '2') {
                    proxy.openCrbtCheck({
                        req: req,
                        yes: function (crbt) {
                            proxy.openOrderCheck({
                                req: req,
                                yes: function (order) {
                                    var r = {};
                                    if (crbt) extend(r, crbt);
                                    if (order) extend(r, order);
                                    getUrls(r);
                                },
                                no: function (r) {
                                    if (crbt) extend(r, crbt);
                                    if (config.crbt.mode.toString() == '2') {
                                        business.isCrbtFreeSupport({
                                            req: req,
                                            callback: function (isSupport) {
                                                if (isSupport)
                                                    res.send(r);
                                                else
                                                    res.send({
                                                        s: -33,
                                                        msg: '非常抱歉，您的手机号暂时不能参加本次活动！'
                                                    });
                                            }
                                        });
                                    }
                                    else
                                        res.send(r);
                                }
                            });
                        },
                        no: function (r) {
                            res.send(r);
                        }
                    });
                }
                else
                    proxy.openOrderCheck({
                        req: req,
                        yes: function () {
                            getUrls({});
                        },
                        no: function (r) {
                            res.send(r);
                        }
                    });
            },
            no: function (r) {
                res.send(r);
            }
        });
    }
}