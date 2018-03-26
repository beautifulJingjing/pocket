//JSON转换支持
if (typeof JSON !== "object") $.getScript("/javascripts/json2.min.js");
var flag_listen = 0;
//弹窗控件
var mbox = (function () {
    //用来记录要显示的DIV
    var _box;
    var flag;
    //弹出对话窗口(要显示的div对象)
    function alert(div) {
        //把要显示的div居中显示
        if (_box) {
            _box.style.display = 'none';
        }
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
    }
    //把要显示的div居中显示
    function alertbox() {
        _box.style.display = 'block';
        var _t = $(window).scrollTop() + Math.round(($(window).height() - _box.offsetHeight) / 2);
        var _l = $(window).scrollLeft() + Math.round(($(window).width() - _box.offsetWidth) / 2);
        with (_box) {
            style.top = (_t < 0 ? 0 : _t) + "px";
            style.left = (_l < 0 ? 0 : _l) + "px";
            style.position = "absolute";
            style.zIndex = "999";
        }
    }
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
            style.zIndex = "998";
            style.background = "#231815";
            style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=50,finishOpacity=50);";
            style.opacity = "0.5";
        }
    }
    function closemask() {
        var mask = document.getElementById("EV_AlertMask");
        if (mask)
            document.body.removeChild(mask);
    }

    function alertslid(div, callback) {
        //滑出
        $(window).on('touchmove', function (e) {
            if(e.preventDefault) {
                e.preventDefault();
            }else {
                window.event.returnValue = false;
            }
        });
        flag = true;
        if (!div) return;
        if (div instanceof Element) div = $(div);
        if (flag) {
            var _w = $(window);
            div.css({
                'left': _w.width(),
                'height': _w.height()
            });
            div.css('opacity',1);
            div.find('.controlbtn').css('opacity',1);
            setTimeout(function () {
                div.animate({'left': 0}, 300, function () {
                    if (callback) callback();
                    mplayer.doStop();
                });
            }, 10);
        }
        else if (callback) callback();
    }
    function closeslid(div) {
        $(window).off('touchmove');
        flag_listen = 0;
        if (!div || div instanceof Event) div = $$.setting;
        if (div instanceof Element) div = $(div);
        div.animate({'left': $(window).width()}, 300, function () {
            div.css('opacity',0);
            mplayer.doStop();
            if($('.box-verifi')){
                $('.box-verifi').remove();
            }
        });
        $('.musics').find('.controlbtn').prev().show();
    }

    function checking(option) {
        if (!option) option = {};
        var slid = $$.setting;
        slid.checking.show().siblings().hide();
        slid.title.html(option.title || '验证手机号');
        slid.member_tip.html(option.member_tip || '<em></em><div class="member-tip-inner"><span class="icon-font iconfont-queen"></span>加入VIP会员，畅享彩铃无限量更换<i>(0元/首)</i></div>');
        slid.member_tq.html(option.member_tq || ' ');
        if (option.music){
            flag_listen = 1;
            slid.musics.html(option.music).show();
            with (slid.musics) {
                find('.btn-play').removeClass('btn-pause').click(app.doPlay);
                find('.name').find('em,i').remove();
                find('.set').remove();
                find('.left-area').find('em').hide();
            }
        }
        else if (!slid.musics.html() || slid.css("opacity")==0) slid.musics.hide();
        with (slid.checking) {
            phone.val(option.phone || '');
            code.val('');
            phone.blur(function(){
                var _this = $(this);
                if(_this.val().length == 11){
                    if( phonecom.regexPhone.test(_this.val()) ){
                        $('#box-phone').remove();
                    }else{
                        mbox.verification($('#phone-verifi'),'亲，别闹了，搞个正确的手机号码再来！','box-phone');
                    }
                }
            }).focus(function(){
                $('#box-phone').remove();
            });

            code.focus(function(){
                $('#box-code').remove();
            });

            btn_code.off('click').click(function (e) {
                option.getcodeEvent(e, {
                    phone: phone.val().trim()
                });
                $('#box-click').remove();
                app.isclick = true;
            });
            btn_ok.html(option.check || '确定').off('click').click(function (e) {
                option.checkEvent(e, {
                    phone: phone.val().trim(),
                    checkcode: code
                });
                app.log({name:'dologin',params:{phone:phone.val().trim()}});
            });
            msg.html((option.explain || '').toHtml());

            slid.checking.on('click','input',function(){
                $(this).parent().addClass('p-cur').siblings().removeClass('p-cur');
            }).on('blur','input',function(){
                $(this).parent().removeClass('p-cur');
            })
        }
        alertslid(slid[0], function () {
            if (option.log) {
                option.log();
                delete option.log;
            }
            //if (telecom.regexPhone.test(option.phone)) {//自动下发验证码
            //    option.getcodeEvent(slid.checking.btn_code[0], {
            //        phone: option.phone,
            //        passive: 1
            //    });
            //}
        });
        return slid[0];

        //if (!option) option = {};
        //var box = checking.setting;
        //box.title.html(option.title || '验证手机号');
        //box.explain.html((option.explain || '').toHtml());
        //box.phone.val(option.phone || '');
        //box.checkcode.val('');
        //box.getcode.off('click').click(function (e) {
        //  option.getcodeEvent(e, { phone: box.phone.val() });
        //});
        //box.check.html(option.check || '确定').off('click').click(function (e) {
        //  option.checkEvent(e, { phone: box.phone.val(), checkcode: box.checkcode.val() });
        //});
        //alert(box[0]);
        //if (option.log) {
        //  option.log.call();
        //  delete option.log;
        //}
        //return box[0];
    }

    function service(option) {
        if (!option) option = {};
        var slid = $$.setting;
        slid.service.show().siblings().hide();
        slid.title.html(option.title || '开通服务');
        slid.member_tip.html(option.member_tip || '<em></em><div class="member-tip-inner"><span class="icon-font iconfont-queen"></span>加入VIP会员，畅享彩铃无限量更换<i>(0元/首)</i></div>');
        slid.member_tq.html(option.member_tq || ' ');
        if (option.music){
            flag_listen = 1;
            slid.musics.html(option.music).show();
            with (slid.musics) {
                find('.btn-play').removeClass('btn-pause').click(app.doPlay);
                find('.name').find('em,i').remove();
                find('.set').remove();
                find('.left-area').find('em').hide();
            }
        }
        else if (!slid.musics.html() || slid.css("opacity")==0) slid.musics.hide();
        with (slid.service) {
            var code_exp_025 = /^(\d){7}025(\d)+$/;  //口袋个推渠道
            var code_exp_03 = /^03(\d)+$/;
            if(app.spinfocode == '00000550471' && unicom.regexPhone.test(app.user.phone) && !app.user.isorder() ) {
                pay.show();
                btn_ok.hide();
                msg.hide();
                $.ajax({
                    url: "/proxy/v3/proxy.aspx",
                    data: {
                        cmd: "get-receivenum",
                        spinfocode: app.spinfocode,
                        modeltype: '1'
                    },
                    dataType: 'json',
                    cache: false,
                    type: 'get',
                    success: function (r) {
                        if (r.s == 1) pay.find('.pay-get-num').html('已有<em>' + r.data + '</em>位用户升级了VIP会员');
                    }
                });
                pay.find('.pay-tab-list').click( function () {
                    // $(this).addClass('pay-checked').siblings().removeClass('pay-checked');
                    // var _payPro = $('.pay-checked');
                    // var _payProName = _payPro.find('.pay-name').text();   //选中的要支付的产品名称
                    // var _payProPrice = _payPro.find('.pay-price').text(); //选中的要支付的产品价格
                    var _payProName = '28元/6个月';
                    var _payProPrice = '28元';
                    // var _proTag = _payPro.data('protag');          //产品代码
                    //var _proTag = "4"; //三个月
                    var _proTag = "5";  //半年
                    var _plat;  //支付方式
                    var _ringid = $('#slid-layer').find('.controlbtn').data('rid'),_returnUrl; //回调url
                    var rooturl = window.location.host;
                    if(_ringid) _returnUrl = app.spinfocode+'.html?ringid='+_ringid+'&pro='+_proTag+'&orderidD=true';
                    else _returnUrl = app.spinfocode+'.html?pro='+_proTag+'&orderidD=true';
                   // app.log({name: 'checkedProPrice',params: {checkedProPrice:_payProPrice.substring(0,3)}});
                    $('.pay-tab-list .radio-img').attr('src','/m/images/pay-radio-unchecked.png');
                    $(this).find('.radio-img').attr('src','/m/images/pay-radio-checked.png');

                    var index = $('.pay-tab-list').index(this);
                    switch (index){
                        case 0:
                            $('.pay-btn').off('click').on('click', function (e) {
                                e.stopPropagation();
                                //微信支付执行代码
                                _plat = 2;
                                returnUrl = 'https://'+rooturl+'/m/payback,'+ _returnUrl + '&plat='+ _plat + '&item=0';
                                // returnUrl = 'http://'+rooturl+'/m/payback,'+ _returnUrl + '&plat='+ _plat + '&item=0';
                                setTimeout(function(){
                                    mbox.alertState('请在微信内完成付款');
                                    var _footState = $('.foot-pop-state');
                                    _footState.find('.opt-cancel').click(function(){
                                        window.location.href = 'https://'+rooturl+'/m/tem,'+app.spinfocode+'.html';
                                        mbox.close();
                                        log({name: 'paymentCancel'});
                                    });
                                    _footState.find('.pay-state').click(function(){
                                        window.location.href = 'https://'+rooturl+'/m/tem,'+app.spinfocode+'.html';
                                        mbox.close();
                                    });
                                },3500);
                                app.log({name: 'checkedProPrice',params: {total_fee:_payProPrice.substring(0,3)}});
                                app.generateorder({goodsid:_proTag,paytype:7,objtype:3,objID:app.user.phone,returnUrl:returnUrl});
                            })

                            break;
                        case 1:
                            $('.pay-btn').off('click').on('click', function (e) {
                                e.stopPropagation();
                                //支付宝支付执行代码
                                _plat = 1;
                                returnUrl = 'https://'+rooturl+'/m/payback,'+_returnUrl + '&plat='+_plat + '&item=1';
                                // returnUrl = 'http://'+rooturl+'/m/payback,'+_returnUrl + '&plat='+_plat + '&item=1';
                                setTimeout(function(){
                                    mbox.alertState('请在支付宝内完成付款');
                                    var _footState = $('.foot-pop-state');
                                    _footState.find('.opt-cancel').click(function(){
                                        window.location.href = 'https://'+rooturl+'/m/tem,'+app.spinfocode+'.html';
                                        mbox.close();
                                        log({name: 'paymentCancel'});
                                    });
                                    _footState.find('.pay-state').click(function(){
                                        window.location.href = 'https://'+rooturl+'/m/tem,'+app.spinfocode+'.html';
                                        mbox.close();
                                    });
                                },3500);
                                app.log({name: 'checkedProPrice',params: {total_fee:_payProPrice.substring(0,3)}});
                                app.generateorder({goodsid:_proTag,paytype:6,objtype:3,objID:app.user.phone,returnUrl:returnUrl});
                            })
                            break;
                        case 2:
                            $('.pay-btn').off('click').on('click', function (e) {
                                e.stopPropagation();
                                //微信扫码执行代码
                                returnUrl = 'https://mt.ringbox.cn/m/paycode,'+_returnUrl + '&item=2';  //线上正式地址
                                // returnUrl = 'http://'+rooturl+'/m/paycode,'+_returnUrl + '&item=2';   //本地测试地址
                                app.log({name: 'checkedProPrice',params: {total_fee:_payProPrice.substring(0,3)}});
                                app.generateorder({goodsid:_proTag,paytype:8,objtype:3,objID:app.user.phone,returnUrl:returnUrl});
                            });
                            break;
                    }

                });
                pay.find('.pay-tab-list').eq(0).click();
            }
            else{
                pay.hide();
                btn_ok.html(option.confirm || '确认').off('click').click(option.confirmEvent);
                msg.html((option.explain || '').toHtml());
            }

            if (option.phone) phone.text(option.phone).show();
            else phone.hide();
            if(option.changeEvent) btn_change.off('click').show().click(option.changeEvent);
            else btn_change.hide();
            if (option.confirmmsg) confirm.html(option.confirmmsg.toHtml()).show();
            else confirm.hide();

            if(option.mobile_crbt) mobile_crbt.html(option.mobile_crbt.toHtml()).show();
            else mobile_crbt.hide();

            if(option.mobile_order) mobile_order.html(option.mobile_order.toHtml()).show();
            else mobile_order.hide();

            if(option.mobile_crbt || option.mobile_order) mobile_feeText.show();
            else mobile_feeText.hide();

            //btn_ok.html(option.confirm || '确认').off('click').click(option.confirmEvent);
            //msg.html((option.explain || '').toHtml());
        }
        alertslid(slid[0], function () {
            if (option.log) {
                option.log();
                delete  option.log;
            }
        });
        return slid[0];
    }

    function explain(option) {
        if (!option) option = {};
        var slid = $$.setting;
        slid.explain.show().siblings().hide();
        slid.title.html(option.title || '提示');
        slid.member_tip.html(option.member_tip || '<em></em><div class="member-tip-inner"><span class="icon-font iconfont-queen"></span>加入VIP会员，畅享彩铃无限量更换<i>(0元/首)</i></div>');
        slid.member_tq.html(option.member_tq || ' ');
        if (option.music){
            flag_listen = 1;
            slid.musics.html(option.music).show();
            with (slid.musics) {
                find('.btn-play').removeClass('btn-pause').click(app.doPlay);
                find('.name').find('em,i').remove();
                find('.set').remove();
                find('.left-area').find('em').hide();
            }
        }
        else if (!slid.musics.html() || slid.css("opacity")==0) slid.musics.hide();
        with (slid.explain) {
            if (option.icon) icon.removeClass().addClass('icon').addClass(option.icon);
            else icon.hide();
            msg.html(option.explain.toHtml());
            btn_ok.html(option.btn_ok || '朕知道了~').off('click').click(option.confirmEvent || closeslid);
        }
        alertslid(slid, function () {
            if (option.log) {
                option.log();
                delete  option.log;
            }
        });
        return slid[0];

    }

    function del(option){
        if (!option) option = {};
        var box = del.setting;
        box.title.html(option.title || '温馨提示');
        box.explain.html(option.explain.toHtml());
        box.left.show().html(option.cancel_btn || '取消').off('click').click(option.cancelEvent ||close);
        box.right.show().html(option.ok_btn ||'确认').off('click').click(option.confirmEvent || close);
        box.center.hide();
        alert(box[0]);
        if (option.log) {
            option.log.call();
            delete option.log;
        }
        return box[0];
    }
    function alertMsg(option){
        if (!option) option = {};
        var box = explain.setting;
        box.title.html(option.title || '温馨提示');
        box.closeBtn.off('click').click(option.closeEvent || close);
        box.explain.html(option.explain);
        box.left.hide();
        box.right.hide();
        box.center.show().html('我知道啦~').off('click').click(option.confirmEvent || close);
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

        alertslid: alertslid,
        closeslid: closeslid,

        //各种校验
        verification: function(obj,msg,idnum) {
            $('.box-verifi').remove();
            var _html = '<div class="box-verifi" id="'+ idnum +'"> <i class="icon-sj"></i> <div class="msg-sm"><i class="icon-font iconfont-warning"></i>' + msg + '</div> </div>';
            obj.after(_html);
        },

        //特定弹窗
        waiting: function (msg) {
            var dv = $('#pop-waiting-layer');
            dv.find('span').text(msg);
            alert(dv[0]);
            return dv[0];
        },
        alertState: function(msg){  //支付状态
            var dv = $('#pop-state');
            dv.find('.pay-tit').text(msg);
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
        setting: function () {
            setting = $('#pop-msg-layer');
            $.extend(setting, {
              title: setting.find('#title'),
              closeBtn: setting.find('#closeBtn'),
              explain: setting.find('#explain'),
              left: setting.find('#btn-left'),
              right: setting.find('#btn-right'),
              center: setting.find('#btn-enter')
            });
            explain.setting = setting;

            var setting = $('#pop-del-layer');
            $.extend(setting, {
                title: setting.find('#title'),
                explain: setting.find('#explain'),
                left: setting.find('#btn-left'),
                right: setting.find('#btn-right'),
                center: setting.find('#btn-enter')
            });
            del.setting = setting;

            var setting = $('#slid-layer');
            $.extend(setting, {
                title: setting.find('.t').find('span'),
                btn_back: setting.find('.btn-back'),
                musics: setting.find('.musics'),
                member_tip: setting.find('.member-tip'),
                member_tq: setting.find('.member-privilege'),
                checking: setting.find('.checking'),
                service: setting.find('.service'),
                explain: setting.find('.explain')
            });
            with (setting) {
                btn_back.click(closeslid);
                $.extend(checking, {
                    phone: checking.find('.phone'),
                    code: checking.find('.code'),
                    btn_code: checking.find('.btn-code'),
                    btn_ok: checking.find('.btn-ok'),
                    tip: explain.find('.down-tip'),
                    msg: checking.find('.msg')
                });
                $.extend(service, {
                    phone: service.find('b'),
                    btn_change: service.find('.btn-change'),
                    confirm: service.find('.confirm'),
                    pay: service.find('.pay-box'),
                    mobile_feeText: service.find('.mobile-fee-text'),
                    mobile_crbt: service.find('.mobile-crbt'),
                    mobile_order: service.find('.mobile-order'),
                    btn_ok: service.find('.btn-ok'),
                    msg: service.find('.msg')
                });
                $.extend(explain, {
                    icon: explain.find('.icon'),
                    msg: explain.find('.msg'),
                    btn_ok: explain.find('.btn-ok')
                });
            }
            this.setting = setting;
            delete setting;
        },
        //手机号校验弹窗
        checking: checking,
        //提示确定取消弹窗
        service: service,
        //说明弹窗
        explain: explain,
        //删除弹窗
        del: del,
        //信息弹窗
        alertMsg: alertMsg
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
                addEventListener('loadstart', function () {
                    if ($$.loadstart) $$.loadstart();
                });
                addEventListener('error', function () {
                    setTimeout(function () { //UC浏览器下，有error的情况下仍可播放
                        if (paused || ended) {
                            pause();
                            if ($$.error) $$.error();
                            if(currentSrc.indexOf('12530') > 0){
                                mbox.alertMsg({explain: '系统赠送铃声，不支持试听哦'})
                            }
                            else alert(error.code + '\r\n' + networkState + '\r\n' + readyState + '\r\n' + currentSrc);
                        }
                    }, 3000);
                });
                addEventListener('loadedmetadata', function () {
                    play();
                });
                addEventListener('play', function () {
                    if ($$.play) $$.play();
                });
                addEventListener('pause', function () {
                    if ($$.pause) $$.pause();
                });
                addEventListener('ended', function () {
                    if ($$.pause) $$.pause();
                });
            }
        },
        setCurrentTime: function (second) {
            this.audio.currentTime = second;
        },
        doPlay: function (_src, _target) {
            with (this.audio) {
                if (src.indexOf(_src) > -1) {
                    if (!$$.target) $$.target = _target;
                    if (paused || ended) {
                        currentTime = 0;
                        play();
                    }
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
        }
    };
    return $$;
})();
//app交互
var app_js = (function(){
    var $$ = {//登录
        login:function(phone){
            //alert(phone);
        },//退订
        logout: function(phone){
            //alert(phone);
        }
    };
    return $$;
})();
//联通号码校验正则
var unicom = {regexPhone: new RegExp(/^((13[0-2])|145|(15[5|6])|176|(18[5|6]))\d{8}$/)};
//电信号码校验正则
var telecom = {regexPhone: new RegExp(/^(133|153|173|177|(18[0|1|9]))\d{8}$/)};
//移动号码前三位校验正则
var _mobilecom = {regexPhone: new RegExp(/^((13[4-9])|147|(15[0|1|2|7|8|9])|178|(18[2|3|4|7|8]))/)};
//移动号码正则
var mobilecom = {regexPhone: new RegExp(/^((13[4-9])|147|(15[0|1|2|7|8|9])|178|(18[2|3|4|7|8]))\d{8}$/)};
//三网号码校验正则
var phonecom = {regexPhone: new RegExp(/^[1][34578][0-9]{9}$/)};

