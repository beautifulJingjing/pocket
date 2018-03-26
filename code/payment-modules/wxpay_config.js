"use strict"
//var APPV_KEY_8 = "-----BEGIN RSA PRIVATE KEY-----" + "\r\n" +
//    "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAIY6vdhhSGjC3SDf"+ "\r\n" +
//    "IryoZ2TrrnCyLwVqfDIYm+DXBmLlL086ryhuga1fhdTPnloKCYOJmvMoOXhlrWi+"+ "\r\n" +
//    "c7vO+Wl3A2DFK4l4vPUJZLfrxmLFz94d+PtsYQS44GutjO6xO6SfgZNWUyR9tb5B"+ "\r\n" +
//    "y7xaX99tCuaVUzaYKnRBNkmwwYu7AgMBAAECgYBlJlrtddHE8CMGpF9e32Ca0mdv"+ "\r\n" +
//    "kTaR1D6m2ZiNhDvRxncyMzzPMQcTiQom5hWkMDAfKVDUr5kvOx/D8NDx0/RqBf0X"+ "\r\n" +
//    "yEty+9FxBPy2It/DIjEU/q8p7VbmV50DCI1i/envkvpR6Ggz8MS9pciNs8WMkhlM"+ "\r\n" +
//    "ZWfqP5mC9oCgjxvIwQJBANAkIG0Tzdhox/T6NtFQK3E3x7ZJCROUJPCTbJ/+C8Kf"+ "\r\n" +
//    "WW5rh3Cg9hvvRkjeMd/lxMCMKBCl0FDKJPd/3lPd2bECQQClF+48+c5lGSFCQFWq"+ "\r\n" +
//    "nqiyfV1kJrYe3Qx+dS/f+I1tFj8+bezycn40h178BCzpaTwcNsLrtMByIdqn1upX"+ "\r\n" +
//    "0WsrAkEAqd1h7UMlUkEpNv/hLu+7lHmObnCqjKTxhLj8BJKDLIF5rgjpjvx9/gxH"+ "\r\n" +
//    "kv5rO6u759w6cmOwX86pXqenXVCH8QJAMaBD6Ohedl1bdgLIvYT7yMuOazCHxjdE"+ "\r\n" +
//    "Li8juPuJ56SsViPM+gQYk8mtb6wBpBgSDZkYdqnav3QVuiYMQ2GcCQJAYZowq6Hz"+ "\r\n" +
//    "xU0UnfDtG6LWTyyvOHfJmuOcxoNvLewbANkT6NuVAnvkcbI6JjH/1GGY6EdCPY51"+ "\r\n" +
//    "dIg5uNXuUpPvWw==" + "\r\n" +
//    "-----END RSA PRIVATE KEY-----";
var APPV_KEY = "-----BEGIN RSA PRIVATE KEY-----" + "\r\n" +
    "MIICXAIBAAKBgQCGOr3YYUhowt0g3yK8qGdk665wsi8FanwyGJvg1wZi5S9POq8o"+ "\r\n" +
    "boGtX4XUz55aCgmDiZrzKDl4Za1ovnO7zvlpdwNgxSuJeLz1CWS368Zixc/eHfj7"+ "\r\n" +
    "bGEEuOBrrYzusTukn4GTVlMkfbW+Qcu8Wl/fbQrmlVM2mCp0QTZJsMGLuwIDAQAB"+ "\r\n" +
    "AoGAZSZa7XXRxPAjBqRfXt9gmtJnb5E2kdQ+ptmYjYQ70cZ3MjM8zzEHE4kKJuYV"+ "\r\n" +
    "pDAwHylQ1K+ZLzsfw/DQ8dP0agX9F8hLcvvRcQT8tiLfwyIxFP6vKe1W5ledAwiN"+ "\r\n" +
    "Yv3p75L6UehoM/DEvaXIjbPFjJIZTGVn6j+ZgvaAoI8byMECQQDQJCBtE83YaMf0"+ "\r\n" +
    "+jbRUCtxN8e2SQkTlCTwk2yf/gvCn1lua4dwoPYb70ZI3jHf5cTAjCgQpdBQyiT3"+ "\r\n" +
    "f95T3dmxAkEApRfuPPnOZRkhQkBVqp6osn1dZCa2Ht0MfnUv3/iNbRY/Pm3s8nJ+"+ "\r\n" +
    "NIde/AQs6Wk8HDbC67TAciHap9bqV9FrKwJBAKndYe1DJVJBKTb/4S7vu5R5jm5w"+ "\r\n" +
    "qoyk8YS4/ASSgyyBea4I6Y78ff4MR5L+azuru+fcOnJjsF/OqV6np11Qh/ECQDGg"+ "\r\n" +
    "Q+joXnZdW3YCyL2E+8jLjmswh8Y3RC4vI7j7ieekrFYjzPoEGJPJrW+sAaQYEg2Z"+ "\r\n" +
    "GHap2r90FbomDENhnAkCQGGaMKuh88VNFJ3w7Rui1k8srzh3yZrjnMaDby3sGwDZ"+ "\r\n" +
    "E+jblQJ75HGyOiYx/9RhmOhHQj2OdXSIObjV7lKT71s="+ "\r\n" +
    "-----END RSA PRIVATE KEY-----";
