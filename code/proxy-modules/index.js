"use strict";

exports = module.exports = {
    comkey: require('./comkey'),
    open_orderreport: require('./open_orderreport'),
    get_checkcode: require('./get_checkcode'),
    get_imgcode: require('./get_imgcode'),
    login: require('./login'),
    login_order: require('./login_order'),
    login_crbt: require('./login_crbt'),
    phonechecked: require('./phonechecked'),
    check_order: require('./check_order'),
    check_crbt: require('./check_crbt'),
    check_crbt_open: require('./check_crbt_open'),
    check_onfreecrbt: require('./check_onfreecrbt'),
    check_serve: require('./check_serve'),
    open_order: require('./open_order'),
    open_crbt: require('./open_crbt'),
    off_order: require('./off_order'),
    set_serve: require('./set_serve'),
    set_ring: require('./set_ring'),
    payed_set_ring: require('./payed_set_ring'),
    login_get_userinfo: require('./login_get_userinfo'),
    get_ringdownurl: require('./get_ringdownurl'),

    get_ringlist: require('./get_ringlist'),
    get_ringinfo: require('./get_ringinfo'),
    get_parts: require('./get_parts'),
    get_search: require('./get_search'),
    get_search_nocache: require('./get_search_nocache'),
    get_searchkey: require('./get_searchkey'),
    get_searchhot: require('./get_searchhot'),
    get_acts: require('./get_acts'),
    get_taglist: require('./get_taglist'),

    get_lottery: require('./get_lottery'),
    get_lottery_log: require('./get_lottery_log'),
    get_lottery_num: require('./get_lottery_num'),
    get_receive_num: require('./get_receive_num'),

    feedback: require('./feedback'),
    clear_cache: require('./clear_cache'),
    delete_user_ring:require('./delete_user_ring'),

    user_get_crbt_list: require('./user_get_crbt_list'),
    get_outordercode : require('./get_outordercode'),
    generate_order:require('./generate_order')

};