//铃声DIY
var app = (function () {
    var $$ = {
        spinfocode: '0',//渠道
        connection: navigator.connection || {type: ''},//获取当前网络连接方式，部分浏览器支持
        unikey: 0,//透传状态，1=已透传，0=未透传
        isclick:false
    };
    var pushinfo = {};
    var user = {
        token:'',
        orderidD: false,
        //用户会员判断
        isorder: function () {
            if (typeof this.orderstate == 'number') return this.orderstate != 4;
            else return false;
        },
        logined: function () {
            if (typeof this.phone != 'string' || this.phone == '' || typeof this.id != 'string' || this.id == '')
                return false;
            else if (!phonecom.regexPhone.test(this.phone))
                return this.isorder();
            else return true;
        },
        get orderstatestr(){
            switch (this.orderstate) {
                case 0://免费期
                case 1://预订购
                case 2://订购中，自动续费
                    return "会员";
                case 3://订购中，有截止日期
                    //return "月底到期";
                    return "会员";
            }
            return "非会员";
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
    };

    var doPlay = function (e) {
        if (e.type !== undefined) {
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        var sender = $(e);
        var taht = sender.parents('.musics');
        taht.addClass('musicsCurBg').siblings().removeClass('musicsCurBg');
        if (sender.data('rid') === undefined || sender.data('address') === undefined) {
            sender = sender.parents('.musics').find('.btn-play');
        }
        if(_mobilecom.regexPhone.test(user.phone) && sender.data('address')) mplayer.doPlay('{0}'.format(sender.data('address')), sender);
        else mplayer.doPlay('/proxy/v3/audition.aspx?rid={0}'.format(sender.data('rid')), sender);

        log({name:'doPlay'});
    };
    var doDownload = function (e) {
        if (e.type !== undefined) {
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        var sender = $(e).off('click');
        var taht = sender.parents('.musics');
        taht.addClass('musicsCurBg').siblings().removeClass('musicsCurBg');
        taht.find('.controlbtn').removeClass('btn-pause').prev().show();
        var data = {
            spinfocode: $$.spinfocode,
            rid: sender.data('rid'),
            rname:sender.data('rname'),
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
                    mbox.close();
                    if (r.order) {
                        if (r.order.s == 1) {
                            $.extend(user, r.data);
                            user.change.forEach(function (func) {
                                func.call();
                            });
                        }
                    }
                    if (r.s == 1) {
                        sender.attr({'href': r.data});
                        location.href = r.data;
                    }
                    else {
                        var option = {
                            music: sender.parents('.musics').html(),
                            callback: function () {
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
                            else if (telecom.regexPhone.test(user.phone)) {
                                if(pushinfo.order.mode == 903 && pushinfo.login.mode == 3)
                                    option.dir = 3;
                                else
                                    option.dir = 2;
                                if(pushinfo.order.mode == 903 && pushinfo.login.mode == 2)
                                    alertOpenOrder(option);
                                else
                                    alertLoginOpen(option);
                            }
                            else {
                                option.confirmmsg = '是否确认下载该首铃音？';
                                alertOpenOrder(option);
                            }
                        }
                        else if (r.s == -30) {
                            if (pushinfo.crbt.pop.type == 2)
                                mbox.explain({
                                    title: pushinfo.crbt.pop.title,
                                    explain: user.phone + pushinfo.crbt.pop.content
                                });
                            else if (telecom.regexPhone.test(user.phone)) {
                                if(pushinfo.order.mode == 903 && pushinfo.login.mode == 3)
                                    option.dir = 3;
                                else
                                    option.dir = 2;
                                if(pushinfo.order.mode == 903 && pushinfo.login.mode == 2)
                                    alertOpenOrder(option);
                                else
                                    alertLoginOpen(option);
                            }
                            else {
                                option.confirmmsg = '是否确认下载该首铃音？';
                                alertOpenCrbt(option);
                            }
                        }
                        else if (r.s == 14) {//下发短信，等待回复开通
                            mbox.explain({
                                title: pushinfo.crbt.succ.title,
                                icon: 'succ',
                                explain: user.phone + pushinfo.crbt.succ.content
                            });
                        }
                        else if (r.s == 15) {//下发短信，等待回复开通
                            mbox.explain({
                                title: pushinfo.order.succ.title,
                                icon: 'succ',
                                explain: user.phone + pushinfo.order.succ.content
                            });
                        }
                        else if (r.s == 31) {
                            if (pushinfo.crbt.asyncsucc.content)
                                mbox.explain({
                                    title: pushinfo.crbt.asyncsucc.title,
                                    icon: 'fail',
                                    explain: pushinfo.crbt.asyncsucc.content
                                });
                            else
                                mbox.explain({
                                    icon: 'fail',
                                    explain: r.msg
                                });
                        }
                        else {
                            mbox.explain({
                                icon: 'fail',
                                explain: r.msg
                            });
                        }
                    }
                }
            };
            var waittime = 8000;
            var wait = setInterval(function () {
                if ($$.unikey || waittime <= 0) {
                    clearInterval(wait);
                    $.ajax(ajaxSettings);
                    log({name: sender.data('trace') || 'doDown', params: data});
                }
                waittime -= 500;
            }, 500);
            return false;
        }
        log({name: sender.data('trace') || 'doDown', params: data});
        return true;
    };
    var doSetRing = function (e) {
        if (e.type !== undefined) {
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        var sender = $(e).off('click');
        var taht = sender.parents('.musics');
        taht.addClass('musicsCurBg').siblings().removeClass('musicsCurBg');
        taht.find('.controlbtn').removeClass('btn-pause').prev().show();
        var data = {
            cmd: 'set-ring',
            spinfocode: $$.spinfocode,
            rid: sender.data('rid'),
            type: sender.data('type') || 1,
            flag: sender.data('flag')
        };
        is_setring = sender.data('sprid');
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
                mbox.close();
                if (r.order) {
                    if (r.order.s == 1) {
                        app.user.orderidD = false;
                        $.extend(user, r.data);
                        user.change.forEach(function (func) {
                            func.call();
                        });
                        update_session({orderidD: false});
                    }
                }
                if (r.s == 1) {
                    var opt = {
                        //title: pushinfo.ringset.singleset.succ.title,
                        music: sender.parents('.musics').html(),
                        icon: 'succ',
                        explain: pushinfo.ringset.singleset.succ.content
                    };
                    if (data.rid.toString().indexOf(',') > -1) {
                        //opt.title = pushinfo.ringset.muchset.succ.title;
                        opt.explain = pushinfo.ringset.muchset.succ.content;
                    }
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
                        music: sender.parents('.musics').html(),
                        callback: function (plus) {
                            if (ajaxSettings.plus) $.extend(ajaxSettings.plus, plus);
                            else ajaxSettings.plus = plus;
                            $.ajax(ajaxSettings);
                        }
                    };
                   if (r.s == -10) {  //尚未登录
                       if (app.user.token) {//移动已登录未订购用户
                           option.confirmmsg = '设置该首彩铃需升级为VIP会员，是否确认升级并设置该首彩铃？';
                           alertOpenOrder(option);
                       }
                       else{
                           option.confirmmsg = '设置该首彩铃需升级为VIP会员，是否确认升级并设置该首彩铃？';
                           alertLoginOnly(option);
                       }
                   }else if(r.s == -11){//移动已登录未订购用户
                       $.extend(user, r.data);
                       option.confirmmsg = '设置该首彩铃需升级为VIP会员，是否确认升级并设置该首彩铃？';
                       alertOpenOrder(option);
                   }else if (r.s == -20) {  //尚未开通会员
                       $.extend(user, r.data);
                       user.change.forEach(function (func) {
                           func.call();
                       });
                        if (pushinfo.order.pop.type == 2)
                            mbox.explain({
                                title: pushinfo.order.pop.title,
                                music: sender.parents('.musics').html(),
                                explain: user.phone + pushinfo.order.pop.content
                            });
                        else if (telecom.regexPhone.test(user.phone)) {
                            if (pushinfo.order.mode == 903 && pushinfo.login.mode == 3)
                                option.dir = 3;
                            else
                                option.dir = 2;
                            if (pushinfo.order.mode == 903 && pushinfo.login.mode == 2)
                                alertOpenOrder(option);
                            else
                                alertLoginOpen(option);
                        }
                        else if(app.user.orderidD){
                            mbox.del({
                                cancel_btn: '继续等待',
                                cancelEvent: function(){
                                    $.ajax({
                                        url: "/proxy/v3/proxy.aspx",
                                        data: {
                                            cmd: 'login-get-userinfo',
                                            phone: app.user.phone,
                                            spinfocode: app.spinfocode
                                        },
                                        dataType: 'json',
                                        cache: false,
                                        type: 'get',
                                        success: function(r){
                                            mbox.close();
                                            if(r.s == 1){
                                                app.user.orderidD = false;
                                                $.extend(app.user, r.data);
                                                app.user.change.forEach(function (func) {
                                                    func.call();
                                                });
                                                update_session({orderidD: false});
                                                alertMsg({
                                                    explain: '您已经是会员啦，快去主站设铃吧！',
                                                    confirmEvent: function(){
                                                        window.location.href = 'http://'+_root+'/m/tem,'+app.spinfocode+'.html';
                                                    }
                                                })
                                            }
                                        }
                                    });
                                },
                                explain: '①如您已完成支付，请等待服务开通，预计24小时内生效，生效后即可畅享VIP特权。如未按时生效，我们将在2个工作日内返还费用。<br>②如您未完成支付，请点击继续支付',
                                ok_btn: '继续支付',
                                confirmEvent: function(){
                                    //dosetRing(e);
                                    mbox.close();
                                    app.user.orderidD = false;
                                    app.user.change.forEach(function (func) {
                                        func.call();
                                    });
                                    $.ajax(ajaxSettings);
                                }
                            })
                        }
                        else {
                            //option.confirmmsg = '是否确认设置该首彩铃?';
                            option.confirmmsg = '是否确认设置该首彩铃？<br>资费是：<span class="bz-span">2.0元<em></em></span>（<i>VIP专享0元/首</i>）';
                            //alertOpenOrder(option);
                            mbox.service({
                                title: option.title || pushinfo.crbt.pop.title,
                                music: option.music,
                                phone: r.phone || user.phone,
                                changeEvent: function (e) {
                                    alertLoginOpen(r);
                                    //doLoginOnly(r);
                                },
                                confirmmsg: option.confirmmsg,
                                explain: r.explain || pushinfo.crbt.pop.content
                            });
                        }
                    }
                    else if (r.s == -30) {  //尚未开通彩铃
                        if (pushinfo.crbt.pop.type == 2)
                            mbox.explain({
                                title: pushinfo.crbt.pop.title,
                                music: sender.parents('.musics').html(),
                                explain: user.phone + pushinfo.crbt.pop.content
                            });
                        else if (telecom.regexPhone.test(user.phone)) {
                            option.dir = 3;
                            alertLoginOpen(option);
                        }
                        else {
                            option.confirmmsg = '是否确认设置该首彩铃？<br>资费是：<span class="bz-span">2.0元<em></em></span>（<i>VIP专享0元/首</i>）';
                            alertOpenCrbt(option);
                        }
                    }
                    else if (r.s == -32) {
                       mbox.service({
                           title: pushinfo.crbt.pop.title,
                           music: sender.parents('.musics').html(),
                           phone: r.phone || user.phone,
                           confirmmsg: r.msg,
                           explain: r.explain,
                           confirmEvent: function (e) {
                               ajaxSettings.data.confirm = 1;
                               if(_mobilecom.regexPhone.test(user.phone)){
                                   ringhtml = sender.parents('.musics').html();
                                   mbox.waiting('设置中,请稍候……');
                                   order_ring();
                               }else{
                                   $.ajax(ajaxSettings);
                               }
                           }
                       });
                    }
                    /*else if(r.s == -101){
                     mbox.explain({icon: 'fail', explain: r.msg});
                     }*/
                    else if (r.s == -99) {
                        mbox.checking({
                            title: r.title,
                            music: sender.parents('.musics').html(),
                            explain: r.explain || pushinfo.login.pop.content,
                            phone: user.phone,
                            getcodeEvent: function (e, opt) {
                                opt.loged = true;
                                opt.type = 1;//验证码用途
                                opt.dir = r.dir || pushinfo.login.mode;//使用方向
                                //doSendCheckcode(e, $.extend({ callback: function () { alertLoginOpen($.extend(opt, r)); } }, opt));
                                doSendCheckcode(e, opt);
                            },
                            checkEvent: function (e, opt) {
                                ajaxSettings.data.confirm = 1;
                                ajaxSettings.data.vcode = opt.checkcode;
                                $.ajax(ajaxSettings);
                            }
                        });
                    }
                    else if (r.s == -33) {
                        mbox.explain({
                            icon: 'fail',
                            explain: r.msg
                        });
                    }
                    else if (r.s == 14) {//下发短信，等待回复开通
                        mbox.explain({
                            title: pushinfo.crbt.succ.title,
                            icon: 'succ',
                            explain: user.phone + pushinfo.crbt.succ.content
                        });
                    }
                    else if (r.s == 15) {//下发短信，等待回复开通
                        mbox.explain({
                            title: pushinfo.order.succ.title,
                            icon: 'succ',
                            explain: user.phone + pushinfo.order.succ.content
                        });
                    }
                    else if (r.s == 31) {
                        if (pushinfo.crbt.asyncsucc.content)
                            mbox.explain({
                                title: pushinfo.crbt.asyncsucc.title,
                                icon: 'fail',
                                explain: pushinfo.crbt.asyncsucc.content
                            });
                        else
                            mbox.explain({icon: 'fail', explain: r.msg});
                    }
                    else { //设置失败
                        var opt = {
                            title: pushinfo.ringset.singleset.fail.title,
                            icon: 'fail',
                            explain: pushinfo.ringset.singleset.fail.content
                        };
                        if (data.rid.toString().indexOf(',') > -1)
                            opt = {
                                title: pushinfo.ringset.muchset.fail.title,
                                icon: 'fail',
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
                log({name: sender.data('trace') || 'doSetRing', params: data});
            }
            waittime -= 500;
        }, 500);
    };
    var doDelRing = function(e){
        if (e.type !== undefined) {
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        var sender = $(e);
        var data = {
            cmd: 'delete-user-ring',
            spinfocode: $$.spinfocode,
            ringid: sender.data('rid')
        };

        mbox.del({
            title: '温馨提示',
            explain: '是否确认删除',
            confirmEvent: function(){
                $.ajax({
                    sender: sender,
                    url: "/proxy/v3/proxy.aspx",
                    data: data,
                    dataType: 'json',
                    cache: false,
                    type: 'post',
                    beforeSend: function () {
                        mbox.waiting('删除中,请稍候……');
                        sender.click(doDelRing);
                    },
                    success: function (r) {
                        mbox.close();
                        if(r.s == 1){
                            sender.parent().parent().parent().remove();
                            $(".library-list").find("em").each(function(i){
                                $(this).text(i+1+'.');
                            });
                        }
                        if(r.s==0){
                          alert(r.msg)
                        }
                        if(r.s==-98){
                            mbox.checking({
                                title: r.title,
                                //music: sender.parents('.musics').html(),
                                explain: r.explain || pushinfo.login.pop.content,
                                phone: user.phone,
                                getcodeEvent: function (e, opt) {
                                    opt.loged = true;
                                    opt.type = 1;//验证码用途
                                    //doSendCheckcode(e, $.extend({ callback: function () { alertLoginOpen($.extend(opt, r)); } }, opt));
                                    doSendCheckcode(e, opt);
                                },
                                checkEvent: function (e, opt) {
                                    ajaxSettings.data.sms = opt.checkcode;
                                    $.ajax(ajaxSettings);
                                }
                            });
                        }
                    }
                });
                log({name: 'doDelRing',params: data});
            }
        })
    };
    var doOnServe = function (e, option) {
        if (e.type === undefined) {
            //option = e;
            e = this;
        }
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
                mbox.waiting('升级中,请稍候……');
                sender.click(doOnServe);
            },
            success: function (r) {
                mbox.close();
                if (r.s == 1) {
                    if (r.data) {
                        $.extend(user, r.data);
                        app.user.orderidD = false;
                        user.change.forEach(function (func) {
                            func.call();
                        });
                        //update_session({orderidD: false});
                    }
                    var opt = {
                        title: pushinfo.order.succ.title,
                        icon: 'succ',
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

                    if (pushinfo.declare.message.content){
                        if(option !== undefined){  //联通号码会员中心升级会员标识
                            opt.explain = user.phone + '，您好！<br/>恭喜您升级为VIP会员啦，现在即可享受海量铃声免费不限次下载设置喽。';
                        }
                        else{
                            opt.explain += '<br/><a href="{1}" class="uline">{0}</a>'.format(pushinfo.declare.message.content, pushinfo.declare.message.link);
                        }
                    }
                    if(opt.explain) {
                        if (option && option.callback)
                            opt.confirmEvent = option.callback;
                        mbox.explain(opt);
                    }
                    else {
                        if (option && option.callback)
                            option.callback();
                        mbox.closeslid();
                    }
                }
                else {
                    var opt = {
                        callback: function (plus) {
                            if (ajaxSettings.plus) $.extend(ajaxSettings.plus, plus);
                            else ajaxSettings.plus = plus;
                            $.ajax(ajaxSettings);
                        }
                    };

                    if (r.s == -10) {  //尚未登录
                        if (app.user.token) {//移动已登录未订购用户
                            opt.confirmmsg='是否确认领取VIP专属特权？';
                            alertOpenOrder(opt);
                        } else {
                            opt.confirmmsg='是否确认领取VIP专属特权？';
                            alertLoginOnly(opt);
                        }
                    }else if(r.s == -11){//移动已登录未订购用户
                        $.extend(user, r.data);
                        opt.confirmmsg='是否确认领取VIP专属特权？';
                        alertOpenOrder(opt);
                    }else if (r.s == -20) {  //尚未开通会员服务
                        $.extend(user, r.data);
                        user.change.forEach(function (func) {
                            func.call();
                        });
                        if (pushinfo.order.pop.type == 2)
                            mbox.explain({
                                title: pushinfo.order.pop.title,
                                explain: user.phone + pushinfo.order.pop.content
                            });
                        else if (telecom.regexPhone.test(user.phone)) {
                            if(pushinfo.order.mode == 903 && pushinfo.login.mode == 3)
                                opt.dir = 3;
                            else
                                opt.dir = 2;
                            if(pushinfo.order.mode == 903 && pushinfo.login.mode == 2)
                                alertOpenOrder(opt);
                            else
                                alertLoginOpen(opt);
                        }else if( option !== undefined){   //联通号码会员中心升级会员标识
                            opt.phone = r.phone;
                            opt.confirmmsg = '是否确认升级VIP会员？';
                            alertOpenOrder(opt);
                        }
                        else if(app.user.orderidD){
                            mbox.del({
                                cancel_btn: '继续等待',
                                cancelEvent: function(){
                                    $.ajax({
                                        url: "/proxy/v3/proxy.aspx",
                                        data: {
                                            cmd: 'login-get-userinfo',
                                            phone: app.user.phone,
                                            spinfocode: app.spinfocode
                                        },
                                        dataType: 'json',
                                        cache: false,
                                        type: 'get',
                                        success: function(r){
                                            mbox.close();
                                            if(r.s == 1){
                                                app.user.orderidD = false;
                                                $.extend(app.user, r.data);
                                                app.user.change.forEach(function (func) {
                                                    func.call();
                                                });
                                                update_session({orderidD: false});
                                                alertMsg({
                                                    explain: '您已经是会员啦，快去主站设铃吧！',
                                                    confirmEvent: function(){
                                                        window.location.href = 'http://'+_root+'/m/tem,'+app.spinfocode+'.html';
                                                    }
                                                })
                                            }
                                        }
                                    });
                                },
                                explain: '①如您已完成支付，请等待服务开通，预计24小时内生效，生效后即可畅享VIP特权。如未按时生效，我们将在2个工作日内返还费用。<br>②如您未完成支付，请点击继续支付',
                                ok_btn: '继续支付',
                                confirmEvent: function(){
                                    //dosetRing(e);
                                    mbox.close();
                                    app.user.orderidD = false;
                                    app.user.change.forEach(function (func) {
                                        func.call();
                                    });
                                    $.ajax(ajaxSettings);
                                }
                            })
                        }
                        else {
                            opt.phone = r.phone;
                            opt.confirmmsg = '是否确认领取服务？';
                            //alertOpenOrder(opt);
                            mbox.service({
                                title: opt.title || pushinfo.order.pop.title,
                                music: opt.music,
                                phone: r.phone || user.phone,
                                changeEvent: function (e) {
                                    alertLoginOpen(r);
                                    //doLoginOnly(r);
                                },
                                confirmmsg: opt.confirmmsg,
                                explain: opt.explain || pushinfo.order.pop.content
                            });
                        }
                    }
                    else if (r.s == -30) {  //尚未开通彩铃
                        if (pushinfo.crbt.pop.type == 2)
                            mbox.explain({
                                title: pushinfo.crbt.pop.title,
                                explain: user.phone + pushinfo.crbt.pop.content
                            });
                        else if (telecom.regexPhone.test(user.phone)) {
                            opt.dir = 3;
                            alertLoginOpen(opt);
                        }
                        else {
                            opt.confirmmsg = '　　是否确认领取服务？';
                            alertOpenCrbt(opt);
                        }
                    }
                    else if (r.s == -33) {  //
                        mbox.explain({icon: 'fail', explain: r.msg});
                    }
                    else if (r.s == 14) {//下发短信，等待回复开通
                        mbox.explain({
                            title: pushinfo.crbt.succ.title,
                            icon: 'succ',
                            explain: user.phone + pushinfo.crbt.succ.content
                        });
                    }
                    else if (r.s == 15) {//下发短信，等待回复开通
                        mbox.explain({
                            title: pushinfo.order.succ.title,
                            icon: 'succ',
                            explain: user.phone + pushinfo.order.succ.content
                        });
                    }
                    else if (r.s == 31) {  //彩铃功能开通中，24小时内完成！|| 彩铃开通失败，请重新点击设铃开通
                        if (pushinfo.crbt.asyncsucc.content)
                            mbox.explain({
                                title: pushinfo.crbt.asyncsucc.title,
                                icon: 'fail',
                                explain: pushinfo.crbt.asyncsucc.content
                            });
                        else
                            mbox.explain({icon: 'fail', explain: r.msg});
                    }
                    else { //设置失败
                        mbox.explain({icon: 'fail', explain: r.msg});
                    }
                }
            }
        };
        var ajaxcall = function (plus) {
            if (ajaxSettings.plus) $.extend(ajaxSettings.plus, plus);
            else ajaxSettings.plus = plus;
            $.ajax(ajaxSettings);
        };
        var waittime = 8000;
        var wait = setInterval(function () {
            if (app.unikey || waittime <= 0) {
                clearInterval(wait);
                if(app.user.phone&&(_mobilecom.regexPhone.test(app.user.phone)||app.user.phone.indexOf('@')!=-1)){
                    if(app.user.orderstate==2){
                        mbox.explain({
                            icon: 'succ',
                            explain: '你已经是会员了，不能重复参加活动！',
                            tip:''
                        });
                    }else{
                        $.ajax(ajaxSettings);
                    }
                }else{
                    if (app.user.logined()) {
                        if (user.isorder()){
                            mbox.explain({
                                icon: 'succ',
                                explain: '你已经是会员了，不能重复参加活动！',
                                tip:''
                            });
                        }
                        else{
                            if(pushinfo.ringset.serve == 2 && pushinfo.order.pop.pop == 2)
                                alertOpenCrbt({ confirmEvent: ajaxcall });
                            else $.ajax(ajaxSettings);
                        }
                    }
                    else {
                        $.ajax(ajaxSettings);
                    }
                }

                app.log({name: sender.data('trace') || 'doOpenServe', params: ajaxSettings.data});
                sender.off('click').click(doOnServe);
            }
            waittime -= 500;
        }, 500);
    };
    var timeSendCodeTimeout, lastSendCodeOption;

    var timeSendCode = function (t, opt) {
        if(!opt) opt = {};
        var checking = opt.checking|| mbox.setting.checking;
        if (t < 1) {
            clearTimeout(timeSendCodeTimeout);
            checking.btn_code.text('获取短信验证码').click(function (e) {
                opt.phone = checking.phone.val().trim();
                doSendCheckcode(e, opt);
            });
        }
        else {
            checking.btn_code.text('验证码已下发 (' + t +'s)');
            timeSendCodeTimeout = setTimeout(timeSendCode, 1000, --t, opt);
        }
    };
    var doSendoutordercode = function (e, option) {
        if (e.type === undefined) {
            option = e;
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        if (!option.phone) {
            //alert('请输入您的手机号码。');
            mbox.verification($('#phone-verifi'),'请输入您的手机号码','box-phone');
            return;
        }
        //if (timeSendCodeTimeout) {
        //    if (lastSendCodeOption.phone != option.phone || lastSendCodeOption.type != option.type || lastSendCodeOption.dir != option.dir)
        //        timeSendCode(0);
        //    else
        //        return;
        //}
        var data = {
            cmd: 'get-outordercode',
            spinfocode: $$.spinfocode,
            phone: option.phone,
            dir: option.dir //使用方向
        };
        if (option.type) data.type = option.type;
        if (option.passive) log({name: 'toSendCheckcode.Before', params: data});
        else log({name: 'doSendCheckcode.Before', params: data});
        if (!phonecom.regexPhone.test(option.phone.trim())) {
            //alert("亲，别闹了，搞个正确的手机号码再来！");
            mbox.verification($('#phone-verifi'),'亲，别闹了，搞个正确的手机号码再来！','box-phone');
            return;
        }
        var sender = $(e).off('click');
        $.ajax({
            sender: sender,
            url: "/proxy/v3/proxy.aspx",
            data: data,
            dataType: 'json',
            cache: false,
            type: 'post',
            beforeSend: function () {
                timeSendCode(60, option);
            },
            success: function (r) {
                if (r.s == 1) {
                    //lastSendCodeOption = {phone: option.phone, type: option.type, dir: option.dir};
                    if (option.callback) option.callback();
                }
                else {
                    timeSendCode(0, option);
                    alert(r.msg);
                }
            },
            error: function () {
                timeSendCode(0, option);
            }
        });
        if (option.passive) {
            delete option.passive;
            log({name: 'toSendCheckcode', params: data});
        }
        else
            log({name: 'doSendCheckcode', params: data});
    };
    var doSendCheckcode = function (e, option) {
        if (e.type === undefined) {
            option = e;
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        if (!option.phone) {
            //alert('请输入您的手机号码。');
            if(!$('#box-phone').html()){
                mbox.verification($('#phone-verifi'),'请输入您的手机号码','box-phone');
            }
            return;
        }
        //if (timeSendCodeTimeout) {
        //    if (lastSendCodeOption.phone != option.phone || lastSendCodeOption.type != option.type || lastSendCodeOption.dir != option.dir)
        //        timeSendCode(0);
        //    else
        //        return;
        //}
        var data = {
            cmd: 'get-checkcode',
            spinfocode: $$.spinfocode,
            phone: option.phone,
            imgcode:option.imgcode,
            dir: option.dir //使用方向
        };
        if (option.type) data.type = option.type;
        if (option.passive) log({name: 'toSendCheckcode.Before', params: data});
        else log({name: 'doSendCheckcode.Before', params: data});
        if (!unicom.regexPhone.test(option.phone.trim())) {
            //alert("亲，别闹了，搞个正确的手机号码再来！");
            mbox.verification($('#phone-verifi'),'亲，别闹了，请搞个联通的手机号码再来！','box-phone');
            return;
        }
        var sender = $(e).off('click');
        $.ajax({
            sender: sender,
            url: "/proxy/v3/proxy.aspx",
            data: data,
            dataType: 'json',

            cache: false,
            type: 'post',
            beforeSend: function () {
                timeSendCode(60, option);
            },
            success: function (r) {
                if (r.s == 1) {
                    //lastSendCodeOption = {phone: option.phone, type: option.type, dir: option.dir};
                    if (option.callback) option.callback();
                }
                else {
                    timeSendCode(0, option);
                    alert(r.msg);
                }
            },
            error: function () {
                timeSendCode(0, option);
            }
        });
        if (option.passive) {
            delete option.passive;
            log({name: 'toSendCheckcode', params: data});
        }
        else
            log({name: 'doSendCheckcode', params: data});

    };
    var doLogin = function (e, option) {
        $('.box-verifi').remove();
        if (e.type === undefined) {
            option = e;
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        if(!option.phone){
            mbox.verification($('#phone-verifi'),'请输入您的手机号码','box-phone');
            return;
        }
        if (!unicom.regexPhone.test(option.phone.trim())) {
            mbox.verification($('#phone-verifi'),'亲，别闹了，请搞个联通的手机号码再来！','box-phone');
            return;
        }
        if(!app.isclick){
            mbox.verification($('#code-verifi'),'请点击获取短信验证码','box-click');
            return;
        }
        if (!option.checkcode.val().trim()) {
            mbox.verification($('#code-verifi'),'请点击获取验证码，然后输入您收到的短信验证码','box-code');
            return;
        }
        if(!/\d{6}/.test(option.checkcode.val().trim())){
            mbox.verification($('#code-verifi'),'验证码错误，请查看您收到的短信，验证码为6位数字','box-code');
            return;
        }

        var data = {
            cmd: option.cmd || 'login',
            spinfocode: $$.spinfocode,
            phone: option.phone,
            checkcode: option.checkcode.val().trim()
        };
        if (option.single) data.single = option.single;
        if (option.confirm) data.confirm = option.confirm;
        var sender = $(e).off('click');
        $.ajax({
            sender: sender,
            url: "/proxy/v3/proxy.aspx",
            data: data,
            dataType: 'json',
            cache: false,
            type: 'post',
            beforeSend: function () {
                mbox.waiting('正在处理中,请稍候……');
                sender.click(function (e) {
                    doLogin(e, option);
                });
            },
            success: function (r) {
                mbox.close();
                if (r.s == 1) {
                    app_js.login(r.data.phone);
                    $.extend(user, r.data);
                    user.change.forEach(function (func) {
                        func.call();
                    });
                    if (r.crbt) {
                        if (r.crbt.s == 30) {
                            if (option.callback) option.callback({stack: 'opencrbt'});
                        }//开通彩铃标识
                        else if (r.crbt.s == 1) {
                            /*if (r.order) {//同时开彩铃和会员，彩铃开通成功时，判断会员是否开通成功
                                if (r.order.s == 20) {
                                    if (option.callback) option.callback({stack: 'openorder'});
                                }//开能会员标识
                                else if (r.order.s == 1) {
                                    if (option.callback) option.callback();
                                        var opp = {name: 'regularUserPocket', params: data};
                                        opp.name = 'regularUserPocket';
                                        log(opp);
                                }
                                else mbox.explain({icon: 'fail', explain: r.order.msg});//-21
                            }*/
                            if (option.callback) option.callback();
                            //mbox.explain({icon: 'fail', explain: r.crbt.msg})
                        }
                        else mbox.explain({icon: 'fail', explain: r.crbt.msg});//-31、31
                    }
                    else if (option.callback)
                        option.callback();
                }
                else if (r.s == -1003){  //联通非会员
                    $.extend(user, r.data);
                    user.change.forEach(function (func) {
                        func.call();
                    });
                    mbox.service({
                        title: option.title || pushinfo.crbt.pop.title,
                        music: option.music,
                        phone: user.phone,
                        changeEvent: function (e) {
                            alertLoginOpen(r);
                        },
                        confirmmsg: option.confirmmsg,
                        explain: option.explain || pushinfo.crbt.pop.content,
                        log: log({name: 'alertOpenOrderPay.before'})
                    });
                }
                else if (r.s == -80) {
                    app_js.login(r.data.phone);
                    $.extend(user, r.data);
                    if(option.phone==_temp_user.phone){
                        if(_temp_user.iscrbtend==1){
                            user.token = _temp_user.token;
                            user.ringstate = _temp_user.ringstate;
                            update_session({ringstate:user.ringstate,token:user.token});
                            mbox.waiting('正在查询【中国移动-音乐包服务】,请稍候……');
                            iscrbt({resCode:'000000',resMsg: '预查询',status:app.user.ringstate});
                        }
                    }
                    if(!user.token){
                        mbox.waiting('正在获取个人信息,请稍候……');
                        mob_loadin(option.phone);
                        var timer = 8000;
                        var wait = setInterval(function () {
                            timer = timer-500;
                            if (user.token||timer<= 0) {
                                clearInterval(wait);
                                if(!user.token){
                                    alert('个人信息获取超时，请重新登录');
                                }else{
                                    if(isUserCenter){
                                        member.find('h3').html(app.user.phone).next().html('非会员');
                                        $('.btn-upgrade').css('display', 'block').click(function (e) {
                                            mbox.waiting('正在查询【中国移动-彩铃服务】,请稍候……');
                                            log({name: 'queryOpenRingYN',type:'Interface',params: {phone:option.phone}});
                                            queryOpenRingYN({
                                                youCallbackName :"iscrbt",
                                                channelCode :channelCode,
                                                token:app.user.token
                                            });
                                        });
                                        $('.mobile-library-list').html('');
                                        form.parent().hide().next().show();
                                    }
                                    mbox.waiting('正在查询【中国移动-彩铃服务】,请稍候……');
                                    log({name: 'queryOpenRingYN',type:'Interface',params: {phone:option.phone}});
                                    queryOpenRingYN({
                                        youCallbackName: "iscrbt",
                                        channelCode: channelCode,
                                        token: user.token
                                    });
                                }
                                mbox.close();
                            }
                        }, 500);
                    }
                }
                else if (r.s == -100) {
                    app_js.login(r.data.phone);
                    mbox.del({
                        explain: '是否确认开通VIP会员\r\n• 确认加入VIP会员，即可领取特权福利。免费不限次更换带有“<span class="icon-font icon-color iconfont-queen"></span>”标记彩铃。\r\n• VIP会员，移动用户6元/月,后续还有更多VIP会员专享福利。\r\n• 海量彩铃免费不限次更换，需彩铃功能支持，如果您未开通，我们将为您开通，资费5元/月。',
                        confirmEvent:  function(e){
                            mbox.close();
                            option.confirm=1;
                            app.doLogin(e, $.extend(opt, option));}
                    });
                }
                else if (r.s == -101) {  //登录成功
                    app_js.login(r.data.phone);
                    $.extend(user, r.data);
                    user.change.forEach(function (func) {
                        func.call();
                    });
                    $('#phone-verifi,#code-verifi').remove();
                    $('.down-tip').html(user.phone + '，你好！<br>&nbsp;&nbsp;&nbsp;&nbsp;登录成功咯，现在您可以免费下载任意铃声咯。');
                    $('.btn-ok').html('朕知道了~').off('click').on('click',function(){
                        mbox.closeslid();
                    })
                }
                else if (r.s == -102) {  //登录失败
                    mbox.verification($('#code-verifi'), r.msg,'box-code');
                }
                else {
                    if(typeof(ok)!="undefined") {
                        ok.off('click').click(function (e) {
                            mbox.close();
                            app.doLogin(e, {
                                phone: phone.val().trim(),
                                checkcode: code,
                                cmd: 'login-crbt'
                            });
                        });
                    }
                   //mbox.explain({icon: 'fail', explain: r.msg});
                    mbox.verification($('#code-verifi'),r.msg,'box-code');
                }
            }
        });
        var opt = {name: 'alertLogin.doOK', params: data};
        if (option.cmd == 'login-order') opt.name = 'alertLoginOrder.doOK';
        else if (option.cmd == 'login-crbt') opt.name = 'alertLoginCrbt.doOK';
        else if (option.cmd == 'phonechecked') opt.name = 'alertLoginOnly.doOK';
        log(opt);
    };
    var doLoginOpen = function (e, option) {
        option.cmd = 'login-crbt';
        doLogin(e, option);
    };
    var doLoginOnly = function (e, option) {
        if(!option) option = {};
        option.cmd = 'phonechecked';
        doLogin(e, option);
    };

    var doOpenOrder = function (e, option) {
        if (e.type === undefined) {
            option = e;
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        var sender = $(e);

        var data = {
            cmd: 'open-order',
            spinfocode: $$.spinfocode
        };
        if(_mobilecom.regexPhone.test(user.phone)){
            mbox.waiting('正在查询【中国移动-彩铃服务】,请稍候……');
            orderlogin = true;
            log({name: 'before_interface3',type:'Interface',params: {phone:option.phone}});
            queryOpenRingYN({
                youCallbackName :"iscrbt",
                channelCode :channelCode,
                token:user.token
            });
        }else{
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
                beforeSend: function () {
                    mbox.waiting('升级中,请稍候……');
                },
                success: function (r) {
                    mbox.close();
                    if (r.s == 1) {
                        $.extend(user, r.data);
                        user.change.forEach(function (func) {
                            func.call();
                        });
                        if (option.callback) option.callback({stack: 'openorder'});

                    }
                    else if (r.s == 15) {
                        mbox.explain({
                            title: pushinfo.order.succ.title,
                            icon: 'succ',
                            explain: user.phone + pushinfo.order.succ.content
                        });
                    }
                    else {
                        if (pushinfo.order.fail.content)
                            mbox.explain({
                                title: pushinfo.order.fail.title,
                                icon: 'fail',
                                explain: pushinfo.order.fail.content
                            });
                        else
                            mbox.explain({icon: 'fail', explain: r.msg});
                    }
                }
            });
        }
        log({name: 'alertOpenOrder.doOK'});
    };
    var doOpenCrbt = function (e, option) {
        if (e.type === undefined) {
            option = e;
        }
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
            beforeSend: function () {
                mbox.waiting('处理中,请稍候……');
            },
            success: function (r) {
                mbox.close();
                if (r.s == 1) {
                    if (r.data) {
                        $.extend(user, r.data);
                        user.change.forEach(function (func) {
                            func.call();
                        });
                    }
                    if (option.callback) option.callback({stack: 'opencrbt'});
                }
                else if (r.s == 14) {
                    mbox.explain({
                        title: pushinfo.crbt.succ.title,
                        icon: 'succ',
                        explain: user.phone + pushinfo.crbt.succ.content
                    });
                }
                else if (r.s == 31) {
                    if (pushinfo.crbt.asyncsucc.content)
                        mbox.explain({
                            title: pushinfo.crbt.asyncsucc.title,
                            icon: 'fail',
                            explain: pushinfo.crbt.asyncsucc.content
                        });
                    else
                        mbox.explain({icon: 'fail', explain: r.msg});
                }
                else if (r.s == -33)
                    mbox.explain({icon: 'fail', explain: r.msg});
                else {
                    if (pushinfo.crbt.fail.content)
                        mbox.explain({
                            title: pushinfo.crbt.fail.title,
                            icon: 'fail',
                            explain: pushinfo.crbt.fail.content
                        });
                    else
                        mbox.explain({icon: 'fail', explain: r.msg});
                }
            }
        });
        log({name: 'alertOpenCrbt.doOK'});
    };
    var doOutOrder = function(e, option) {
        if (e.type === undefined) {
            option = e;
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        if (!option.phone) {
            //alert('请输入您的手机号码。');
            mbox.verification($('#phone-verifi'),'请输入您的手机号码。','box-phone');
            return;
        }
        if (!unicom.regexPhone.test(option.phone.trim())) {
            //alert("亲，别闹了，搞个正确的手机号码再来！");
            mbox.verification($('#phone-verifi'),'亲，别闹了，请搞个联通的手机号码再来！！','box-phone');
            return;
        }
        if(!app.isclick){
            //alert('请点击获取短信验证码。');
            mbox.verification($('#code-verifi'),'请点击获取短信验证码！','box-click');
            return;
        }
        if (!option.checkcode.val().trim()) {
            //alert('请点击获取验证码，然后输入您收到的短信验证码。');
            mbox.verification($('#code-verifi'),'请点击获取验证码，然后输入您收到的短信验证码','box-code');
            return;
        }
        if(!/\d{6}/.test(option.checkcode.val().trim())){
            //alert('请输入手机短信收到的验证码，验证码为6位数字');
            mbox.verification($('#code-verifi'),'验证码错误，请查看您收到的短信，验证码为6位数字','box-code');
            return;
        }
        var data={
            cmd: 'off-order',
            spinfocode: $$.spinfocode,
            phone: option.phone,
            checkcode: option.checkcode.val().trim()
        };
        var sender = $(e).off('click');
        $.ajax({
            sender: sender,
            url: "/proxy/v3/proxy.aspx",
            data: data,
            dataType: 'json',
            cache: false,
            type: 'post',
            beforeSend: function () {
                mbox.waiting('处理中,请稍候……');
            },
            success: function (r) {
                mbox.close();
                if (r.s == 1) {
                    if (r.data) {
                        app_js.logout(r.data.phone);
                        $.extend(user, r.data);
                        user.change.forEach(function (func) {
                            func.call();
                        });
                    }
                    if (option.callback)
                        option.callback();
                    //mbox.closeslid();
                    mbox.explain({
                        icon: 'succ',
                        explain: r.msg
                    });
                }else if(r.s == -81){
                    app.log({name: 'cancelMonthRing',type: 'Interface',params: {phone: option.phone}});
                    cancelMonthRing({
                        youCallbackName: "cancelMonthRing_callback",
                        channelCode: channelCode,
                        token: app.user.token,
                        serviceId: serviceId
                    })
                }
                else {
                    mbox.explain({icon: 'succ',explain: '退订失败！'});
                    //mbox.verification($('#code-verifi'),r.msg,'box-code');
                    sender.click(function (e) {
                        doOutOrder(e, option);
                    });
                }
            }
        });
        var opt = {name: 'alertOutOrder.doOK', params: data};
        log(opt);
    };

    var alertLogin = function (r) {
        if (!r) r = {};
        timeSendCode(0);
        mbox.checking({
            title: r.title || "验证手机号",
            music: r.music,
            explain: r.explain || '欢迎登录彩铃用户系统，请输入手机号和验证码，完成登录操作。',
            phone: r.phone || user.phone,
            getcodeEvent: function (e, opt) {
                opt.loged = true;
                opt.dir = 1;
                doSendCheckcode(e, opt);
                //doSendCheckcode(e, $.extend({ callback: function () { alertLogin($.extend(opt, r)); } }, opt));
            },
            checkEvent: function (e, opt) {
                doLogin(e, $.extend(opt, r));
            },
            log: r.loged ? null : log({name: 'alertLogin'})
        });
    };
    var alertLoginOpen = function (r) {
        if (!r) r = {};
        timeSendCode(0);
        mbox.checking({
            title: r.title || pushinfo.login.pop.title,
            music: r.music,
            explain: r.explain || pushinfo.login.pop.content,
            phone: r.phone || user.phone,
            getcodeEvent: function (e, opt) {
                opt.loged = true;
                opt.type = 1;//验证码用途
                opt.dir = r.dir || pushinfo.login.mode;//使用方向
                var rid = '';
                if (r.sender)rid = r.sender.data('rid');
                opt.rid = rid;
                //doSendCheckcode(e, $.extend({ callback: function () { alertLoginOpen($.extend(opt, r)); } }, opt));
                doSendCheckcode(e, opt);
                if (opt.phone && mobilecom.regexPhone.test(opt.phone)) {
                    //提前查询彩铃功能
                    _temp_user.phone = opt.phone;
                    _temp_mob_loadin();
                    var timer = 30000;
                    var _temp_wait = setInterval(function () {
                        timer = timer - 500;
                        if (_temp_user.token || timer <= 0) {
                            clearInterval(_temp_wait);
                            if (_temp_user.token) {
                                log({name: 'before_checkphone_getringstate', type: 'Interface', params: {phone: opt.phone}});
                                queryOpenRingYN({
                                    youCallbackName: "_temp_iscrbt",
                                    channelCode: channelCode,
                                    token: _temp_user.token
                                });
                                //log({name: 'before_checkphone_getorderstate', type: 'Interface', params: {phone: opt.phone}});
                                //queryMonthRingYN({
                                //    youCallbackName :"_temp_isorder",
                                //    channelCode :channelCode,
                                //    token:_temp_user.token,
                                //    serviceId:serviceId
                                //});
                            } else {
                                init_temp_user();
                            }
                        }
                    }, 500);
                }
            },
            checkEvent: function (e, opt) {
                //doLoginOpen(e, $.extend(opt, r));
                doLoginOnly(e, $.extend(opt, r));
            },
            log: r.loged ? null : log({name: pushinfo.login.mode == 2 ? 'alertLoginOrder' : pushinfo.login.mode == 3 ? 'alertLoginCrbt' : 'alertLogin'})
        });
    };
    var alertLoginOnly = function (r) {
        if (!r) r = {};
        timeSendCode(0);
        mbox.checking({
            title: r.title || pushinfo.login.pop.title,
            music: r.music,
            explain: r.explain || pushinfo.login.pop.content,
            phone: r.phone || user.phone,
            getcodeEvent: function (e, opt) {
                opt.loged = true;
                opt.type = 1;//验证码用途
                opt.dir = 1 || pushinfo.login.mode;//使用方向
                //doSendCheckcode(e, $.extend({ callback: function () { alertLoginOpen($.extend(opt, r)); } }, opt));
                doSendCheckcode(e, opt);
            },
            checkEvent: function (e, opt) {
                doLoginOnly(e, $.extend(opt, r));
            },
            log: r.loged ? null : log({name: pushinfo.login.mode == 2 ? 'alertLoginOrder' : pushinfo.login.mode == 3 ? 'alertLoginCrbt' : 'alertLogin'})
        });
    };
    var alertOpenOrder = function (r) {
        if (!r) r = {};
        mbox.service({
            title: r.title || pushinfo.order.pop.title,
            music: r.music,
            phone: r.phone || user.phone,
            changeEvent: function (e) {
                alertLoginOpen(r);
            },
            confirmmsg: r.confirmmsg,
            confirmEvent: function (e) {
                doOpenOrder(e, r);
            },
            //explain: r.explain || pushinfo.order.pop.content,
            log: log({name: 'alertOpenOrder'})
        });
    };
    var alertOpenCrbt = function (r) {
        if (!r) r = {};
        mbox.service({
            title: r.title || pushinfo.crbt.pop.title,
            music: r.music,
            phone: r.phone || user.phone,
            changeEvent: function(e){ alertLoginOpen(r); },
            confirmmsg: r.confirmmsg,
            confirmEvent: function (e) {
                doOpenCrbt(e, r);
            },
            explain: r.explain || pushinfo.crbt.pop.content,
            log: log({name: 'alertOpenCrbt'})
        });
    };
    var alertOutOrder = function(r) {
        if (!r) r = {};
        timeSendCode(0);
        mbox.checking({
            title:  r.title || '退订VIP会员',
            member_tip: r.member_tip,
            member_tq: r.member_tq,
            phone:r.phone || user.phone,
            getcodeEvent: function (e, opt) {
                opt.loged = true;
                opt.type = 2;//验证码用途
                doSendoutordercode(e, opt);
            },
            checkEvent: function (e, opt) {
                doOutOrder(e, opt);
            },
            log: r.loged ? null : log({name: 'alertOutOrder'})
        });
    };

    var generateorder = function (option) {
        var data = {
            cmd: 'generate-order',
            goodsid: option.goodsid,
            paytype: option.paytype,
            objtype: 3,
            objID: option.objID,
            returnUrl: option.returnUrl
        };
        $.ajax({
            url: "/proxy/v3/proxy.aspx",
            data: data,
            dataType: 'json',
            cache: false,
            type: 'get',
            /*beforeSend: function () {
                mbox.waiting('正在生成订单,请稍候……');
            },*/
            success: function (r) {
                //mbox.close();
                option.orderid = r.orderid;
                $.extend(app.user, {orderidD: true});
                app.user.change.forEach(function (func) {
                    func.call();
                });
                update_session({orderidD: true});
                gotopay(option);
            }
        });
        log({name: generateorder, params: data});
    };

    var gotopay = function (option) {
        window.location.href="/unipay/pay/webpay?orderid=" + option.orderid;
    };


    $.extend($$, {
        pushinfo: pushinfo,
        user: user,//用户信息

        doPlay: doPlay,
        doDownload: doDownload,
        doSetRing: doSetRing,
        doDelRing: doDelRing, //删除铃音库铃音
        doOnServe: doOnServe,
        doSendCheckcode: doSendCheckcode,
        doLogin: doLogin,
        doLoginOpen: doLoginOpen,
        doLoginOnly: doLoginOnly,

        doOnOrder: doOpenOrder,
        doOutOrder: doOutOrder,
        doOnCrbt: doOpenCrbt,

        alertLogin: alertLogin,
        alertLoginOpen: alertLoginOpen,
        alertLoginOnly: alertLoginOnly,
        alertOpenOrder: alertOpenOrder,
        alertOpenCrbt: alertOpenCrbt,
        alertOutOrder: alertOutOrder,
        generateorder: generateorder,
        //日志
        log: log,
        //对象初始化
        init: function () {
            var a = location.search.substr(1).match(/(^|&)a=([^&]*)(&|$)/i) || ['','',''];
            $.ajax({
                url: "/proxy/v3/comkey.aspx",
                data: {
                    network: $$.connection.type,
                    spinfocode: $$.spinfocode,
                    a: unescape(a[2])
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
                        //获取透传用户token
                        var w_timer = 30000;
                        var _w_wait = setInterval(function () {
                            w_timer = w_timer - 500;
                            if(!user.phone || user.token ||!mobilecom.regexPhone.test(user.phone)){
                                clearInterval(_w_wait);
                            }else if (mobile_state && user.phone && !user.token && mobilecom.regexPhone.test(user.phone)) {
                                _temp_user.touchuanupdate = 1;
                                clearInterval(_w_wait);
                                //提前查询彩铃功能
                                _temp_user.phone = user.phone;
                                _temp_mob_loadin();
                                var timer = 30000;
                                var _temp_wait = setInterval(function () {
                                    timer = timer - 500;
                                    if (_temp_user.token || timer <= 0) {
                                        clearInterval(_temp_wait);
                                        if (_temp_user.token) {
                                            log({
                                                name: 'before_checkphone_getringstate',
                                                type: 'Interface',
                                                params: {phone: user.phone}
                                            });
                                            queryOpenRingYN({
                                                youCallbackName: "_temp_iscrbt",
                                                channelCode: channelCode,
                                                token: _temp_user.token
                                            });
                                            log({
                                                name: 'before_checkphone_getorderstate',
                                                type: 'Interface',
                                                params: {phone: user.phone}
                                            });
                                            queryMonthRingYN({
                                                youCallbackName: "_temp_isorder",
                                                channelCode: channelCode,
                                                token: user.token,
                                                serviceId: serviceId
                                            });
                                        } else {
                                            init_temp_user();
                                        }
                                    }
                                }, 500);
                            }
                        }, 500);
                    }
                }
            });
            user.change.push(function () {
                var curnum = $('.curnum');
                if (user.logined()) {
                    curnum.show().find('b').html(user.phone + '（' + user.orderstatestr + '）');
                    if( user.isorder()){
                        curnum.show().find('b').html(user.phone + '<i class="icon-vip-bz"></i>');
                    }
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
        }
    });

    $$.staticsRequest = function () {
        var h = decodeURIComponent(location.href);
        if (h.endsWith('.html') || h.endsWith('.htm')) {
            if (h.indexOf(':') > 0) {
                h = h.substring(h.lastIndexOf('/') + 1);
                h = h.substring(h.indexOf(',') + 1);
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
        var reg = new RegExp("," + name + "=([^,\.]*)", "i");
        var r = decodeURIComponent(location.href);
        r = r.match(reg);
        if (r != null)
            return r[1];
        return null;
    };
}
$(window).ready(function () {
    $.extend(app.pushinfo, temp_config);
    app.spinfocode = temp_spinfocode;
    app.isclick = temp_isclick;

    temp_spinfocode='';
    temp_isclick='';
    temp_config='';

    mbox.setting();
    if (!window.navigator.cookieEnabled) {
        mbox.explain({explain: '很不幸,目前您的浏览器并未开启对cookie的支持，将无法使用，请先开启cookie支持！'});
        return;
    }
    //播放初始化设置公共方法
    mplayer.init({
        loadstart: function () {
            mbox.waiting('音频加载中……');
        },
        play: function () {
            mbox.close();
            if(!flag_listen)
                mplayer.target.addClass('btn-pause').css({'opacity':1}).prev().hide();
            else
                mplayer.target.addClass('btn-pause').prev().hide();
        },
        pause: function () {
            if(!flag_listen)
                 mplayer.target.removeClass('btn-pause').css({'opacity':0}).prev().show();
            else
                 mplayer.target.removeClass('btn-pause').prev().hide();
        },
        error: function () {
            mbox.close();
        }
    });
    app.init();
    //地址带上渠道参数
    $('a').each(function () {
        var link = $(this).attr('href');
        if ((new RegExp(location.host + '/')).test(link) || !/^http:\/\/|javascript:/i.test(link)) {
            $(this).attr('href', app.link(link));
        }
    });

    var _load_diring = setInterval(function () {
        if(app.pushinfo.id){
            clearInterval(_load_diring);
            diring_index_state=true;
        }
    },10);

});
