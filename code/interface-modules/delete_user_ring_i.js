/**
 * Created by tsg34 on 2016/7/11.
 */
var helper = require('../helper');
var trace = require('../trace');


exports = module.exports = function(option) {
    var data = option.data || {};
        data.service = 'del_crbt_setting';
    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            if (rec.data.res == 1) {
                if (option.success)
                    option.success(data);
                trace.interface({
                    req: option.req,
                    name: 'del_crbt_setting',
                    params: data
                });
            }
            else {
                var err = new Error(rec.data);
                err.code = rec.data.res;
                err.message = rec.data.resmsg;
                if (option.error)
                    option.error(err);
                trace.error({
                    req: option.req,
                    name: 'del_crbt_setting',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};