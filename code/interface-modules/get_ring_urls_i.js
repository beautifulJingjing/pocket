/**
 * Created by shengaozhou on 2016/2/24.
 *  获取铃音文件地址列表
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     ringid：铃音id;
 *     source：铃音来源(缺省=1)：1-栏目列表，2-个人彩铃列表（此类型下只有wav文件），3-作品列表，4-无意义，5-个人DIY列表;
 *     type：文件类型(缺省=1)：1-mp3，2-aif，3-m4r，5-wav;
 *     downtype：下载文件类型，缺省与type相同;
 *     stype：获取地址类型(缺省=0)：0-请求参数ringid的播放地址和计费地址，1-请求附加9天歌曲的计费地址;
 *     rphone：下发计费链接使用的号码，缺省为空时，使用预制号码表;
 *     only：1-只下发播放地址，缺省为空
 *   },
 *   success(JSON): 成功完成时触发地址列表,
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');

exports = module.exports = function(option) {
    var data = option.data || {};
    data.service = 'get_fileurllist';

    if (!data.source) data.source = 1;
    if (!data.type) data.type = 1;

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.code == 1) {
                if (option.success)
                    option.success(rec.data.list);
                trace.interface({
                    req: option.req,
                    name: 'get_fileurllist',
                    params: data
                });
            }
            else {
                var err = new Error(rec.msg);
                err.code = rec.code;

                if (option.error) option.error(err);
                else console.error(err);
                trace.error({
                    req: option.req,
                    name: 'get_fileurllist',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};