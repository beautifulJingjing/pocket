"use strict";

exports = module.exports = {
    phonechecked: require('./phonechecked_i'),
    get_phonebyimsi: require('./get_phonebyimsi_i'),
    get_ringlist: require('./get_ringlist_i'),
    get_parts: require('./get_parts_i'),
    get_ring_info: require('./get_ring_info'),
    get_search: require('./get_search_i'),
    get_search_nocache: require('./get_search_nocache_i'),
    get_searchkey: require('./get_searchkey_i'),
    get_searchhot: require('./get_searchhot_i'),
    get_acts: require('./get_acts_i'),
    get_taglist: require('./get_taglist_i'),  //获取推荐标签列表

    get_lottery: require('./get_lottery_i'),
    get_lottery_log: require('./get_lottery_log_i'),
    get_lottery_num: require('./get_lottery_num_i'),
    get_receive_num: require('./get_receive_num_i'),

    get_checkcode: require('./get_checkcode_i'),
    get_imgcode: require('./get_imgcode_i'),
    get_user: require('./get_user_i'),
    user_binding: require('./bind_userphone_i'),
    get_orderstate: require('./get_orderstate_i'),
    open_order: require('./open_order_i'),
    open_orderreport:require('./open_orderreport_i'),
    unsubscript_order: require('./unsubscript_order_i'),
    get_crbtstate: require('./get_crbtstate_i'),
    open_crbt:  require('./open_crbt_i'),
    order_ring: require('./order_ring_i'),
    set_crbt: require('./set_crbt_i'),
    send_business_sms: require('./send_business_sms_i'),
    get_ring_urls: require('./get_ring_urls_i'),
    feedback: require('./feedback_i'),
    delete_user_ring:require('./delete_user_ring_i'),

    user_get_crbt_list: require('./user_get_crbt_list_i'),
    generate_order: require('./generate_order_i'),
    query_order: require('./query_order_i'),
    confirm_order: require('./confirm_order_i'),
};
