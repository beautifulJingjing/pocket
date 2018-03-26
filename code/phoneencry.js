/**
 * Created by LXP on 2016/3/9.
 * 手机号解密
 */
"use strict";

/**
 * 码表
 * 第一位 对应首字母
 * 第二、三位 效验码
 * 第四、五位 效验码位置
 * 对位交换规则
 */
var encryCodeList = [
    ["ABCDEFG", "13", "17", "3", "7", "1:4", "2:7", "3:9", "5:6", "8:10", "11:11", "1"],
    ["HIJKLMMO", "3", "23", "4", "6", "1:5", "2:8", "3:9", "7:6", "4:11", "10:10", "2"],
    ["PQRSTU", "11", "23", "2", "5", "1:10", "2:11", "3:9", "4:8", "5:6", "7:7", "3"],
    ["VWXYZ", "17", "19", "3", "5", "1:11", "2:10", "3:8", "4:9", "5:6", "7:7", "4"]];

function chang26To10(str) {
    var c = 0;
    for (var i = 0; i < str.length; i++) {
        var r = str.charAt(i);
        var a = str.charCodeAt(i) - 64;
        if (i != str.length - 1)
            c = c + a * Math.pow(26, (str.length - i - 1));
        else
            c = c + a;
    }
    return c.toString();
}

function chang10To26(n) {
    if (n < 0) return "";
    var str = "";
    var numMod = 0,
        numTemp = n,
        ch = 'A';
    do {
        numMod = parseInt(numTemp % 26);
        numTemp = parseInt(numTemp / 26);
        if (numMod == 0) {
            ch = 'Z';
            numTemp--;
        }
        else
            ch = String.fromCharCode('A'.charCodeAt(0) + numMod - 1);
        str = ch + str;
    }
    while (numTemp > 0);
    return str;
}

exports.encodePhone = function (encodePhone) {
    try {
        var s = encodePhone.match(/./g);//转换为char[]类型
        var k = null;
        for (var i = 0; i < encryCodeList.length; i++) {
            if (encryCodeList[i][0].indexOf(s[0]) > -1) {
                k = encryCodeList[i];
                break;
            }
        }
        //提取效验码
        var x1 = s[parseInt(k[3]) + 1];
        var x2 = s[parseInt(k[4]) + 2];
        //去除效验码
        s.splice(parseInt(k[3]) + 1, 1);
        s.splice(parseInt(k[4]) + 1, 1);
        s.splice(0, 1);
        encodePhone = s.join('');
        //转10进制
        encodePhone = chang26To10(encodePhone);
        encodePhone = encodePhone.substring(1);
        //反换位
        var p = encodePhone.match(/./g);
        var q = new Array(p.length);
        for (var i in k) {
            var c = k[i];
            if (c.indexOf(":") > 0) {
                var cc = c.split(':');
                q[parseInt(cc[1]) - 1] = p[parseInt(cc[0]) - 1];
                q[parseInt(cc[0]) - 1] = p[parseInt(cc[1]) - 1];
            }
        }
        encodePhone = q.join('');
        //计算效验码
        var _x1 = chang10To26(parseInt(encodePhone) % parseInt(k[1]));
        var _x2 = chang10To26(parseInt(encodePhone) % parseInt(k[2]));
        if (_x1 == x1 && _x2 == x2) {
            return encodePhone;
        }
    }
    catch (e) {
        console.error(e);
    }
    return "";
}
