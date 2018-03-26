var sre='37ef259ccf3e42149f976350079f7f5b';
//未验证号码前做的登录接口
function _temp_mob_loadin(){
    app.log({name: '_temp_mob_loadin',type:'Interface',params: {phone:app.user.phone}});
    var data ={
        youCallbackName :"_temp_call_load",
        channelCode:channelCode,
        loginType :"3",
        callBackUrl:'',
        miguToken:"",
        key:sre,
        msisdn: _temp_user.phone
    };
    loginType(data);
}
function _temp_call_load(result){
    if(result.resCode&&result.resCode=='000000'){
        app.log({name: '_temp_call_load',type:'Interface',params: {phone:app.user.phone},msg:JSON.stringify(result)});
        _temp_user.token=result.token;
        if(_temp_user.touchuanupdate ==1){
            app.user.token=result.token;
            update_session({token:result.token});
        }
    }else{
        app.log({name: '_temp_call_load',type:'error',params: {phone:app.user.phone},msg:JSON.stringify(result)});
    }
}
//登录接口
function mob_loadin(phone){
    app.log({name: 'mob_loadin',type:'Interface',params: {phone:phone || app.user.phone}});
    var data ={
        youCallbackName :"call_load",
        channelCode:channelCode,
        loginType :"3",
        callBackUrl:'',
        miguToken:"",
        key:sre,
        msisdn: phone || app.user.phone
    };
    loginType(data);
}
function call_load(result){
    if(result.resCode&&result.resCode=='000000'){
        app.log({name: 'call_load',type:'Interface',params: {phone:app.user.phone},msg:JSON.stringify(result)});
        update_session({token:result.token});
        app.user.token=result.token;
    }else if(result.resCode=='999009'){
        app.log({name: 'call_load',type:'error',params: {phone:app.user.phone},msg:JSON.stringify(result)});
        cancel_token();
    }else{
        app.log({name: 'call_load',type:'error',params: {phone:app.user.phone},msg:JSON.stringify(result)});
        mbox.alertMsg({explain: result.resCode+result.resMsg,confirmEvent:err_close});
        stateInit();
    }
}
