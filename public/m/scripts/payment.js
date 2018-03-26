/**
 * Created by majun on 2017/2/20.
 */
//更新session信息
 function update_session(data){
    $.ajax({
        url: "/proxy/v3/comkey.aspx",
        data: data,
        dataType: 'json',
        cache: false,
        type: 'get',
        success: function (r) {
            $.extend(app.user, r);
        }
    });
};
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]); return null;
}
var phone=$('.phone'),code=$('.code'),take=$('.btn-code'),change=$('.btn-change');
var service = $('.service');
var explain = $('.explain');
var checking = $('.checking');
var sender = $('.musics .pinfo a');
var _root = window.location.host;

var data = {
    cmd: 'payed-set-ring',
    spinfocode: '',
    phone: '',
    rid: getQueryString('ringid')
};
var dosetring_ajaxSettings = {
    sender: sender,
    url: "/proxy/v3/proxy.aspx",
    data: data,
    dataType: 'json',
    cache: false,
    type: 'post',
    beforeSend: function () {
        mbox.waiting('设置中,请稍候……');
    },
    success: function (r) {
        mbox.close();
        var _msg = '';
        if (r.s == 1) {
            app.user.orderidD = false;
            $.extend(app.user, r.data);
            app.user.change.forEach(function (func) {
                func.call();
            });
            update_session({orderidD: false});
            if(r.crbt) {
                if(r.crbt.s == 1) {
                    _msg = app.pushinfo.ringset.singleset.succ.content;
                    if (data.rid.toString().indexOf(',') > -1) {
                        _msg = app.pushinfo.ringset.muchset.succ.content;
                    }
                    if (dosetring_ajaxSettings.plus) {
                        switch (dosetring_ajaxSettings.plus.stack) {
                            case 'openorder':
                                _msg = app.pushinfo.order.succ.content + '\r\n' + _msg;
                                break;
                            case 'opencrbt':
                                _msg = app.pushinfo.crbt.succ.content + '\r\n' + _msg;
                                break;
                        }
                    }
                    if (app.pushinfo.declare.message.content)
                        _msg += '<br/><a href="{1}" class="uline">{0}</a>'.format(app.pushinfo.declare.message.content, app.pushinfo.declare.message.link);
                    explain.find('.btn-ok').text('更大波精彩等你发现').off('click').click(function (e) {
                        window.location.href = 'https://'+_root+'/m/tem,' + app.spinfocode + '.html';
                    });
                }
                else if (r.crbt.s == 31) {  //彩铃尚未开通成功或开通中
                    if (app.pushinfo.crbt.asyncsucc.content) _msg = app.pushinfo.crbt.asyncsucc.content;
                    else  _msg = r.crbt.msg;
                    explain.find('.btn-ok').text('确定').off('click').click(function(){
                        window.location.href = 'https://'+_root+'/m/tem,'+app.spinfocode+'.html';
                    });
                }
                else {
                    _msg = app.pushinfo.ringset.singleset.fail.content;
                    _msg += '<br/><a href="{1}" class="uline">{0}</a>'.format('还是不行?去看看其他铃声吧', 'https://'+_root+'/m/tem,'+app.spinfocode+'.html');

                    explain.find('.btn-ok').text('再试试看').off('click').click(function(e){
                        //try again
                        if (app.user.logined()) {
                            data.spinfocode = app.spinfocode;
                            data.phone = app.user.phone;
                            dosetring_ajaxSettings.data.confirm = 1;
                            $.ajax(dosetring_ajaxSettings);
                        }
                        else {
                            if(app.user.phone && unicom.regexPhone.test(app.user.phone)){
                                app.doOnOrder(e,{
                                    callback: function (plus) {
                                        dosetring_ajaxSettings.data.confirm = 1;
                                        if (dosetring_ajaxSettings.plus) $.extend(dosetring_ajaxSettings.plus, plus);
                                        else dosetring_ajaxSettings.plus = plus;
                                        data.spinfocode = app.spinfocode;
                                        data.phone = app.user.phone;
                                        $.ajax(dosetring_ajaxSettings);
                                    }
                                });
                            }else{
                                checking.find('.msg').html(app.pushinfo.login.pop.content.toHtml());
                                if(app.user.phone) phone.val(app.user.phone);
                                checking.find('.btn-ok').text('确定').off('click').click(function(e){
                                    app.doLogin(e, {
                                        phone: phone.val().trim(),
                                        checkcode: code,
                                        cmd: 'phonechecked',
                                        callback: function (plus) {
                                            data.spinfocode = app.spinfocode;
                                            data.phone = app.user.phone;
                                            dosetring_ajaxSettings.data.confirm = 1;
                                            if (dosetring_ajaxSettings.plus) $.extend(dosetring_ajaxSettings.plus, plus);
                                            else dosetring_ajaxSettings.plus = plus;
                                            $.ajax(dosetring_ajaxSettings);
                                        }
                                    });
                                });
                                explain.hide();
                                checking.show();
                            }
                        }
                    });
                }
            }
        }
        else if(r.s == -1003){  //尚未开通会员服务
            _msg = '服务正在开通中……预计24小时内生效，如未生效，费用我们将在2个工作日内退还！';
            explain.find('.btn-ok').text('我知道啦~').off('click').click(function(){
                updateUser();
            });
        }
        else{
            _msg = r.msg;
            explain.find('.btn-ok').text('确定').off('click').click(function(){
                window.location.href = 'https://'+_root+'/m/tem,'+app.spinfocode+'.html';
            });
        }
        explain.find('.msg').html(_msg);
        checking.hide();
        service.hide();
        explain.show();
    }
};
checking.find('.btn-ok').off('click').click(function(e){
    app.doLogin(e, {
        phone: phone.val().trim(),
        checkcode: code,
        cmd: 'phonechecked',
        confirm:1,
        callback: function (plus) {
            data.spinfocode = app.spinfocode;
            data.phone = app.user.phone;
            dosetring_ajaxSettings.data.confirm = 1;
            if (dosetring_ajaxSettings.plus) $.extend(dosetring_ajaxSettings.plus, plus);
            else dosetring_ajaxSettings.plus = plus;
            $.ajax(dosetring_ajaxSettings);
        }
    })
});
take.click(function(e) {
    app.doSendCheckcode(e, {
        checking: {btn_code: take, phone: phone},
        phone: phone.val()
        //passive: e.isTrusted ? 0 : 1
    });
    app.isclick = true;
});

