/**
 * Created by XUER on 2016-2-27.
 * 用户相关业务处理
 */
"use strict";
module.exports = {
    checkCode: require('./check_code'),
    login: require('./login'),

    openOrder: require('./open_order'),
    isOrder: require('./is_order'),
    unsubscriptOrder: require('./unsubscript_order'),

    openCrbt: require('./open_crbt'),
    getCrbtState: require('./get_crbt_state'),
    isCrbt: require('./is_crbt'),
    isCrbtFreeSupport: require('./is_crbt_freesupport'),
    isCrbtOpening: require('./is_crbt_opening'),

    orderRing: require('./order_ring'),
    setCrbt: require('./set_crbt'),
};
