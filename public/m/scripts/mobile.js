var _temp_user={token:'',touchuanupdate:0,phone:'',ringstate:0,iscrbtend:0,cbrtpolicy:{},ispolicyend:0,orderstate:4,isorderend:0};
var is_openserve=false;
var is_setring=false;//是否有需要设置的铃音，存放铃音ID
var is_second=false;//是否经过二次确认
var crbtstate=false;
var orderlogin=false;
var isUserCenter=false;
var isSharePage=false;
var channelCode='002100B';
var serviceId='600927020000006638';
var ringhtml='';
var is_mobile_edition=false;//是否移动专版
var that;

function init_temp_user(){
    _temp_user={token:'',touchuanupdate:0,phone:'',ringstate:0,iscrbtend:0,cbrtpolicy:{},ispolicyend:0,orderstate:4,isorderend:0};
}
function err_close(){
    if(isSharePage){
        window.location.reload();
    }else{
        mbox.closeslid();
        mbox.close();
    }
}
function excUrl(url,param){
    if(url.indexOf('?')==-1){
        url+='?_';
    }
    return url+='&'+param;
}
//开通彩铃回调
function open_crbt(r) {
    var msg=r.resMsg+r.resCode;
    var params='userphone='+app.user.phone+'&';
    if(r.resCode=='000000'||r.resCode=='H000001'||r.resCode=='H000002'||r.resCode=='H301034'||r.resCode=='H1'||r.resCode=='H2') {
        mbox.waiting('正在查询【中国移动-音乐包服务】,请稍候……');
        app.log({name:'open_crbt',type:'Interface',params:params,msg:msg});
        update_session({ringstate:1});
        app.user.ringstate=1;
        app.log({name:'queryMonthRingYN',type:'Interface',params:params});
        queryMonthRingYN({
            youCallbackName: "isorder",
            channelCode: channelCode,
            token: app.user.token,
            serviceId: serviceId
        })
    }else if(r.resCode=='044001'){
        app.log({name:'open_crbt',type:'error',params:params,msg:msg});
        app.log({name:'open_crbt_cancelorder',type:'error',params:params,msg:msg});
        mbox.del({
            title: '温馨提示',
            ok_btn:'开通彩铃服务',
            explain: '您已取消开通【中国移动-彩铃服务】<br/>开通【彩铃服务+音乐包服务】即可享受VIP会员特权：<br/>·0元畅享200万首高清彩铃/来电铃（原价2元/首）<br/>·免费抽奖，话费/流量等奖品免费拿',
            cancelEvent: function(){
                mbox.closeslid();
                mbox.close();
                if(isUserCenter){
                    load_list();
                }else if(isSharePage){
                    window.location.reload();
                }
            },
            confirmEvent: function(){
                mbox.close();
                mbox.waiting('即将为您开通【中国移动-彩铃服务】,请稍等片刻……');
                if(_temp_user.ispolicyend==1) {
                    app.log({name:'open_crbt_again',type:'Interface',params:params,msg:msg});
                    openRingTone({
                        youCallbackName :"open_crbt",
                        channelCode :channelCode,
                        token:app.user.token,
                        cpId:_temp_user.cbrtpolicy.cpId,
                        bizCode:_temp_user.cbrtpolicy.bizCode,
                        cpparam:_temp_user.cbrtpolicy.cpparam,
                        salePrice:_temp_user.cbrtpolicy.salePrice,
                        name:"openRingTone"
                    });
                }else{
                    app.log({name:'open_crbt_policy_again',type:'Interface',params:params,msg:msg});
                    queryStrategyBYB({
                        youCallbackName: "crbt_policy",
                        channelCode: channelCode,
                        token: app.user.token,
                        serviceId: "",
                        count: "1",
                        type: "4"
                    })
                }
            }
        })
    }else if(r.resCode=='999009'){
        app.log({name:'open_crbt',type:'error',params:params,msg:msg});
        cancel_token();
    }else{
        if(r.resCode=='H4999'||r.resCode=='G1100'||r.resCode=='H4004'||r.resCode=='H3000')msg = '订购失败，暂时无法提供服务';
        mbox.alertMsg({explain: msg,confirmEvent:err_close});
        app.log({name:'open_crbt',type:'error',params:params,msg:msg});
        stateInit();
    }
}
//提前查询彩铃功能回调
function _temp_iscrbt(r) {
    app.log({name:'_temp_iscrbt_call',type:'Interface',params:{phone:_temp_user.phone},msg:JSON.stringify(r)});
    if(r.resCode=='000000'){
        if(r.status==1) {
           _temp_user.ringstate=1;
        }else{
            app.log({name:'_temp_crbt_policy',type:'Interface',params:{phone:_temp_user.phone}});
            queryStrategyBYB({
                youCallbackName :"_temp_crbt_policy",
                channelCode :channelCode,
                token:_temp_user.token,
                serviceId:"",
                count:"1",
                type:"4"
            })
        }
        _temp_user.iscrbtend=1;
        if(_temp_user.touchuanupdate==1){
            app.user.ringstate=r.status;
            update_session({ringstate:r.status});
        }
    }
}
//提前获取彩铃开通策略回调
function _temp_crbt_policy(r) {
    app.log({name:'_temp_crbt_policy_call',type:'Interface',params:{phone:_temp_user.phone},msg:JSON.stringify(r)});
    if(r.resCode=='000000') {
        _temp_user.cbrtpolicy = {
            cpId: r.bizInfoMon.cpId,
            bizCode: r.bizInfoMon.bizCode,
            cpparam: r.bizInfoMon.cpparam,
            salePrice: r.bizInfoMon.salePrice
        };
        _temp_user.ispolicyend=1;
    }
}
//彩铃功能查询回调
function iscrbt(r) {
    if(r.resCode=='000000'){
        app.log({name:'iscrbt',type:'Interface',params:{phone:app.user.phone},msg:JSON.stringify(r)});
        if(r.status==0){
            mbox.waiting('即将为您开通【中国移动-彩铃服务】,请稍等片刻……');
            if(_temp_user.ispolicyend==1){
                app.log({name:'before_open_crbt',type:'Interface',params:{phone:app.user.phone}});
                openRingTone({
                    youCallbackName :"open_crbt",
                    channelCode :channelCode,
                    token:app.user.token,
                    cpId:_temp_user.cbrtpolicy.cpId,
                    bizCode:_temp_user.cbrtpolicy.bizCode,
                    cpparam:_temp_user.cbrtpolicy.cpparam,
                    salePrice:_temp_user.cbrtpolicy.salePrice,
                    name:"openRingTone"
                });
            }else{
                app.log({name:'iscrbt-queryStrategyBYB',type:'Interface',params:{phone:app.user.phone}});
                queryStrategyBYB({
                    youCallbackName :"crbt_policy",
                    channelCode :channelCode,
                    token:app.user.token,
                    serviceId:"",
                    count:"1",
                    type:"4"
                })
            }
        }else if(r.status==1) {
            mbox.waiting('正在查询【中国移动-音乐包服务】,请稍候……');
            if(r.resMsg!='预查询')update_session({ringstate:1});
            app.user.ringstate=1;
            crbtstate=1;
            app.log({name:'iscrbt-queryMonthRingYN',type:'Interface',params:{phone:app.user.phone}});
            queryMonthRingYN({
                youCallbackName :"isorder",
                channelCode :channelCode,
                token:app.user.token,
                serviceId:serviceId
            })
        }
    }else if(r.resCode=='999009'){
        app.log({name:'iscrbt',type:'error',params:{phone:app.user.phone},msg:JSON.stringify(r)});
        cancel_token();
    }else if(r.resCode=='100002'&&r.resMsg=='[PE]获取省DID为返回为空'){
        app.log({name:'iscrbt',type:'error',params:{phone:app.user.phone},msg:JSON.stringify(r)});
        alert('仅支持移动用户登录使用');
        cancel_token();
    }else {
        app.log({name:'iscrbt',type:'error',params:{phone:app.user.phone},msg:JSON.stringify(r)});
        mbox.alertMsg({explain: r.resCode+r.resMsg,confirmEvent:err_close});
        stateInit();
    }
}
//彩铃开通策略回调
function crbt_policy(r) {
    if(r.resCode=='000000') {
        app.log({name:'crbt_policy_call',type:'Interface',params:{phone:app.user.phone},msg:r.resMsg+ r.resCode});
        app.log({name:'crbt_policy-openRingTone',type:'Interface',params:{phone:app.user.phone}});
        openRingTone({
            youCallbackName :"open_crbt",
            channelCode :channelCode,
            token:app.user.token,
            cpId:r.bizInfoMon.cpId,
            bizCode:r.bizInfoMon.bizCode,
            cpparam:r.bizInfoMon.cpparam,
            salePrice:r.bizInfoMon.salePrice,
            name:"openRingTone"
        });
    }else if(r.resCode=='999009'){
        app.log({name:'crbt_policy',type:'error',params:{phone:app.user.phone},msg:r.resMsg+ r.resCode});
        cancel_token();
    }else {
        app.log({name:'crbt_policy',type:'error',params:{phone:app.user.phone},msg:r.resMsg+ r.resCode});
        mbox.alertMsg({explain: r.resCode+r.resMsg,confirmEvent:err_close});
        stateInit();
    }
}
//提前查询是否包月回调
function _temp_isorder(r) {
    if(r.resCode=='000000') {
        app.log({name:'_temp_isorder',type:'Interface',params:{phone:app.user.phone},msg:JSON.stringify(r)});
        if (r.status == 0) {

        } else if (r.status == 1) {
            _temp_user.orderstate=2;
        }
        _temp_user.isorderend=1;
        if(_temp_user.touchuanupdate==1){
            app.user.orderstate=_temp_user.orderstate;
            update_session({orderstate:_temp_user.orderstate});
        }
    }
}
//查询是否包月回调
function isorder(r) {
    if(r.resCode=='000000') {
        app.log({name:'isorder',type:'Interface',params:{phone:app.user.phone},msg:JSON.stringify(r)});
        if (r.status == 0) {
            if(app.user.smsconfirm==1){
                mbox.alertMsg({explain: '【中国移动-音乐包服务】需回复短信确认，才可生效。请根据短信提示进行操作。',
                    confirmEvent:err_close});
            }else{
                mbox.waiting('即将为您开通【中国移动-音乐包服务】,请稍等片刻……');
                app.log({name:'isorder-queryStrategyBYB',type:'Interface',params:{phone:app.user.phone}});
                queryStrategyBYB({
                    youCallbackName: "order_policy",
                    channelCode: channelCode,
                    token: app.user.token,
                    serviceId: serviceId,
                    count: "1",
                    type: ""
                })
            }
        } else if (r.status == 1) {
            if(crbtstate==1){
                app.log({name: 'regularUserPocket', params: app.user.phone})
            }
            orderreport(1);//订购用户通知
            update_session({orderstate:2});
            app.user.orderstate=2;
            if (is_setring) {
                order_ring_pre();
            }else{
                mbox.close();
                if(isUserCenter){
                    $('.mobile-library-list').html('');
                    if(app.user.orderstate==2){
                        //alert(app.user.phone+'opencorder');
                        member.find('h3').html(app.user.phone).next().html('会员<i class="icon-queen"></i>');
                        member.find('img').attr('src', 'images/img-user-vip.png');
                        $('.btn-upgrade').hide();
                        form.parent().hide().next().show();
                    }
                    load_list();
                }else {
                    var opt = {
                        title: '会员登录',
                        icon: 'succ',
                        explain: '登录成功'
                };
                    mbox.explain(opt);
                }
            }
        }
    }else if(r.resCode=='999009'){
        app.log({name:'isorder',type:'error',params:{phone:app.user.phone},msg:JSON.stringify(r)});
        cancel_token();
    }else {
        app.log({name:'isorder',type:'error',params:{phone:app.user.phone},msg:JSON.stringify(r)});
        mbox.alertMsg({explain: r.resCode+r.resMsg,confirmEvent:err_close});
        stateInit();
    }
}
//包月包策略回调
function order_policy(r) {
    if(r.resCode=='000000'){
        app.log({name:'order_policy_call',type:'Interface',params:{phone:app.user.phone},msg:r.resMsg+ r.resCode});
        app.log({name:'order_policy-orderMonthRing',type:'Interface',params:{phone:app.user.phone}});
        orderMonthRing({
            youCallbackName :"open_order",
            channelCode :channelCode,
            token:app.user.token,
            serviceId:serviceId,
            cpId:r.bizInfoMon.cpId,
            bizCode:r.bizInfoMon.bizCode,
            cpparam:r.bizInfoMon.cpparam,
            salePrice:r.bizInfoMon.salePrice,
            name:"orderMonthRing"
        })
    }else if(r.resCode=='999009'){
        app.log({name:'order_policy',type:'error',params:{phone:app.user.phone,token:app.user.token},msg:r.resMsg+ r.resCode});
        cancel_token();
    }else {
        app.log({name:'order_policy',type:'error',params:{phone:app.user.phone},msg:r.resMsg+ r.resCode});
        mbox.alertMsg({explain: r.resCode+r.resMsg,confirmEvent:err_close});
        stateInit();
    }
}
//订购彩铃包月回调
function open_order(r) {
    if(r.resCode=='000000'||r.resCode=='H2000'){
        orderreport(1);//订购用户通知
        app.log({name: 'open_ringset_order',type:'Interface',params:'userphone='+app.user.phone+'&',msg:JSON.stringify(r)});
        update_session({orderstate:2,smsconfirm:0});
        orderlogin = true;
        app.user.orderstate=2;
        app.user.smsconfirm=0;
        if(is_setring){
            order_ring_pre();
        }else {
            mbox.close();
            if(isUserCenter){
                $('.mobile-library-list').html('');
                if(app.user.orderstate==2){
                    //alert(app.user.phone+'opencorder');
                    member.find('h3').html(app.user.phone).next().html('会员<i class="icon-queen"></i>');
                    member.find('img').attr('src', 'images/img-user-vip.png');
                    $('.btn-upgrade').hide();
                    form.parent().hide().next().show();
                }
                load_list();
            }else{
                var opt = {
                    title: app.pushinfo.order.succ.title,
                    icon: 'succ',
                    explain: app.pushinfo.order.succ.content
                };
                if (app.pushinfo.declare.message.content)
                    opt.explain += '<br/><a href="{1}" class="uline">{0}</a>'.format(app.pushinfo.declare.message.content, app.pushinfo.declare.message.link);
                mbox.explain(opt);
            }
        }
    }else if(r.resCode=='044001'){
        app.log({name:'open_ringset_order',type:'error',params:'userphone='+app.user.phone+'&',msg:r.resMsg+ r.resCode});
        mbox.del({
            title: '温馨提示',
            ok_btn:'升级VIP会员',
            explain: '您已取消开通【中国移动-音乐包服务】，开通音乐包服务即可享受VIP会员特权：<br/>·0元畅享200万首高清彩铃/来电铃（原价2元/首）<br/>·免费抽奖，话费/流量等奖品免费拿',
            cancelEvent: function(){
                mbox.closeslid();
                mbox.close();
                if(isUserCenter){
                    load_list();
                }else if(isSharePage){
                    window.location.reload();
                }
            },
            confirmEvent: function(){
                app.log({name: 'open_ringset_order_again',type:'Interface',params:'userphone='+app.user.phone+'&'});
                mbox.close();
                mbox.waiting('即将为您开通【中国移动-音乐包服务】,请稍等片刻……');
                queryStrategyBYB({
                    youCallbackName: "order_policy",
                    channelCode: channelCode,
                    token: app.user.token,
                    serviceId: serviceId,
                    count: "1",
                    type: ""
                })
            }
        })

    }else if(r.resCode=='999009'){
        app.log({name:'open_ringset_order',type:'error',params:'userphone='+app.user.phone+'&',msg:r.resMsg+ r.resCode});
        cancel_token();
    }else if(r.resCode=='H1000'){
        //...需要短信二次确认
        update_session({smsconfirm:1});
        app.user.smsconfirm=1;
        app.log({name:'open_ringset_order',type:'error',params:'userphone='+app.user.phone,msg:r.resMsg+ r.resCode});
        mbox.alertMsg({explain: '为保护用户权益，避免误操作。【中国移动-音乐包服务】需回复短信确认，才可生效。请根据短信提示进行操作。回复开通后即可0元畅享百万铃声。',confirmEvent:err_close});
    }else{
        var msg=r.resCode+r.resMsg;
        if(r.resCode=='H4999'||r.resCode=='G1100'||r.resCode=='H4004'||r.resCode=='H3000')msg = '订购失败，暂时无法提供服务';
        mbox.alertMsg({explain: msg,confirmEvent:err_close});
        app.log({name: 'open_ringset_order',type:'error',params: 'userphone='+app.user.phone+'&',msg:msg});
        stateInit();
    }
}
//彩铃订购二次确认
function order_ring_pre(){
    mbox.close();
    app.log({name: 'order_ring_pre',type:'Interface',params: 'userphone='+app.user.phone});
    mbox.service({
        title: app.pushinfo.crbt.pop.title,
        music: ringhtml,
        phone: app.user.phone,
        confirmmsg: '是否确认设置该首彩铃？\r\n资费是：<span class="bz-span">2.0元<em></em></span>（<i>VIP专享0元/首</i>）',
        explain: '',
        confirmEvent: function (e) {
            order_ring();
        }
    });
}
//彩铃订购
function order_ring(){
    mbox.waiting('彩铃设置中,请稍等片刻……');
    app.log({name: 'order_ring',type:'Interface',params: 'userphone='+app.user.phone+'&ringid='+is_setring});
    queryPolicy({
        youCallbackName :"call_queryPolicy",
        channelCode :channelCode,
        token:app.user.token,
        contentId:is_setring
    });
}
//查询彩铃订购策略回调
function call_queryPolicy(r){
    if(r.resCode=='000000'){
        app.log({name: 'call_queryPolicy',type:'Interface',params: {phone:app.user.phone},msg:r.resMsg+ r.resCode});
        var cpId = r.cpId;
        var productId = r.productId;
        var memberType = r.memberType;
        var bizCode='';
        var bizType='';
        var salePrice='';
        var hold2='';
        var i;
        for(i in r.bizInfos){
            if(r.bizInfos[i].bizType=='70'){
                bizCode=r.bizInfos[i].bizCode;
                bizType=r.bizInfos[i].bizType;
                salePrice=r.bizInfos[i].salePrice;
                hold2=r.bizInfos[i].hold2;
                break;
            }
        }
        app.log({name: 'call_queryPolicy-orderRingTone',type:'Interface',params: {phone:app.user.phone}});
        orderRingTone({
            youCallbackName :"call_orderRingTone",
            channelCode :channelCode,
            token:app.user.token,
            cpId:cpId,
            bizCode:bizCode,
            contentId: is_setring,
            bizType: bizType,
            productId:productId,
            memberType: memberType,
            salePrice: salePrice,
            hold2:hold2,
            name:"orderRingTone"
        })
    }else if(r.resCode=='999009'){
        app.log({name: 'call_queryPolicy',type:'error',params: {phone:app.user.phone},msg:r.resMsg+ r.resCode});

        cancel_token();
    }else {
        app.log({name: 'call_queryPolicy',type:'error',params: {phone:app.user.phone},msg:r.resMsg+ r.resCode});
        mbox.alertMsg({explain: r.resCode+r.resMsg,confirmEvent:err_close});
        stateInit();
    }
}
//彩铃订购回调
function call_orderRingTone(r){
    if(r.resCode=='000000'){
        app.log({name: 'call_orderRingTone',type:'Interface',params: {phone:app.user.phone},msg:JSON.stringify(r)});
        set_ring();
    }else if(r.resCode=='999009'){
        app.log({name: 'call_orderRingTone',type:'error',params: {phone:app.user.phone},msg:r.resMsg+ r.resCode});
        cancel_token();
    }else {
        app.log({name: 'call_orderRingTone',type:'error',params: {phone:app.user.phone},msg:r.resMsg+ r.resCode});
        mbox.alertMsg({explain: r.resCode+r.resMsg,confirmEvent:err_close});
        stateInit();
    }
}
//彩铃设置默认
function set_ring() {
    app.log({name: 'set_ring',type:'Interface',params: {phone:app.user.phone}});
    setRing({
        youCallbackName :"dosetRing",
        channelCode :channelCode,
        token:app.user.token,
        contentId:is_setring
    })
}
//彩铃设置默认回调
function dosetRing(r) {
    if(r.resCode=='000000'){
        app.log({name: 'set_user_crbt',type:'Interface',params: {phone:app.user.phone},msg:r.resMsg+ r.resCode});
        mbox.close();
        if(isUserCenter){
            ringhtml = '';
        }
        var opt = {
            music: ringhtml,
            icon: 'succ',
            explain: app.pushinfo.ringset.singleset.succ.content
        };
        if(orderlogin){
            opt.explain = app.pushinfo.order.succ.content + '\r\n' + opt.explain;
        }
        if (app.pushinfo.declare.message.content)
            opt.explain += '<br/><a href="{1}" class="uline">{0}</a>'.format(app.pushinfo.declare.message.content, app.pushinfo.declare.message.link);
        mbox.explain(opt);
        is_setring=false;
        is_openserve=false;
        orderlogin=false;
    }else if(r.resCode=='999009'){
        app.log({name: 'set_user_crbt',type:'error',params: {phone:app.user.phone},msg:r.resMsg+ r.resCode});
        cancel_token();
    }else {
        app.log({name: 'set_user_crbt',type:'error',params: {phone:app.user.phone},msg:r.resMsg+ r.resCode});
        mbox.alertMsg({explain: r.resCode+r.resMsg,confirmEvent:err_close});
        stateInit()
    }
}
//删除个人铃音回调
function delRing_callback(result){
    if(result.resCode == '000000'){
        app.log({name: 'delRing_callback',type:'Interface',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        mbox.close();
        console.log('删除成功');
        $(that).parent().parent().parent().remove();
        $(".mobile-library-list").find("em").each(function(i){
            $(this).text(i+1+'.');
        });
        mplayer.doStop();
    }
    else if(result.resCode=='999009'){
        app.log({name: 'delRing_callback',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        cancel_token();
    }
    else {
        app.log({name: 'delRing_callback',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        stateInit();
        if($(that).data('address').indexOf('12530') > 0){mbox.alertMsg({explain: '系统赠送铃声，不支持删除哦'})}
        else mbox.alertMsg({explain: result.resCode+result.resMsg})
    }
}

//退订会员（退订彩铃包月）回调
function cancelMonthRing_callback(result){
    if(result.resCode == '000000'){
        app_js.logout(app.user.phone);
        app.log({name: 'unsubscribe_ringset_order',type:'Interface',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        console.log('会员退订成功');
        orderreport(0);//用户退订通知
        update_session({orderstate:4});
        app.user.orderstate=4;
        mbox.alertMsg({
            explain: result.resMsg,confirmEvent:err_close
        })
    }
    else if(result.resCode=='999009'){
        app.log({name: 'unsubscribe_ringset_order',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        cancel_token();
    }
    else{
        app.log({name: 'unsubscribe_ringset_order',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        mbox.alertMsg({explain: result.resCode+result.resMsg,confirmEvent:err_close});
        stateInit();
    }
}
//获取登录用户信息
function mob_getuserinfo(token){
    var data ={
        youCallbackName :"call_getuserinfo",
        channelCode:channelCode,
        token :token
    };
    //var str = JSON.stringify(data);
    //prompt("查询登录用户信息", str);
    app.log({name: 'mob_getuserinfo',type:'Interface',params: {token:token}});
    getUserInfo(data);
}
function call_getuserinfo(result){
    if(result.resCode&&result.resCode=='000000'){
        app.log({name: 'call_getuserinfo',type:'Interface',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        if(result.msisdn){
            update_session({phone:result.msisdn});
            app.user.phone=result.msisdn;
        }
        //var str = JSON.stringify(result);
        //prompt("查询登录用户信息", str);
    }else{
        app.log({name: 'call_getuserinfo',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        mbox.alertMsg({explain: result.resCode+result.resMsg,confirmEvent:err_close});
        stateInit();
    }
}

//查询个人铃音库接口
function getUserRingBase_list(){
    app.log({name: 'getUserRingBase_list',type:'Interface',params: {phone:app.user.phone}});
    getUserRingBase({
        youCallbackName: "getUserRingBase_callback",
        channelCode: channelCode,
        token: app.user.token
    });
}
//查询个人铃音库回调
function getUserRingBase_callback(result){
    if(result.resCode == '000000'){
        app.log({name: 'getUserRingBase_callback',type:'Interface',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        mbox.close();
        if(result.toneInfos.length==0){$('#ringList-no-ring').show();}
        else{
            $('#ringList-no-ring').hide();
            var template = $('#crbt-template-canlisten').html();
            for (var i in result.toneInfos) {
                var d = result.toneInfos[i];
                var li = $(template.format(parseInt(i) + 1, d.toneName,d.tonePreListenAddress,d.singerName,d.contentId));
                li.find('.btn-del').click(function(){
                    that = this;
                    mbox.del({
                        title: '温馨提示',
                        explain: '是否删除彩铃？',
                        confirmEvent: function(){
                            mbox.waiting('删除中,请稍候……');
                            app.log({name: 'delRing',type:'Interface',params: {phone:app.user.phone,ringid:$(that).data('contentid')}});
                            delRing({
                                youCallbackName: "delRing_callback",
                                channelCode: channelCode,
                                token: app.user.token,
                                contentId: $(that).data('contentid')
                            });
                        }
                    });
                });

                li.find('.btn-play').click(app.doPlay);
                li.find('.btn-setDefault').click(function() {
                    that = this;
                    app.log({name: 'setRing',type:'Interface',params: {phone:app.user.phone,ringid:$(that).data('contentid')}});
                    setRing({
                        youCallbackName: "setDefaultRing_callback",
                        channelCode: channelCode,
                        token: app.user.token,
                        contentId: $(that).data('contentid')
                    });
                });
                $('.mobile-library-list').append(li);
            }
        }
    }else{
        app.log({name: 'getUserRingBase_callback',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        stateInit();
        var msg=result.resCode+result.resMsg;
        if(result.resCode=='300002')msg = '未查询到个人铃音';
        mbox.alertMsg({explain: msg,confirmEvent:err_close});
    }
}
//根据手机号查询用户默认铃音
function qryDefRing(){
    app.log({name: 'queryUserDefaultRing',type:'Interface',params: {phone:app.user.phone}});
    queryUserDefaultRing({
        youCallbackName: "queryUserDefaultRing_callback",
        channelCode: channelCode,
        token: app.user.token,
        msisdn:app.user.phone
    });
}
//根据手机号查询用户默认铃音回调
function queryUserDefaultRing_callback(result){
    if(result.resCode == '000000'){
        app.log({name: 'queryUserDefaultRing_callback',type:'Interface',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        $('.mobileDefault-library-list').html('');
        if(result.toneInfos.length == 0){$('#ringList-no-ringDefault').show();}
        else{
            $('#ringList-no-ringDefault').hide();
            var template = $('#crbt-template-mobileDefault').html();
            for (var i in result.toneInfos) {
                var d = result.toneInfos[i];
                var li = $(template.format(parseInt(i) + 1, d.toneName,d.tonePreListenAddress,d.singerName,d.contentId));
                li.find('.btn-play').click(app.doPlay);
                $('.mobileDefault-library-list').append(li);
            }
        }
    }
    else if(result.resCode=='999009'){
        app.log({name: 'queryUserDefaultRing_callback',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        cancel_token();
    }
    else {
        app.log({name: 'queryUserDefaultRing_callback',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        stateInit();
        var msg=result.resCode+result.resMsg;
        if(result.resCode=='300002')msg = '未查询到个人铃音';
         mbox.alertMsg({explain: msg,confirmEvent:err_close})
    }
}
//个人中心设默认回调
function setDefaultRing_callback(result){
    if(result.resCode == '000000'){
        app.log({name: 'setDefaultRing_callback',type:'Interface',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        mbox.alertMsg({
            explain: '设置默认铃音成功',
            confirmEvent: function(){
                mbox.close();
                qryDefRing();
            }
        })
    }
    else{
        app.log({name: 'setDefaultRing_callback',type:'error',params: {phone:app.user.phone},msg:result.resMsg+ result.resCode});
        if($(that).data('address').indexOf('12530') > 0){mbox.alertMsg({explain: '系统赠送铃声，不支持设置默认铃声哦'})}
        else mbox.alertMsg({explain: result.resCode+result.resMsg})
    }
}
//清除token以及session信息
var cancel_token = function(){
    $.ajax({
        url: "/proxy/v3/comkey.aspx",
        data: {
            cancel: true
        },
        dataType: 'json',
        cache: false,
        type: 'get',
        success: function (r) {
            app.user = {
                token:'',
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
                            return "月底到期";
                    }
                    return "非会员";
                },
                change: []//用户信息变更执行
            };
            alert('登录异常，请重新登录');
            window.location.reload();
        }
    });
};
//更新session信息
var update_session = function(data){
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
//通知订购用户信息
var orderreport = function(type){
    var data = {
        cmd: 'open_orderreport',
        spinfocode: app.spinfocode,
        orderid: serviceId,
        type:type
    };
    $.ajax({
        url: "/proxy/v3/proxy.aspx",
        data: data,
        dataType: 'json',
        cache: false,
        type: 'post',
        success: function (r) {
            //alert(r.toString());
        }
    });
};
//状态初始化
function stateInit(){
    is_setring=false;
    is_openserve=false;
    orderlogin=false;
    isUserCenter=false;
}

