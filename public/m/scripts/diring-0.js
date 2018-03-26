//JSON转换支持
if (typeof JSON !== "object") $.getScript("/script/json2.min.js");
//弹窗控件
var mbox = (function () {
  //用来记录要显示的DIV
  var _box;
  //弹出对话窗口(要显示的div对象)
  function alert(div) {
    //把要显示的div居中显示
    if (_box) { _box.style.display = 'none'; }
    if (div) {
      _box = div;
      alertbox();
      $(window).on('resize scroll', alertbox);
    }
    if (!document.getElementById("EV_AlertMask")) {
      alertmask();
      $(window).on('resize scroll', alertmask);//窗口大小改变时更正显示大小和位置
    }
    if ($$.alertevent)
      $$.alertevent.call();
  };
  //关闭对话窗口   
  function close(box) {
    if (box && !box.preventDefault && box != _box) return;//!box.preventDefault 判断box为非事件对象
    if (_box) {
      _box.style.display = 'none';
      $(window).off('resize scroll', alertbox);
    }
    if (document.getElementById("EV_AlertMask")) {
      closemask();
      $(window).off('resize scroll', alertmask);
    }
    if ($$.closeevent)
      $$.closeevent.call();
  };
  //把要显示的div居中显示
  function alertbox() {
    _box.style.display = 'block';
    var _t = $(window).scrollTop() + Math.round(($(window).height() - _box.offsetHeight) / 2);
    var _l = $(window).scrollLeft() + Math.round(($(window).width() - _box.offsetWidth) / 2);
    with (_box) {
      style.top = (_t < 0 ? 0 : _t) + "px";
      style.left = (_l < 0 ? 0 : _l) + "px";
      style.position = "absolute";
      style.zIndex = "10001";
    }
  };
  //显示关闭遮罩层
  function alertmask() {
    var mask = document.getElementById("EV_AlertMask");
    if (!mask) {
      mask = document.createElement("div");
      mask.setAttribute('id', 'EV_AlertMask');
      document.body.appendChild(mask);
    }
    with (mask) {
      style.position = "absolute";
      style.top = "0px";
      style.left = "0px";
      style.width = Math.max((document.documentElement.scrollWidth || document.body.scrollWidth || 0), $(window).width()) + "px";
      style.height = Math.max((document.documentElement.scrollHeight || document.body.scrollHeight || 0), $(window).height()) + "px";
      style.zIndex = "10000";
      style.background = "#231815";
      style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=50,finishOpacity=50);";
      style.opacity = "0.5";
    }
  };
  function closemask() {
    var mask = document.getElementById("EV_AlertMask");
    if (mask)
      document.body.removeChild(mask);
  };

  function checking(option) {
    if (!option) option = {};
    var box = checking.setting;
    box.title.html(option.title || '验证手机号');
    box.explain.html((option.explain || '').toHtml());
    box.phone.val(option.phone || '');
    box.checkcode.val('');
    box.getcode.off('click').click(function (e) {
      option.getcodeEvent(e, { phone: box.phone.val() });
    });
    box.check.html(option.check || '确定').off('click').click(function (e) {
      option.checkEvent(e, { phone: box.phone.val(), checkcode: box.checkcode.val() });
    });
    alert(box[0]);
    if (option.log) {
      option.log.call();
      delete option.log;
    }
    return box[0];
  }
  function service(option) {
    if (!option) option = {};
    var box = explain.setting;
    box.title.html(option.title || '开通服务');
    box.explain.html((option.explain || '').toHtml());
    box.left.show().html(option.cancel || '取消').off('click').click(option.cancelEvent || close);
    box.right.show().html(option.confirm || '确认').off('click').click(option.confirmEvent);
    box.center.hide();
    alert(box[0]);
    if (option.log) {
      option.log.call();
      delete option.log;
    }
    return box[0];
  }
  function explain(option) {
    var box = explain.setting;
    box.title.html(option.title || '提示');
    box.explain.html(option.explain.toHtml());
    box.left.hide();
    box.right.hide();
    box.center.show().html(option.confirm || '我知道了~').off('click').click(option.confirmEvent || close);
    alert(box[0]);
    if (option.log) {
      option.log.call();
      delete option.log;
    }
    return box[0];
  }

  var $$ = {
    //指定弹窗
    alert: alert,
    //弹窗关闭
    close: close,
    //弹窗触发事件
    alertevent: null,
    //弹窗关闭触发事件
    closeevent: null,
    //特定弹窗
    waiting : function (msg) {
      var dv = $('#waiting');
      dv.find('span').text(msg);
      alert(dv[0]);
      return dv[0];
    },
    //微信提示
    weixinprompt: function () {
      var dv = document.getElementById('wxbrowse-prompt');
      alert(dv);
      return dv;
    },
    //弹窗对象初始化
    setting : function () {
      var setting = $('#alert-checking');
      $.extend(setting, {
        title: setting.find('#title'),
        explain: setting.find('#explain'),
        phone: setting.find('#txt-phone'),
        checkcode: setting.find('#txt-checkcode'),
        getcode: setting.find('#btn-getcode'),
        check: setting.find('#btn-check')
      });
      checking.setting = setting;

      setting = $('#alert-msg');
      $.extend(setting, {
        title: setting.find('#title'),
        explain: setting.find('#explain'),
        left: setting.find('#btn-left'),
        right: setting.find('#btn-right'),
        center: setting.find('#btn-enter')
      });
      explain.setting = setting;
      delete setting;
    },
    //手机号校验弹窗
    checking: checking,
    //提示确定取消弹窗
    service: service,
    //说明弹窗
    explain : explain,
  };
  return $$;
})();
//音频播放器
var mplayer = (function () {
  var $$ = {
    audio: null,//播放器对象
    lasttarget: null,//上次播放对象
    target: null,//当前播放对象
    play: null,//播放事件
    pause: null,//停止事件
    loadstart: null,//开始请求数据
    error: null,//错误事件
    init: function (option) {
      $.extend($$, option);
      with (this.audio = new Audio()) {//播放器实例化 
        volume = 0.8;
        preload = 'metadata';
        autoPlay = false;
        addEventListener('loadstart', function () { if ($$.loadstart) $$.loadstart(); });
        addEventListener('error', function () {
          setTimeout(function () { //UC浏览器下，有error的情况下仍可播放
            if (paused || ended) {
              pause();
              if ($$.error) $$.error();
              alert(error.code + '\r\n' + networkState + '\r\n' + readyState + '\r\n' + currentSrc);
            }
          }, 3000);
        });
        addEventListener('loadedmetadata', function () { play(); });
        addEventListener('play', function () { if ($$.play) $$.play(); });
        addEventListener('pause', function () { if ($$.pause) $$.pause(); });
        addEventListener('ended', function () { if ($$.pause) $$.pause(); });
      }
    },
    setCurrentTime: function (second) { this.audio.currentTime = second; },
    doPlay: function (_src, _target) {
      with (this.audio) {
        if (src.indexOf(_src) > -1) {
          if (!$$.target) $$.target = _target;
          if (paused || ended) { currentTime = 0; play(); }
          else pause();
        }
        else if (_src) {
          if ($$.target) {
            if (!(paused || ended)) {
              pause();
              if ($$.pause) $$.pause();
            }
            $$.lasttarget = $$.target;
          }
          $$.target = _target;
          src = _src;
          load();
        }
      }
    },
    //停止播放并清理target
    doStop: function () {
      with (this.audio) {
        if (!(paused || ended)) {
          var pauseEvent = function () {
            $$.target = null;
            removeEventListener('pause', pauseEvent)
          }
          addEventListener('pause', pauseEvent);
          pause();
          $$.lasttarget = $$.target;
        }
        else {
          $$.lasttarget = $$.target;
          $$.target = null;
        }
      }
    },
  };
  return $$;
})();
//联通号码校验正则
var unicom = { regexPhone: new RegExp(/^((13[0-2])|145|(15[5|6])|176|(18[5|6]))\d{8}$/) };
//电信号码校验正则
var telecom = { regexPhone: new RegExp(/^(133|153|177|(18[0|1|9]))\d{8}$/) };
//铃声DIY
var app = (function () {
  var $$ = {
    spinfocode: '0',//渠道
    connection: navigator.connection || { type: '' },//获取当前网络连接方式，部分浏览器支持
    unikey: 0//透传状态，1=已透传，0=未透传
  };
  var pushinfo = {};
  var user = {
    //用户会员判断
    isorder: function () { return (this.orderstate && this.orderstate != 4) },
    logined: function () {
      if (typeof this.phone != 'string' || this.phone == '' || typeof this.id != 'string' || this.id == '') 
        return false;
      else if (!unicom.regexPhone.test(this.phone))
        return this.isorder();
      else return true;
    },
    change: []//用户信息变更执行
  };

  var log = function (option) {
    $.ajax({
      url: "/proxy/v3/log.aspx",
      data: {
        spinfocode: $$.spinfocode,
        type: option.type || 'event',
        name: option.name,
        params: JSON.stringify(option.params),
        network: $$.connection.type,
        referer: option.referer || location.pathname,
        msg: option.msg || ''
      },
      dataType: 'json',
      cache: false,
      type: 'get'
    });
  }

  var doPlay = function (e) {
    if (e.type !== undefined) { e = this; }
    else if (e.target || e.srcElement) e = e.target || e.srcElement;
    var sender = $(e);
    if (sender.data('rid') === undefined) { sender = sender.parents('.musics').find('.btn-play'); }
    mplayer.doPlay('/proxy/v3/audition.aspx?rid={0}'.format(sender.data('rid')), sender);
  }
  var doDownload = function (e) {
    if (e.type !== undefined) { e = this; }
    else if (e.target || e.srcElement) e = e.target || e.srcElement;
    var sender = $(e).off('click');
    var data = {
      spinfocode: $$.spinfocode,
      rid: sender.data('rid'),
      source: sender.data('source') || 1
    };
    if (/javascript:;|javascript:void\(0\);/g.test(sender.attr('href'))) {
      data.cmd = 'get-ringdownurl';
      var ajaxSettings = {
        sender: sender,
        url: "/proxy/v3/proxy.aspx",
        async: false,
        data: data,
        dataType: 'json',
        cache: false,
        type: 'post',
        beforeSend: function () {
          mbox.waiting('获取地址中,请稍候……');
          sender.click(doDownload);
        },
        success: function (r) {
          if (r.order) {
            if (r.order.s == 1) {
              $.extend(user, r.data);
              user.change.forEach(function (func) { func.call(); });
            }
          }
          if (r.s == 1) {
            sender.attr({ 'href': r.data });
            location.href = r.data;
            mbox.close();
          }
          else {
            var option = { callback: function () { $.ajax(ajaxSettings); } };
            if (r.s == -10) {
              alertLoginOpen(option);
            }
            else if (r.s == -20) {
              if (pushinfo.order.pop.type == 2)
                mbox.explain({
                  title: pushinfo.order.pop.title,
                  explain: user.phone + pushinfo.order.pop.content
                });
              else
                alertOpenOrder(option);
            }
            else if (r.s == -30) {
              if (pushinfo.crbt.pop.type == 2)
                mbox.explain({
                  title: pushinfo.crbt.pop.title,
                  explain: user.phone + pushinfo.crbt.pop.content
                });
              else
                alertOpenCrbt(option);
            }
            else if (r.s == 14) {//下发短信，等待回复开通
              mbox.explain({
                title: pushinfo.crbt.succ.title,
                explain: user.phone + pushinfo.crbt.succ.content
              });
            }
            else if (r.s == 15) {//下发短信，等待回复开通
              mbox.explain({
                title: pushinfo.order.succ.title,
                explain: user.phone + pushinfo.order.succ.content
              });
            }
            else if (r.s == 31) {
              if (pushinfo.crbt.asyncsucc.content)
                mbox.explain({
                  title: pushinfo.crbt.asyncsucc.title,
                  explain: pushinfo.crbt.asyncsucc.content
                });
              else
                mbox.explain({ explain: r.msg });
            }
            else {
              mbox.explain({ explain: r.msg });
            }
          }
        }
      };
      var waittime = 8000;
      var wait = setInterval(function () {
        if ($$.unikey || waittime <= 0) {
          clearInterval(wait);
          $.ajax(ajaxSettings);
          log({ name: sender.data('trace') || 'doDown', params: data });
        }
        waittime -= 500;
      }, 500);
      return false;
    }
    log({ name: sender.data('trace') || 'doDown', params: data });
    return true;
  }
  var doSetRing = function (e) {
    if (e.type !== undefined) { e = this; }
    else if (e.target || e.srcElement) e = e.target || e.srcElement;
    var sender = $(e).off('click');
    var data = {
      cmd: 'set-ring',
      spinfocode: $$.spinfocode,
      rid: sender.data('rid'),
      type: sender.data('type') || 1
    };
    var ajaxSettings = {
      sender: sender,
      url: "/proxy/v3/proxy.aspx",
      data: data,
      dataType: 'json',
      cache: false,
      type: 'post',
      beforeSend: function () {
        mbox.waiting('设置中,请稍候……');
        sender.click(doSetRing);
      },
      success: function (r) {
        if (r.order) {
          if (r.order.s == 1) {
            $.extend(user, r.data);
            user.change.forEach(function (func) { func.call(); });
          }
        }
        if (r.s == 1) {
          var opt = {
            title: pushinfo.ringset.singleset.succ.title,
            explain: pushinfo.ringset.singleset.succ.content
          };
          if (data.rid.toString().indexOf(',') > -1)
            opt = {
              title: pushinfo.ringset.muchset.succ.title,
              explain: pushinfo.ringset.muchset.succ.content
            };
          if (ajaxSettings.plus) {
            switch (ajaxSettings.plus.stack) {
              case 'openorder':
                opt.explain = pushinfo.order.succ.content + '\r\n' + opt.explain;
                break;
              case 'opencrbt':
                opt.explain = pushinfo.crbt.succ.content + '\r\n' + opt.explain;
                break;
            }
          }
          if (pushinfo.declare.message.content)
            opt.explain += '<br/><a href="{1}" class="uline">{0}</a>'.format(pushinfo.declare.message.content, pushinfo.declare.message.link);
          mbox.explain(opt);
        }
        else {
          var option = {
            sender: sender,
            callback: function (plus) {
              if (ajaxSettings.plus) $.extend(ajaxSettings.plus, plus);
              else ajaxSettings.plus = plus;
              $.ajax(ajaxSettings);
            }
          };
          if (r.s == -10) {
            alertLoginOpen(option);
          }
          else if (r.s == -20) {
            if (pushinfo.order.pop.type == 2)
              mbox.explain({
                title: pushinfo.order.pop.title,
                explain: user.phone + pushinfo.order.pop.content
              });
            else
              alertOpenOrder(option);
          }
          else if (r.s == -30) {
            if (pushinfo.crbt.pop.type == 2)
              mbox.explain({
                title: pushinfo.crbt.pop.title,
                explain: user.phone + pushinfo.crbt.pop.content
              });
            else
              alertOpenCrbt(option);
          }
          else if (r.s == -32) {
            mbox.service({
              title: "设置彩铃",
              explain: r.msg,
              confirmEvent: function (e) {
                ajaxSettings.data.confirm = 1;
                $.ajax(ajaxSettings);
              }
            });
          }
          else if (r.s == -33) {
            mbox.explain({ explain: r.msg });
          }
          else if (r.s == 14) {//下发短信，等待回复开通
            mbox.explain({
              title: pushinfo.crbt.succ.title,
              explain: user.phone + pushinfo.crbt.succ.content
            });
          }
          else if (r.s == 15) {//下发短信，等待回复开通
            mbox.explain({
              title: pushinfo.order.succ.title,
              explain: user.phone + pushinfo.order.succ.content
            });
          }
          else if (r.s == 31) {
            if (pushinfo.crbt.asyncsucc.content)
              mbox.explain({
                title: pushinfo.crbt.asyncsucc.title,
                explain: pushinfo.crbt.asyncsucc.content
              });
            else
              mbox.explain({ explain: r.msg });
          }
          else { //设置失败
            var opt = {
              title: pushinfo.ringset.singleset.fail.title,
              explain: pushinfo.ringset.singleset.fail.content
            };
            if (data.rid.toString().indexOf(',') > -1)
              opt = {
                title: pushinfo.ringset.muchset.fail.title,
                explain: pushinfo.ringset.muchset.fail.content
              };
            mbox.explain(opt);
          }
        }
      }
    };
    var waittime = 8000;
    var wait = setInterval(function () {
      if ($$.unikey || waittime <= 0) {
        clearInterval(wait);
        $.ajax(ajaxSettings);
        log({ name: sender.data('trace') || 'doSetRing', params: data });
      }
      waittime -= 500;
    }, 500);
  }
  var doOnServe = function (e, option) {
    if (e.type === undefined) { option = e; e = this; }
    else if (e.target || e.srcElement) e = e.target || e.srcElement;
    var sender = $(this).off('click');
    var ajaxSettings = {
      sender: sender,
      url: "/proxy/v3/proxy.aspx",
      data: {
        cmd: 'set-serve',
        spinfocode: $$.spinfocode
      },
      dataType: 'json',
      cache: false,
      type: 'post',
      beforeSend: function () {
        mbox.waiting('设置中,请稍候……');
        sender.click(doOnServe);
        console.log(option);
      },
      success: function (r) {
        if (r.s == 1) {
          if (r.data) {
            $.extend(user, r.data);
            user.change.forEach(function (func) { func.call(); });
          }
          var opt = {
            title: pushinfo.order.succ.title,
            explain: pushinfo.order.succ.content
          };
          if (ajaxSettings.plus) {
            switch (ajaxSettings.plus.stack) {
              case 'opencrbt':
                opt = {
                  title: pushinfo.crbt.succ.title,
                  explain: pushinfo.crbt.succ.content
                };
                break;
              case 'openorder':
                opt = {
                  title: pushinfo.order.succ.title,
                  explain: pushinfo.order.succ.content
                };
                break;
            }
          }
          if (pushinfo.declare.message.content)
            opt.explain += '<br/><a href="{1}" class="uline">{0}</a>'.format(pushinfo.declare.message.content, pushinfo.declare.message.link);
          if (option && option.callback)
            opt.confirmEvent = option.callback;
          mbox.explain(opt);
        }
        else {
          var opt = {
            callback: function (plus) {
              if (ajaxSettings.plus) $.extend(ajaxSettings.plus, plus);
              else ajaxSettings.plus = plus;
              $.ajax(ajaxSettings);
            }
          };
          if (r.s == -10) {
            alertLoginOpen(opt);
          }
          else if (r.s == -20) {
            if (pushinfo.order.pop.type == 2)
              mbox.explain({
                title: pushinfo.order.pop.title,
                explain: user.phone + pushinfo.order.pop.content
              });
            else
              alertOpenOrder(opt);
          }
          else if (r.s == -30) {
            if (pushinfo.crbt.pop.type == 2)
              mbox.explain({
                title: pushinfo.crbt.pop.title,
                explain: user.phone + pushinfo.crbt.pop.content
              });
            else
              alertOpenCrbt(opt);
          }
          else if (r.s == -33) {
            mbox.explain({ explain: r.msg });
          }
          else if (r.s == 14) {//下发短信，等待回复开通
            mbox.explain({
              title: pushinfo.crbt.succ.title,
              explain: user.phone + pushinfo.crbt.succ.content
            });
          }
          else if (r.s == 15) {//下发短信，等待回复开通
            mbox.explain({
              title: pushinfo.order.succ.title,
              explain: user.phone + pushinfo.order.succ.content
            });
          }
          else if (r.s == 31) {
            if (pushinfo.crbt.asyncsucc.content)
              mbox.explain({
                title: pushinfo.crbt.asyncsucc.title,
                explain: pushinfo.crbt.asyncsucc.content
              });
            else
              mbox.explain({ explain: r.msg });
          }
          else { //设置失败
            mbox.explain({ explain: r.msg });
          }
        }
      }
    };
    var waittime = 8000;
    var wait = setInterval(function () {
      if (app.unikey || waittime <= 0) {
        clearInterval(wait);
        $.ajax(ajaxSettings);
        app.log({ name: sender.data('trace') || 'doOpenServe', params: ajaxSettings.data });
      }
      waittime -= 500;
    }, 500);
  }
  var doSendCheckcode = function (e, option) {
    if (e.type === undefined) { option = e; e = this; }
    else if (e.target || e.srcElement) e = e.target || e.srcElement;
    if (!option.phone) { alert('请输入您的手机号码。'); return; }
    var data = {
      cmd: 'get-checkcode',
      spinfocode: $$.spinfocode,
      phone: option.phone,
      dir: option.dir
    };
    if (option.type) data.type = option.type;
    log({ name: 'doSendCheckcode.Before', params: data });
    if (!(unicom.regexPhone.test(option.phone.trim()) || telecom.regexPhone.test(option.phone.trim()))) { alert("亲，别闹了，搞个联通或电信的手机号码再来！"); return; }
    var sender = $(e).off('click');
    $.ajax({
      sender: sender,
      url: "/proxy/v3/proxy.aspx",
      data: data,
      dataType: 'json',
      cache: false,
      type: 'post',
      beforeSend: function () {
        mbox.waiting('验证码发送中,请稍候……');
        sender.click(function (e) { doSendCheckcode(e, option); });
      },
      success: function (r) {
        if (r.s == 1)
          mbox.explain({
            explain: "短信验证码已下发到您的手机，请留意手机短信通知。",
            confirmEvent: option.callback
          });
        else
          mbox.explain({ explain: r.msg });
      }
    });
    log({ name: 'doSendCheckcode', params: data });
  }
  var doLogin = function (e, option) {
    if (e.type === undefined) { option = e; e = this; }
    else if (e.target || e.srcElement) e = e.target || e.srcElement;
    if (!option.phone) { alert('请输入您的手机号码。'); return; }
    if (!option.checkcode) { alert('请输入验证码。'); return; }
    if (!(unicom.regexPhone.test(option.phone.trim()) || telecom.regexPhone.test(option.phone.trim()))) { alert("亲，别闹了，搞个联通或电信的手机号码再来！"); return; }
    var data = {
      cmd: option.cmd || 'login',
      spinfocode: $$.spinfocode,
      phone: option.phone,
      checkcode: option.checkcode
    };
    if (option.single) data.single = option.single;
    var sender = $(e).off('click');
    $.ajax({
      sender: sender,
      url: "/proxy/v3/proxy.aspx",
      data: data,
      dataType: 'json',
      cache: false,
      type: 'post',
      beforeSend: function () {
        mbox.waiting('用户验证,请稍候……');
        sender.click(function (e) { doLogin(e, option); });
      },
      success: function (r) {
        if (r.s == 1) {
          $.extend(user, r.data);
          user.change.forEach(function (func) { func.call(); });
          mbox.close();
          if (r.crbt) {
            if (r.crbt.s == 30) { if (option.callback) option.callback({ stack: 'opencrbt' }); }//开通彩铃标识
            else if (r.crbt.s == 1) { if (option.callback) option.callback(); }
            else mbox.explain({ explain: r.crbt.msg });//-33、-31
          }
          else if (r.order) {
            if (r.order.s == 20) { if (option.callback) option.callback({ stack: 'openorder' }); }//开能会员标识
            else if (r.order.s == 1) { if (option.callback) option.callback(); }
            else mbox.explain({ explain: r.order.msg });//-21
          }
          else if (option.callback) 
            option.callback();
        }
        else {
          mbox.explain({ explain: r.msg });
        }
      }
    });
    var opt = { name: 'alertLogin.doOK', params: data };
    if (option.cmd == 'login-order') opt.name = 'alertLoginOrder.doOK';
    else if (option.cmd == 'login-crbt') opt.name = 'alertLoginCrbt.doOK';
    log(opt);
  }
  var doLoginOpen = function (e, option) {
    if (pushinfo.login.mode == 2) option.cmd = 'login-order';
    else if (pushinfo.login.mode == 3) option.cmd = 'login-crbt';
    doLogin(e, option);
  }

  var doOpenOrder = function (e, option) {
    if (e.type === undefined) { option = e; e = this; }
    else if (e.target || e.srcElement) e = e.target || e.srcElement;
    var sender = $(e);
    var data = {
      cmd: 'open-order',
      spinfocode: $$.spinfocode
    };
    if (option.single) data.single = option.single;
    $.ajax({
      sender: sender,
      url: "/proxy/v3/proxy.aspx",
      data: {
        cmd: 'open-order',
        spinfocode: $$.spinfocode
      },
      dataType: 'json',
      cache: false,
      type: 'get',
      beforeSend: function () { mbox.waiting('升级中,请稍候……'); },
      success: function (r) {
        if (r.s == 1) {
          $.extend(user, r.data);
          user.change.forEach(function (func) { func.call(); });
          mbox.close();
          if (option.callback) option.callback({ stack: 'openorder' });
        }
        else if (r.s == 15) {
          mbox.explain({
            title: pushinfo.order.succ.title,
            explain: user.phone + pushinfo.order.succ.content
          });
        }
        else {
          if (pushinfo.order.fail.content)
            mbox.explain({
              title: pushinfo.order.fail.title,
              explain: pushinfo.order.fail.content
            });
          else
            mbox.explain({ explain: r.msg });
        }
      }
    });
    log({ name: 'alertOpenOrder.doOK' });
  }
  var doOpenCrbt = function (e, option) {
    if (e.type === undefined) { option = e; e = this; }
    else if (e.target || e.srcElement) e = e.target || e.srcElement;
    var sender = $(e);
    $.ajax({
      url: "/proxy/v3/proxy.aspx",
      data: {
        cmd: 'open-crbt',
        spinfocode: $$.spinfocode
      },
      dataType: 'json',
      cache: false,
      type: 'get',
      beforeSend: function () { mbox.waiting('处理中,请稍候……'); },
      success: function (r) {
        if (r.s == 1) {
          if (r.data) {
            $.extend(user, r.data);
            user.change.forEach(function (func) { func.call(); });
          }
          mbox.close();
          if (option.callback) option.callback({ stack: 'opencrbt' });
        }
        else if (r.s == 14) {
          mbox.explain({
            title: pushinfo.crbt.succ.title,
            explain: user.phone + pushinfo.crbt.succ.content
          });
        }
        else if (r.s == 31) {
          if (pushinfo.crbt.asyncsucc.content)
            mbox.explain({
              title: pushinfo.crbt.asyncsucc.title,
              explain: pushinfo.crbt.asyncsucc.content
            });
          else
            mbox.explain({ explain: r.msg });
        }
        else if (r.s == -33)
          mbox.explain({ explain: r.msg });
        else {
          if (pushinfo.crbt.fail.content)
            mbox.explain({
              title: pushinfo.crbt.fail.title,
              explain: pushinfo.crbt.fail.content
            });
          else
            mbox.explain({ explain: r.msg });
        }
      }
    });
    log({ name: 'alertOpenCrbt.doOK' });
  }

  var alertLogin = function (r) {
    if (!r) r = {};
    mbox.checking({
      title: r.title || "验证手机号",
      explain: r.explain || '欢迎登录彩铃用户系统，请输入手机号和验证码，完成登录操作。',
      phone: r.phone,
      getcodeEvent: function (e, opt) {
        opt.loged = true;
        opt.dir = 1;
        doSendCheckcode(e, $.extend({ callback: function () { alertLogin($.extend(opt, r)); } }, opt));
      },
      checkEvent: function (e, opt) { 
        doLogin(e, $.extend(opt, r));
      },
      log:r.loged ? null : log({name:'alertLogin'})
    });
  };
  var alertLoginOpen = function (r) {
    if (!r) r = {};
    mbox.checking({
      title: r.title || pushinfo.login.pop.title,
      explain: r.explain || pushinfo.login.pop.content,
      phone: r.phone,
      getcodeEvent: function (e, opt) {
        opt.loged = true;
        opt.type = 1;//验证码用途
        opt.dir = pushinfo.login.mode;//使用方向
        doSendCheckcode(e, $.extend({ callback: function () { alertLoginOpen($.extend(opt, r)); } }, opt));
      },
      checkEvent: function (e, opt) {
        doLoginOpen(e, $.extend(opt, r));
      },
      log: r.loged ? null : log({ name: pushinfo.login.mode == 2 ? 'alertLoginOrder' : pushinfo.login.mode == 3 ?  'alertLoginCrbt' : 'alertLogin' })
    });
  };
  var alertOpenOrder = function (r) {
    if (!r) r = {};
    mbox.service({
      title: r.title || pushinfo.order.pop.title,
      explain: user.phone + (r.explain || pushinfo.order.pop.content),
      confirmEvent: function (e) { doOpenOrder(e, r); },
      log: log({ name: 'alertOpenOrder' })
    });
  };
  var alertOpenCrbt = function (r) {
    if (!r) r = {};
    mbox.service({
      title: r.title || pushinfo.crbt.pop.title,
      explain: user.phone + (r.explain || pushinfo.crbt.pop.content),
      confirmEvent: function (e) { doOpenCrbt(e, r); },
      log: log({ name: 'alertOpenCrbt' })
    });
  };

  $.extend($$, {
    pushinfo: pushinfo,
    user: user,//用户信息

    doPlay: doPlay,
    doDownload: doDownload,
    doSetRing: doSetRing,
    doOnServe: doOnServe,
    doSendCheckcode: doSendCheckcode,
    doLogin: doLogin,
    doLoginOpen: doLoginOpen,

    doOnOrder: doOpenOrder,
    doOnCrbt: doOpenCrbt,

    alertLogin: alertLogin,
    alertLoginOpen: alertLoginOpen,
    alertOpenOrder: alertOpenOrder,
    alertOpenCrbt: alertOpenCrbt,

    //日志
    log: log,
    //对象初始化
    init: function () {
      $.ajax({
        url: "/proxy/v3/comkey.aspx",
        data: {
          network: $$.connection.type,
          spinfocode: $$.spinfocode
        },
        dataType: 'json',
        cache: false,
        type: 'get',
        success: function (r) {
          $$.unikey = 1;
          if (r) {
            $.extend(user, r);
            user.change.forEach(function (func) {
              func.call();
            });
          }
        }
      });
      user.change.push(function () {
        var curnum = $('.curnum');
        if (user.logined()) {
          curnum.show().find('b').text(user.phone + '（' + user.orderstatestr + '）');
          curnum.find('a').off('click').click(function () {
            alertLogin();
          });
        }
        else curnum.hide();
        $('.divholder').height($('header .curnum').height());
      });
    },
    link: function (link) {
      if (/\/|\./g.test(link)) {
        if (/(\.htm$)|(\.html$)/i.test(link.split('?')[0])) {
          var reg = new RegExp($$.spinfocode);
          if (!reg.test(link))
            link = link.insert(',' + $$.spinfocode, link.lastIndexOf('.htm'));
        }
        else if (/(\/$)/.test(link.split('?')[0])) {
          if (link.indexOf('?') > -1) link = link.split('?')[0] + $$.spinfocode + '.html?' + link.split('?')[1];
          else link = link + $$.spinfocode + '.html';
        }
        else if (!/(\?|&)spinfocode=([^&]*)(&|$)/i.test(link)) {
          if (link.indexOf('?') > -1) link += '&'; else link += '?';
          link += 'spinfocode=' + app.spinfocode;
        }
      }
      return link;
    },
  });

  $$.staticsRequest = function () {
    var h = decodeURIComponent(location.href);
    if (h.endsWith('.html') || h.endsWith('.htm')) {
      if (h.indexOf(':') > 0) {
        h = h.substring(h.lastIndexOf('/') + 1); h = h.substring(h.indexOf(',') + 1);
        h = h.substring(0, h.lastIndexOf(','));
        h = h.replace(/=/g, ':');
        return eval('({' + h + '})');
      }
    }
    return null;
  };

  return $$;
})();
//地址加载方式重写
location.load = function (url) {
  location.href = app.link(url);
};
//静态地址重写request方法
if (/\.html?/gi.test(location.href)) {
  $.request = function (name) {
    var reg = new RegExp("," + name + "=([^,(\.html?)]*)", "i")
    var r = decodeURIComponent(location.href);
    r = r.match(reg)
    if (r != null)
      return r[1];
    return null;
  };
}
$(window).ready(function () {
  mbox.setting();
  if (!window.navigator.cookieEnabled) {
    mbox.explain({ explain: '很不幸,目前您的浏览器并未开启对cookie的支持，将无法使用，请先开启cookie支持！' });
    return;
  }
  //播放初始化设置公共方法
  mplayer.init({
    loadstart: function () { mbox.waiting('音频加载中……'); },
    play: function () { mbox.close(); mplayer.target.addClass('btn-pause'); },
    pause: function () { mplayer.target.removeClass('btn-pause'); },
    error: function () { mbox.close(); }
  });
  app.init();
  //地址带上渠道参数
  $('a').each(function () {
    var link = $(this).attr('href');
    if ((new RegExp(location.host + '/')).test(link) || !/^http:\/\/|javascript:/i.test(link)) {
      $(this).attr('href', app.link(link));
    }
  });
});
