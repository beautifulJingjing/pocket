"use strict";

var express = require('express');
var router = express.Router();
var interfaces = require('../code/interface-modules');
var current = require('../code/current');
var configer = require('../code/configer');
var trace = require('../code/trace');

var option = {
    title: '口袋铃声',
    isclick:false,
    spinfocode: '',
    config: '',
    top:{show: true},
    back: {
        show: false,
        title: ''
    },
    foot: {
        download: false,
        ringbox: true
    }
};
router.use(/^(.+)?(,|\/)([0-9]+).*$/i, function(req, res, next){
    req.current = new current.create(req);
    req.current.spinfocode(req.params[2]);
    trace.pv({req:req});
    configer.get(req.current.spinfocode(), function (config) {
        option.top.show = true;
        option.back.show = true;
        option.back.title = '';
        option.spinfocode = config.id;
        option.config = JSON.stringify(config);
        option.isclick = req.session.isclick||false;
        next();
    });
});
router.all(/^\/test,?(\d*)?.html?$/i, function (req, res, next) {
    option.back.show = false;
    res.render('m/test/test', option);
});
router.all(/^\/tem,?(\d*)?.html?$/i, function (req, res, next) {
    option.back.show = false;
    option.idx=req.query.idx;
    res.render('m/tem', option);
});
router.all(/^\/index,?(\d*)?.html?$/i, function (req, res, next) {
    option.back.show = false;
    var urll = req.params[0];
    console.log(urll);
    res.redirect("http://mt.ringbox.cn/m/"+urll+".html");
});
router.all(/^\/partlist,id=([-\d]*),?(\d*)?.html?$/i, function (req, res, next) {
    option.top.show = true;
    interfaces.get_parts({
        req: req,
        data: {pid: req.params[0]},
        success: function(data){
            if(data.list){
                var part = data.list[0];
                if(part)
                    option.back.title = part.name;
            }
            res.render('m/partlist', option);
        },
        error:function(){
            res.render('m/partlist', option);
        }
    });
});
router.all(/^\/tops,?(\d*)?.html?$/i, function (req, res, next) {
    res.render('m/tops', option);
});
router.all(/^\/search,?(\d*)?.html?$/i, function (req, res, next) {
    option.top.show = false;
    res.render('m/search', option);
});
router.get(/^\/search,key=(.[^,]*),?(\d*)?.html?$/i, function (req, res, next) {
    option.top.show = false;
    option.back.title = req.params[0];
    res.render('m/search', option);
});
router.get(/^\/share,key=(.[^,]*),?(\d*)?.html?$/i, function (req, res, next) {
    option.top.show = false;
    option.title = '口袋铃声';
    res.render('m/wechat_share', option);
});
router.get(/^\/payback,?(\d*)?.html?$/i, function (req, res, next) {
    option.top.show = false;
    option.title = '口袋铃声';
    res.render('m/payback', option);
});
router.get(/^\/paycode,?(\d*)?.html?$/i, function (req, res, next) {
    option.back.show = false;
    option.title = '口袋铃声';
    option.imageurl = req.query.imageurl;
    res.render('m/paycode', option);
});
router.all(/^\/feedback,?(\d*)?.html?$/i, function (req, res, next) {
    option.top.show = false;
    option.back.title = '意见反馈';
    res.render('m/feedback', option);
});

router.all(/^\/userCenter,?(\d*)?.html?$/i, function (req, res, next) {
    option.top.show = false;
    option.back.title = '会员中心';
    option._phone = false;
    option.phone = '手机号码';
    option.orderstate='会员状态';
    if(req.session.USER){
        option.phone = req.session.USER.phone;
        option._phone = true;
        option.orderstate = req.session.USER.orderstate == 4 ? '非会员' : '会员';
    }
    res.render('m/userCenter', option);
});
router.all(/^\/help,?(\d*)?.html?$/i, function (req, res, next) {
    option.top.show = false;
    option.back.show = true;
    option.back.title = '帮助';
    res.render('m/help', option);
});
router.all(/^\/(\d*)?.html?$/i, function (req, res, next) {
    option.back.show = false;
    /*var _url = req.params[0];
    if(_url == '00000350254' || _url == '00000350255' || _url == '00000350253') {
        res.redirect('http://m.ringbox.cn/m/tem,'+_url+'.html');
    }
    else {*/
        res.render('m/pop/6', option);
    /*}*/
});
router.all(/^\/pop\/1,?(\d*)\.html$/i,function(req, res, next){
    option.back.show = false;
    res.render('m/pop/1', option);
});
router.all(/^\/pop\/2,?(\d*)\.html$/i,function(req, res, next){
    option.back.show = false;
    res.render('m/pop/2', option);
});
router.all(/^\/pop\/3,?(\d*)\.html$/i,function(req, res, next){  //2月份活动
    option.back.show = false;
    res.render('m/pop/3', option);
});
router.all(/^\/pop\/5,?(\d*)\.html$/i,function(req, res, next){  //移动6元权益包装-双重豪礼
    option.back.show = false;
    res.render('m/pop/5', option);
});
router.all(/^\/pop\/6,?(\d*)\.html$/i,function(req, res, next){  //移动6元权益包装-三重豪礼
    option.back.show = false;
    res.render('m/pop/6', option);
});

//抽奖活动
router.all(/^\/zt\/zt(\d+)\//i, function (req, res, next) {
    option.back.show = false;
    res.render('m/zt/zt'+ req.params[0] +'/index',option);
});


module.exports = router;