change.click(function(){
    phone.val('');
    code.val('');
    checking.find('.msg').html(app.pushinfo.login.pop.content.toHtml());
    checking.show();
    service.hide();
});

checking.on('click','input',function(){
    $(this).parent().addClass('p-cur').siblings().removeClass('p-cur');
}).on('blur','input',function(){
    $(this).parent().removeClass('p-cur');
})
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


if(getQueryString('ringid')) {
    ringid = getQueryString('ringid');
    $('.musics').show();
    $.ajax({
        url: "/proxy/v3/proxy.aspx",
        data: {
            cmd: 'get-ringinfo',
            ringid:ringid
        },
        dataType: 'json',
        cache: false,
        type: 'get',
        success: function(r){
            if(r.s == 1){
                var ringinfo ='<div class="left-area"><em></em><a href="javascript:void(0);" data-rid="'+r.data.ringid+'" data-sprid="'+r.data.springid+'" class="controlbtn btn-play">暂停/播放</a></div><div class="pinfo"><div class="fr set"><a href="javascript:void(0);" data-rid="'+r.data.ringid+'" data-flag="2001" data-sprid="'+r.data.springid+'" class="icon-font icon-color iconfont-ringSet btn-setring"></a><a href="javascript:void(0);" data-rid="'+r.data.ringid+'" data-rname="'+r.data.name+'" data-sprid="'+r.data.springid+'" class="icon-font icon-color iconfont-ringDown btn-download"></a> </div><div><a href="javascript:void(0);" class="btn-play"><p class="name">'+r.data.name+'</p><p class="lh">';
                if(r.data.isnew==1) {
                    ringinfo+='<i class="new">新</i>';
                }
                if(r.data.ishot==1) {
                    ringinfo+='<i class="icon-font iconfont-vip vip"></i>';
                }
                ringinfo+='<span>'+r.data.ringer+'</span></p></a></div></div>';
                $('.musics').html(ringinfo);
                $('.musics').find('.set').hide();
                $('.musics').find('.btn-play').click(app.doPlay);

                $('.pay-state').click(function(){
                    data.spinfocode = app.spinfocode;
                    data.phone = app.user.phone;
                    $.ajax(dosetring_ajaxSettings);
                })
            }
            else{
                alert('获取彩铃信息失败');
            }
        }
    });
}
else if($('#slid-layer').find('.controlbtn').data('rid')){
    $('.pay-state').click(function(){
        data.spinfocode = app.spinfocode;
        data.phone = app.user.phone;
        $.ajax(dosetring_ajaxSettings);
    })
}
else {
    //$('#slid-layer-1').find('.service-box').hide();
    $('#slid-layer-1').find('.confirm').html('是否确认领取服务？');
    $('.pay-state').click(function(){
        $.ajax({
            url: "/proxy/v3/proxy.aspx",
            data: {
                cmd: 'check-crbt-open',
                phone: app.user.phone,
                spinfocode: app.spinfocode
            },
            dataType: 'json',
            cache: false,
            type: 'get',
            beforeSend: function () {
                mbox.waiting('处理中,请稍候……');
            },
            success: function(r){
                _msg = '';
                mbox.close();
                if(r.s == 1){
                    app.user.orderidD = false;
                    $.extend(app.user, r.data);
                    app.user.change.forEach(function (func) {
                        func.call();
                    });
                    update_session({orderidD: false});
                    _msg = app.pushinfo.order.succ.content;
                    if (app.pushinfo.declare.message.content){
                        _msg += '<br/><a href="{1}" class="uline">{0}</a>'.format(app.pushinfo.declare.message.content, app.pushinfo.declare.message.link);
                    }
                    explain.find('.btn-ok').html('确定').off('click').click(function(){
                        window.location.href = 'https://'+_root+'/m/tem,'+app.spinfocode+'.html';
                    });
                }
                else{
                    _msg = '服务正在开通中……预计24小时内生效，如未生效，费用我们将在2个工作日内退还！';
                    explain.find('.btn-ok').text('我知道啦~').off('click').click(function(){
                        updateUser();
                    });
                }
                explain.find('.msg').html(_msg);
                checking.hide();
                service.hide();
                explain.show();
            }
        });
        app.log({name: 'paymentSuccess'});
    })
}
$('.opt-cancel').click(function(){
    //window.location.href = 'https://'+_root+'/m/tem,'+app.spinfocode+'.html';
    //mbox.close();
    app.log({name: 'paymentCancel'});
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
            if(r.s == 1){
                app.user.orderidD = false;
                $.extend(app.user, r.data);
                app.user.change.forEach(function (func) {
                    func.call();
                });
                update_session({orderidD: false});
            }
            window.location.href = 'https://'+_root+'/m/tem,'+app.spinfocode+'.html';
            mbox.close();
        }
    });
});
//更新用户信息
function updateUser(){
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
                explain.show().find('.msg').html('你已经开通会员，快去主站设置铃声吧！');
                checking.hide();
                service.hide();
                explain.find('.btn-ok').text('确定').off('click').click(function(){
                    window.location.href = 'https://'+_root+'/m/tem,'+app.spinfocode+'.html';
                });
            }
            else{
                explain.show().find('.msg').html('你还未开通会员');
                checking.hide();
                service.hide();
                explain.find('.btn-ok').text('确定').off('click').click(function(){
                    window.location.href = 'https://'+_root+'/m/tem,'+app.spinfocode+'.html';
                });
            }
        }
    });
}

