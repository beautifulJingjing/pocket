/**
 * 数据接口
*/
"use strict";

var express = require('express');
var router = express.Router();

var proxy = require('../../code/proxy-modules/index');
var current = require('../../code/current');
var configer = require('../../code/configer');

function proxyRouterHandle(req, res, next) {
  req.current = new current.create(req);
  var option = {
    req: req
  };
  var cmd = req.query.cmd || req.body.cmd;
  switch (cmd) {
    //静态数据获取接口
    case 'get-ringlist'://取栏目铃声列表
      proxy.get_ringlist(option);
      break;
    case 'get-ringinfo'://取铃声详细
      proxy.get_ringinfo(option);
      break;
    case 'get-parts'://取栏目列表
      proxy.get_parts(option);
      break;
    case 'get-acts'://取活动列表
      proxy.get_acts(option);
      break;
    case 'search'://搜索
      proxy.get_search(option);
      break;
    case 'search-nocache'://搜索不写入缓存
      proxy.get_search_nocache(option);
      break;
    case 'get-searchkey'://取热门搜索关键字
      proxy.get_searchkey(option);
      break;
    case 'get-searchhot'://取热门搜索铃音
       proxy.get_searchhot(option);
       break;
    case 'get-taglist'://获取推荐标签列表
      proxy.get_taglist(option);
      break;

    //用户交互接口
    case 'feedback'://意见反馈
      proxy.feedback(option);
      break;
    case 'get-lotter'://抽奖
      proxy.get_lottery(option);
      break;
    case 'get-lotternum'://查抽奖次数
      proxy.get_lottery_num(option);
      break;
    case 'get-lotterlog'://查中抽奖列表
      proxy.get_lottery_log(option);
      break;
    case 'user-get-crbt-list'://获取用户个人铃音库列表
      proxy.user_get_crbt_list(option);
      break;
    case 'delete-user-ring'://删除用户个人铃音库铃音
      proxy.delete_user_ring(option);
      break;
    case 'get-receivenum'://获取领取人数
      proxy.get_receive_num(option);
      break;

    case 'login'://登录
      proxy.login(option);
      break;
    case 'check-order'://检查会员状态
      proxy.check_order(option);
      break;
    case 'off-order'://退订会员
      proxy.off_order(option);
      break;

    case 'clear-cache'://清理缓存
      proxy.clear_cache(option);
      break;
    case 'get-imgcode'://获取图片验证码
      proxy.get_imgcode(option);
      break;

    //需要config的接口
    default:
      configer.get(req.current.spinfocode(), function (config) {
        req.config = config;

        var cmd = req.query.cmd || req.body.cmd;
        switch (cmd) {
          case 'open_orderreport'://移动用户付费通知
            proxy.open_orderreport(option);
            break;
          case 'get-checkcode'://获取验证码
            proxy.get_checkcode(option);
            break;
          case 'login-order'://登录并开通会员
            proxy.login_order(option);
            break;
          case 'login-crbt'://登录并开通彩铃
            proxy.login_crbt(option);
            break;
          case 'phonechecked'://运营商验证码登录
            proxy.phonechecked(option);
            break;
          case 'check-crbt'://检查彩铃状态
            proxy.check_crbt(option);
            break;
          case 'check-crbt-open'://检查彩铃状态，若不是便开通
            proxy.check_crbt_open(option);
            break;
          case 'login-get-userinfo'://通过登录得用户信息
            proxy.login_get_userinfo(option);
            break;
          case 'check-onfreecrbt'://检查能否参加0元彩铃
            proxy.check_onfreecrbt(option);
            break;
          case 'check-serve'://检查会员、彩铃业务状态
            proxy.check_serve(option);
            break;
          case 'open-order'://开会员
            proxy.open_order(option);
            break;
          case 'open-crbt'://开彩铃
            proxy.open_crbt(option);
            break;
          case 'set-serve'://会员、彩铃服务设置
            proxy.set_serve(option);
            break;
          case 'set-ring'://彩铃设置
            proxy.set_ring(option);
            break;
          case 'payed-set-ring'://第三方支付后彩铃设置
            proxy.payed_set_ring(option);
            break;
          case 'get-ringdownurl'://获取下载地址
            proxy.get_ringdownurl(option);
            break;
          case 'get-outordercode'://获取下载地址
            proxy.get_outordercode(option);
            break;
          case 'generate-order'://生成订单
            proxy.generate_order(option);
            break;
        }
      });
      break;
  }
}

//静态数据获取接口
router.all('/proxy.html', proxyRouterHandle);//html页面缓存（保留）
router.all('/proxy.ahtml', proxyRouterHandle);//根据参数缓存

//用户交互接口
router.all('/proxy.aspx', proxyRouterHandle);

module.exports = router;
