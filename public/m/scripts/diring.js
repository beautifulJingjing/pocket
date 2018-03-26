//JSON转换支持
if (typeof JSON !== "object") $.getScript("/javascripts/json2.min.js");
//弹窗控件
var mbox = (function () {
    //用来记录要显示的DIV
    var _box;
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

    function alertslid(div, callback) {
        //滑出
        if (!div) return;
        if (div instanceof Element) div = $(div);
        if (div.is(':hidden')) {
            var _w = $(window);
            div.css({
                'left': _w.width(),
                'min-height': _w.height()
            });
            div.show();
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
        if (!div || div instanceof Event) div = $$.setting;
        if (div instanceof Element) div = $(div);
        div.animate({'left': $(window).width()}, 300, function () {
            div.hide();
            mplayer.doStop();
        });
    }

    function checking(option) {
        if (!option) option = {};
        var slid = $$.setting;
        slid.checking.show().siblings().hide();
        slid.title.html(option.title || '验证手机号');
        if (option.music){
            slid.musics.html(option.music).show();
            with (slid.musics) {
                find('.btn-play').removeClass('btn-pause').click(app.doPlay);
                find('.name').find('em,i').remove();
                find('.set').remove();
            }
        }
        else if (!slid.musics.html() || slid.is(':hidden')) slid.musics.hide();
        with (slid.checking) {
            phone.val(option.phone || '');
            code.val('');
            btn_code.off('click').click(function (e) {
                option.getcodeEvent(e, {
                    phone: phone.val().trim()
                });
            });
            btn_ok.html(option.check || '确定').off('click').click(function (e) {
                option.checkEvent(e, {
                    phone: phone.val().trim(),
                    checkcode: code.val().trim()
                });
            });
            msg.html((option.explain || '').toHtml());
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
        if (option.music){
            slid.musics.html(option.music).show();
            with (slid.musics) {
                find('.btn-play').removeClass('btn-pause').click(app.doPlay);
                find('.name').find('em,i').remove();
                find('.set').remove();
            }
        }
        else if (!slid.musics.html() || slid.is(':hidden')) slid.musics.hide();
        with (slid.service) {
            if (option.phone) phone.text(option.phone).show();
            else phone.hide();
            if(option.changeEvent) btn_change.off('click').show().click(option.changeEvent);
            else btn_change.hide();
            if (option.confirmmsg) confirm.html(option.confirmmsg.toHtml()).show();
            else confirm.hide();
            btn_ok.html(option.confirm || '确认').off('click').click(option.confirmEvent);
            msg.html((option.explain || '').toHtml());
        }
        alertslid(slid[0], function () {
            if (option.log) {
                option.log();
                delete  option.log;
            }
        });
        return slid[0];

        //if (!option) option = {};
        //var box = explain.setting;
        //box.title.html(option.title || '开通服务');
        //box.explain.html((option.explain || '').toHtml());
        //box.left.show().html(option.cancel || '取消').off('click').click(option.cancelEvent || close);
        //box.right.show().html(option.confirm || '确认').off('click').click(option.confirmEvent);
        //box.center.hide();
        //alert(box[0]);
        //if (option.log) {
        //  option.log.call();
        //  delete option.log;
        //}
        //return box[0];
    }

    function explain(option) {
        if (!option) option = {};
        var slid = $$.setting;
        slid.explain.show().siblings().hide();
        slid.title.html(option.title || '提示');
        if (option.music){
            slid.musics.html(option.music).show();
            with (slid.musics) {
                find('.btn-play').removeClass('btn-pause').click(app.doPlay);
                find('.name').find('em,i').remove();
                find('.set').remove();
            }
        }
        else if (!slid.musics.html() || slid.is(':hidden')) slid.musics.hide();
        with (slid.explain) {
            if (option.icon) icon.removeClass().addClass('icon').addClass(option.icon);
            else icon.hide();
            msg.html(option.explain.toHtml());
            btn_ok.html(option.confirm || '我知道了~').off('click').click(option.confirmEvent || closeslid);
        }
        alertslid(slid, function () {
            if (option.log) {
                option.log();
                delete  option.log;
            }
        });
        return slid[0];

        //var box = explain.setting;
        //box.title.html(option.title || '提示');
        //box.explain.html(option.explain.toHtml());
        //box.left.hide();
        //box.right.hide();
        //box.center.show().html(option.confirm || '我知道了~').off('click').click(option.confirmEvent || close);
        //alert(box[0]);
        //if (option.log) {
        //  option.log.call();
        //  delete option.log;
        //}
        //return box[0];
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

        //特定弹窗
        waiting: function (msg) {
            var dv = $('#pop-waiting-layer');
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
        setting: function () {
            //var setting = $('#pop-checking-layer');
            //$.extend(setting, {
            //  title: setting.find('#title'),
            //  explain: setting.find('#explain'),
            //  phone: setting.find('#txt-phone'),
            //  checkcode: setting.find('#txt-checkcode'),
            //  getcode: setting.find('#btn-getcode'),
            //  check: setting.find('#btn-check')
            //});
            //checking.setting = setting;
            //
            //setting = $('#pop-msg-layer');
            //$.extend(setting, {
            //  title: setting.find('#title'),
            //  explain: setting.find('#explain'),
            //  left: setting.find('#btn-left'),
            //  right: setting.find('#btn-right'),
            //  center: setting.find('#btn-enter')
            //});
            //explain.setting = setting;

            var setting = $('#slid-layer');
            $.extend(setting, {
                title: setting.find('.t').find('span'),
                btn_back: setting.find('.btn-back'),
                musics: setting.find('.musics'),
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
                    msg: checking.find('.msg')
                });
                $.extend(service, {
                    phone: service.find('b'),
                    btn_change: service.find('.btn-change'),
                    confirm: service.find('.confirm'),
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
                            alert(error.code + '\r\n' + networkState + '\r\n' + readyState + '\r\n' + currentSrc);
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
        },
    };
    return $$;
})();
//联通号码校验正则
var unicom = {regexPhone: new RegExp(/^((13[0-2])|145|(15[5|6])|176|(18[5|6]))\d{8}$/)};
//电信号码校验正则
var telecom = {regexPhone: new RegExp(/^(133|153|177|(18[0|1|9]))\d{8}$/)};
//铃声DIY
var app = (function () {
    var $$ = {
        spinfocode: '0',//渠道
        connection: navigator.connection || {type: ''},//获取当前网络连接方式，部分浏览器支持
        unikey: 0//透传状态，1=已透传，0=未透传
    };
    var pushinfo = {};
    var user = {
        //用户会员判断
        isorder: function () {
            if (typeof this.orderstate == 'number') return this.orderstate != 4;
            else return false;
        },
        logined: function () {
            if (typeof this.phone != 'string' || this.phone == '' || typeof this.id != 'string' || this.id == '')
                return false;
            else if (!unicom.regexPhone.test(this.phone) && !telecom.regexPhone.test(this.phone))
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
                    return "月底到期";
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
    }

    var doPlay = function (e) {
        if (e.type !== undefined) {
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        var sender = $(e);
        if (sender.data('rid') === undefined) {
            sender = sender.parents('.musics').find('.btn-play');
        }
        mplayer.doPlay('/proxy/v3/audition.aspx?rid={0}'.format(sender.data('rid')), sender);
    }
    var doDownload = function (e) {
        if (e.type !== undefined) {
            e = this;
        }
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
                                option.dir = 2;
                                alertLoginOpen(option);
                            }
                            else {
                                option.confirmmsg = '　　是否确认下载该首铃音？';
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
                                option.dir = 3;
                                alertLoginOpen(option);
                            }
                            else {
                                option.confirmmsg = '　　是否确认下载该首铃音？';
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
    }
    var doSetRing = function (e) {
        if (e.type !== undefined) {
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        var sender = $(e).off('click');
        var data = {
            cmd: 'set-ring',
            spinfocode: $$.spinfocode,
            rid: sender.data('rid'),
            type: sender.data('type') || 1,
            flag: sender.data('flag')
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
                    var opt = {
                        title: pushinfo.ringset.singleset.succ.title,
                        music: sender.parents('.musics').html(),
                        icon: 'succ',
                        explain: pushinfo.ringset.singleset.succ.content
                    };
                    if (data.rid.toString().indexOf(',') > -1) {
                        opt.title = pushinfo.ringset.muchset.succ.title;
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
                    if (r.s == -10) {
                        alertLoginOpen(option);
                    }
                    else if (r.s == -20) {
                        if (pushinfo.order.pop.type == 2)
                            mbox.explain({
                                title: pushinfo.order.pop.title,
                                music: sender.parents('.musics').html(),
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
                            option.confirmmsg = '　　是否确认设置该首彩铃？';
                            alertOpenOrder(option);
                        }
                    }
                    else if (r.s == -30) {
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
                            option.confirmmsg = '　　是否确认设置该首彩铃？';
                            alertOpenCrbt(option);
                        }
                    }
                    else if (r.s == -32) {
                        mbox.service({
                            title: pushinfo.crbt.pop.title,
                            music: sender.parents('.musics').html(),
                            phone: user.phone,
                            confirmmsg: r.msg,
                            confirmEvent: function (e) {
                                ajaxSettings.data.confirm = 1;
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
    }
    var doOnServe = function (e, option) {
        if (e.type === undefined) {
            option = e;
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
                mbox.waiting('设置中,请稍候……');
                sender.click(doOnServe);
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
                    if (pushinfo.declare.message.content)
                        opt.explain += '<br/><a href="{1}" class="uline">{0}</a>'.format(pushinfo.declare.message.content, pushinfo.declare.message.link);
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
                    if (r.s == -10) {
                        alertLoginOpen(opt);
                    }
                    else if (r.s == -20) {
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
                        } else {
                            opt.confirmmsg = '　　是否确认领取服务？';
                            alertOpenOrder(opt);
                        }
                    }
                    else if (r.s == -30) {
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
                    else if (r.s == -33) {
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
                        mbox.explain({icon: 'fail', explain: r.msg});
                    }
                }
            }
        };
        var waittime = 8000;
        var wait = setInterval(function () {
            if (app.unikey || waittime <= 0) {
                clearInterval(wait);
                $.ajax(ajaxSettings);
                app.log({name: sender.data('trace') || 'doOpenServe', params: ajaxSettings.data});
            }
            waittime -= 500;
        }, 500);
    }
    var timeSendCodeTimeout, lastSendCodeOption;

    var timeSendCode = function (t, opt) {
        if(!opt) opt = {};
        var checking = opt.checking|| mbox.setting.checking;
        if (t < 1) {
            clearTimeout(timeSendCodeTimeout);
            checking.btn_code.text('免费获取短信验证码').click(function (e) {
                opt.phone = checking.phone.val().trim();
                doSendCheckcode(e, opt);
            });
        }
        else {
            checking.btn_code.text('验证码已下发 (' + t +'s)');
            timeSendCodeTimeout = setTimeout(timeSendCode, 1000, --t, opt);
        }
    }
    var doSendCheckcode = function (e, option) {
        if (e.type === undefined) {
            option = e;
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        if (!option.phone) {
            alert('请输入您的手机号码。');
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
            dir: option.dir //使用方向
        };
        if (option.type) data.type = option.type;
        if (option.passive) log({name: 'toSendCheckcode.Before', params: data});
        else log({name: 'doSendCheckcode.Before', params: data});
        if (!telecom.regexPhone.test(option.phone.trim())) {
            alert("亲，别闹了，搞个电信的手机号码再来！");
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
        if (option.passive){
            delete option.passive;
            log({name: 'toSendCheckcode', params: data});
        }
        else
            log({name: 'doSendCheckcode', params: data});

        //if (e.type === undefined) { option = e; e = this; }
        //else if (e.target || e.srcElement) e = e.target || e.srcElement;
        //if (!option.phone) { alert('请输入您的手机号码。'); return; }
        //var data = {
        //  cmd: 'get-checkcode',
        //  spinfocode: $$.spinfocode,
        //  phone: option.phone,
        //  dir: option.dir
        //};
        //if (option.type) data.type = option.type;
        //log({ name: 'doSendCheckcode.Before', params: data });
        //if (!(unicom.regexPhone.test(option.phone.trim()) || telecom.regexPhone.test(option.phone.trim()))) { alert("亲，别闹了，搞个联通或电信的手机号码再来！"); return; }
        //var sender = $(e).off('click');
        //$.ajax({
        //  sender: sender,
        //  url: "/proxy/v3/proxy.aspx",
        //  data: data,
        //  dataType: 'json',
        //  cache: false,
        //  type: 'post',
        //  beforeSend: function () {
        //    mbox.waiting('验证码发送中,请稍候……');
        //    sender.click(function (e) { doSendCheckcode(e, option); });
        //  },
        //  success: function (r) {
        //    if (r.s == 1)
        //      mbox.explain({
        //        explain: "短信验证码已下发到您的手机，请留意手机短信通知。",
        //        confirmEvent: option.callback
        //      });
        //    else
        //      mbox.explain({ explain: r.msg });
        //  }
        //});
        //log({ name: 'doSendCheckcode', params: data });
    }
    var doLogin = function (e, option) {
        if (e.type === undefined) {
            option = e;
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        if (!option.phone) {
            alert('请输入您的手机号码。');
            return;
        }
        if (!option.checkcode) {
            alert('请输入验证码。');
            return;
        }
        if (!telecom.regexPhone.test(option.phone.trim())) {
            alert("亲，别闹了，搞个电信的手机号码再来！");
            return;
        }
        if(!/^\d{4,6}$/.test(option.checkcode.trim())){
            alert('请输入手机短信收到的验证码，验证码为4或6位数字');
            return;
        }
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
                sender.click(function (e) {
                    doLogin(e, option);
                });
            },
            success: function (r) {
                mbox.close();
                if (r.s == 1) {
                    $.extend(user, r.data);
                    user.change.forEach(function (func) {
                        func.call();
                    });
                    if (r.crbt) {
                        if (r.crbt.s == 30) {
                            if (option.callback) option.callback({stack: 'opencrbt'});
                        }//开通彩铃标识
                        else if (r.crbt.s == 1) {
                            if (option.callback) option.callback();
                        }
                        else mbox.explain({icon: 'fail', explain: r.crbt.msg});//-33、-31
                    }
                    else if (r.order) {
                        if (r.order.s == 20) {
                            if (option.callback) option.callback({stack: 'openorder'});
                        }//开能会员标识
                        else if (r.order.s == 1) {
                            if (option.callback) option.callback();
                        }
                        else mbox.explain({icon: 'fail', explain: r.order.msg});//-21
                    }
                    else if (option.callback)
                        option.callback();
                }
                else {
                    mbox.explain({icon: 'fail', explain: r.msg});
                }
            }
        });
        var opt = {name: 'alertLogin.doOK', params: data};
        if (option.cmd == 'login-order') opt.name = 'alertLoginOrder.doOK';
        else if (option.cmd == 'login-crbt') opt.name = 'alertLoginCrbt.doOK';
        log(opt);
    }
    var doLoginOpen = function (e, option) {
        if (option.dir) {
            if (option.dir == 2)option.cmd = 'login-order';
            else if (option.dir == 3) option.cmd = 'login-crbt';
        }
        else if (pushinfo.login.mode == 2) option.cmd = 'login-order';
        else if (pushinfo.login.mode == 3) option.cmd = 'login-crbt';
        doLogin(e, option);
    }

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
        log({name: 'alertOpenOrder.doOK'});
    }
    var doOpenCrbt = function (e, option) {
        if (e.type === undefined) {
            option = e;
            e = this;
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
    }
    var doOutOrder = function(e, option) {
        if (e.type === undefined) {
            option = e;
            e = this;
        }
        else if (e.target || e.srcElement) e = e.target || e.srcElement;
        if (!option.phone) {
            alert('请输入您的手机号码。');
            return;
        }
        if (!option.checkcode) {
            alert('请输入验证码。');
            return;
        }
        if (!telecom.regexPhone.test(option.phone.trim())) {
            alert("亲，别闹了，搞个电信的手机号码再来！");
            return;
        }
        if(!/^\d{4,6}$/.test(option.checkcode.trim())){alert('请输入手机短信收到的验证码，验证码为4或6位数字');return;}
        var data={
            cmd: 'off-order',
            spinfocode: $$.spinfocode,
            phone: option.phone,
            checkcode: option.checkcode
        };
        var sender = $(e).off('click');
        $.ajax({
            sender: sender,
            url: "/proxy/v3/proxy.aspx",
            data:data ,
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
                        $.extend(user, r.data);
                        user.change.forEach(function (func) {
                            func.call();
                        });
                    }
                    if (option.callback)
                        option.callback();
                    mbox.closeslid();
                }
                else {
                    if (r.msg) mbox.explain({explain: r.msg});
                    sender.click(function (e) {
                        doOutOrder(e, option);
                    });
                }
            }
        });
        var opt = {name: 'alertOutOrder.doOK', params: data};
        log(opt);
    }

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
                //doSendCheckcode(e, $.extend({ callback: function () { alertLoginOpen($.extend(opt, r)); } }, opt));
                doSendCheckcode(e, opt);
            },
            checkEvent: function (e, opt) {
                doLoginOpen(e, $.extend(opt, r));
            },
            log: r.loged ? null : log({name: pushinfo.login.mode == 2 ? 'alertLoginOrder' : pushinfo.login.mode == 3 ? 'alertLoginCrbt' : 'alertLogin'})
        });
    };
    var alertOpenOrder = function (r) {
        if (!r) r = {};
        mbox.service({
            title: r.title || pushinfo.order.pop.title,
            music: r.music,
            phone: user.phone,
            changeEvent: function(e){alertLoginOpen(r);},
            confirmmsg: r.confirmmsg,
            confirmEvent: function (e) {
                doOpenOrder(e, r);
            },
            explain: r.explain || pushinfo.order.pop.content,
            log: log({name: 'alertOpenOrder'})
        });
    };
    var alertOpenCrbt = function (r) {
        if (!r) r = {};
        mbox.service({
            title: r.title || pushinfo.crbt.pop.title,
            music: r.music,
            phone: user.phone,
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
            phone:r.phone || user.phone,
            getcodeEvent: function (e, opt) {
                opt.loged = true;
                opt.type = 2;//验证码用途
                doSendCheckcode(e, opt);
            },
            checkEvent: function (e, opt) {
                doOutOrder(e, $.extend(opt, r));
            },
            log: r.loged ? null : log({name: 'alertOutOrder'})
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
        doOutOrder: doOutOrder,
        doOnCrbt: doOpenCrbt,

        alertLogin: alertLogin,
        alertLoginOpen: alertLoginOpen,
        alertOpenOrder: alertOpenOrder,
        alertOpenCrbt: alertOpenCrbt,
        alertOutOrder: alertOutOrder,

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
            mplayer.target.addClass('btn-pause');
        },
        pause: function () {
            mplayer.target.removeClass('btn-pause');
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
});