//var APPV_KEY = "-----BEGIN RSA PRIVATE KEY-----" + "\r\n" +  //demo
//    "MIICXQIBAAKBgQDYwEbzhPIc6GwJLH5eXElx8bUeMhfQZoKG54dH5j7y0r+HCU6h"+ "\r\n" +
//    "c0RSvtcWLdrnXABCyaRbj33xTY9aLrKgPKoEJNkhLMRHnEjdnq+eNzmfk9Y4thh/"+ "\r\n" +
//    "GqUCWq/8Mpdgx9SOsBGoDZLOgulIACSa2CTcvTc7VrTzuJKZGunWqSaatwIDAQAB"+ "\r\n" +
//    "AoGAdwN0sefwzQCtuYfNx2AjD8apLXBR9SMkTpC4jjkVnV0svyfUHgBdppWVIl+B"+ "\r\n" +
//    "UAILPqDbd07d124/5UO43xUQQH15VVArKQoNhfuPKkE5/oI3UF2uwPjkVdxcVUTI"+ "\r\n" +
//    "UcG6CkqKazbAKDcWT1NW3cBri477E25aJNnlAQAX4qoHf4kCQQDxwCB77WRmeu6S"+ "\r\n" +
//    "OmdmylpAg9KSqoAlI9wH9iPP9Wg13Ii345Ueln2BXR77QaGy6KzRL6+H0F5xQGOx"+ "\r\n" +
//    "zpSjFOcbAkEA5YbsfYeB2G2dtn2GUX1EHVWcQyaF9U2Yg2nOs8O5MpspxTz3KLMQ"+ "\r\n" +
//    "I18GjcuuXDmMS2VxHsemExypZ6YeiD3IlQJBAIrN8pjVRAlnWiXRrN8jHlDen4Ag"+ "\r\n" +
//    "r3UjsslLdWKJGG2ck09qN4uZgrRNQGWpWGt+FwQA6jsD08YY32UPJN7COLMCQQCb"+ "\r\n" +
//    "qwZ5nI3T24Q7YKbYXbz0qDtyz43K8PWfKwOlp/jS+ak6vD5kvA0V8DzhrmJy6hTc"+ "\r\n" +
//    "jdBKr91S2P2L7n6GqGCBAkBoUNUu95FPB+t3B8iHOihQTrXO3XsFPdC1o/n0SDWv"+ "\r\n" +
//    "QqUtdbFXTI0f9sPKLK4OrHjgoJzZjrxAnaxSdGuKMfBn"+ "\r\n" +
//    "-----END RSA PRIVATE KEY-----";
var PLATP_KEY = "-----BEGIN PUBLIC KEY-----" + "\r\n" +
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKg/2eSPwJ+55cFHHigtSKUXf+"+ "\r\n" +
    "jGtHWcsYnBTi4eZbe9/+q4m6r2vtGClESncMq4LB5ddecdiKbLBLJ3Ko5ztq6zv0"+ "\r\n" +
    "RVMLqCZ4jUX1/Rzz+dF2tpHxdmlCwGxu3PjWLbXBBrD/BKS7KwX7IbAPgMF5qFWz"+ "\r\n" +
    "yxzQbV84h4luFIrZvQIDAQAB"+ "\r\n" +
    "-----END PUBLIC KEY-----";
var config = {
    payurl:'"http://ipay.iapppay.com:9999/payapi/order"'
    // ,partner:'5712000016' //合作身份者id，以2088开头的16位纯数字
    // ,key:'4dc432c5b29722ba63dcf98ba005fbe5'//安全检验码，以数字和字母组成的32位字符
    ,partner:'101580024305' //合作身份者id，以2088开头的16位纯数字
    ,key:'1f1801c2d87f9c7ec459c5cb6923011c'//安全检验码，以数字和字母组成的32位字符
    ,seller_email:'zhangwen@zumainfo.com' //卖家支付宝帐户 必填
    ,host:global.host
	,cacert:'cacert.pem'//ca证书路径地址，用于curl中ssl校验
	,transport:'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
	,input_charset:'utf-8'//字符编码格式 目前支持 gbk 或 utf-8
    ,APPV_KEY:APPV_KEY
    ,PLATP_KEY:PLATP_KEY
};
var getkey = function(){
    return config.key;
};
var Wxpay = require('./wxpay/wxpay_wft').Wxpay;

exports.wxpay = new Wxpay(config);
exports.getkey = getkey;