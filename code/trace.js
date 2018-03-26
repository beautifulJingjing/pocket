/**
 * Created by LXP on 2016/2/24.
 * 日志
 */
"use strict";

var fs = require('fs');
var url = require('url');
var path = require('path');
var querystring = require('querystring');
var util = require('util');
var http = require('http');

require('date-utils');

//日志对象
var traceData = function(option) {
	var req = option.req;
	var current = req.current;
	var query = extend(extend({}, req.query), req.body);
	this.date = new Date().toFormat('YYYY/MM/DD');
	this.time = new Date().toFormat('HH24:MI:SS');
	this.spinfocode = current.spinfocode();
	this.tracename = '';
	this.user = current.user() || {};
	this.eventname = query.name || '';
	this.eventparams = query.params || '';
	this.explain = query.msg || '';
	/**
	 * 网络类型
	 * 返回值 QQ返回值   类型
	 * 0    unknown UNKNOW
	 * 1    ethernet ETHERNET
	 * 2    wifi WIFI
	 * 3    2g CELL_2G
	 * 4    3g CELL_3G
	 * 5    4g CELL_4G（中国现在也会出现这个值，是hspa+）
	 * ?    none NONE
	 */
	this.networktype = query.network || '';
	this.url = url.parse(req.originalUrl).pathname + '?' + querystring.stringify(query);
	this.referer = req.headers['referer'] || query.referer || '';
	this.remark = '';
	this.format = function () {
		this.eventparams = this.eventparams.replace(/\r\n/g, ' ');
		this.explain = this.explain.replace(/\r\n/g, ' ');
		if(this.remark)
			this.remark = this.remark.replace(/\r\n/g, ' ');
		return util.format("%s %s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s",
			this.date, this.time, this.spinfocode, this.tracename, req.sessionID,
			this.user.id || '', this.user.phone || '', this.user.weixinid || '',
			this.eventname, this.eventparams, this.explain,
			current.comkey() || '', this.networktype, current.comkeyStatus() || '',
			this.url, this.referer, current.ip(), this.remark);
	};
};
//日志写文件
var add = function (log) {
	var response = log.format();
	try {
		var file = path.normalize(__dirname + '/..') + '/log';
		fs.exists(file, function (exists) {
			if (!exists)
				fs.mkdirSync(file);

			file += '/' + log.date.replace(/\//g, '-') + '.log';
			fs.appendFile(file, response + '\r\n', function (err) {
				if(err)
					console.log(err);
			});
		});

		//var post = http.request({
		//	hostname: '60.191.59.46',
		//	port: 22384,
		//	path: '/l/addLog.htm',
		//	//hostname: process.env.NODE_ENV === 'development' ? '115.29.228.74' : '10.161.134.16',//内网IP：10.161.134.16，外网IP：115.29.228.74
		//	//port: 8080,
		//	//path: '/l/addlog.htm',
		//	method: 'POST',
		//	headers: {
		//		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		//		'Content-Length': encodeURIComponent(response).length + 5
		//	}
		//}, function (res) {
		//	res.setEncoding('utf8');
		//	if (res.statusCode != 200) console.log(response);
		//});
		//post.write('info=' + encodeURIComponent(response));
	}
	catch (e){
		console.log(response);
	}
};
//日志方法
var trace = {
	//PV访问
	pv:function(option){
		var req = option.req;
		var log = new traceData(option);
		log.tracename = 'pv';
		log.remark = req.headers['user-agent'];
		add(log);
	},
	//访问跟踪=Visit
	//option={}
	visit:function(option) {
		var req = option.req;
		var current = req.current;
		if (current.visit())
			return;

		current.visit(true);
		var log = new traceData(option);
		log.tracename = 'Visit';
		log.remark = req.headers['user-agent'];
		add(log);
	},
	//透传跟踪=Unikey
	//option={phone: null}
	comkey:function(option) {
		var log = new traceData(option);
		log.tracename = 'Unikey';
		if (option.phone)
			log.user = {phone: option.phone};
		add(log);
	},
	//动作日志=Event
	//option={user: 用户信息, name: 事件名, params: 事件参数}
	event:function(option) {
		var log = new traceData(option);
		log.tracename = 'Event';
		if (option.user)
			log.user = option.user;
		if (option.name)
			log.eventname = option.name;
		if (option.params) {
			log.eventparams = option.params;
			if (typeof log.eventparams == "object")
				log.eventparams = querystring.stringify(log.eventparams);
		}
		add(log);
	},
	//接口日志=Interface
	//option={user: 用户信息, name: 接口名, params: 接口参数}
	interface:function(option){
		var log = new traceData(option);
		log.tracename = 'Interface';
		if (option.user)
			log.user = option.user;
		if (option.name)
			log.eventname = option.name;
		if (option.params) {
			log.eventparams = option.params;
			if (typeof log.eventparams == "object")
				log.eventparams = querystring.stringify(log.eventparams);
		}
		add(log);
	},
	//错误日志=Error
	//option={user: 用户信息, name: 接口名, params: 接口参数, msg: 错误信息}
	error:function(option) {
		var log = new traceData(option);
		log.tracename = 'Error';
		if (option.user)
			log.user = option.user;
		if (option.name)
			log.eventname = option.name;
		if (option.params) {
			log.eventparams = option.params;
			if (typeof log.eventparams == "object")
				log.eventparams = querystring.stringify(log.eventparams);
		}
		if(option.msg) {
			log.explain = option.msg;
			if (typeof log.explain == "object")
				log.explain = JSON.stringify(log.explain);
		}
		add(log);
	},
	//其它日志=Other
	//option={user: 用户信息, name: 事件名, params: 事件参数, msg: 附加信息}
	other:function(options){
		var log = new traceData(options);
		log.tracename = 'Other';
		if (options.user)
			log.user = options.user;
		if (options.name)
			log.eventname = options.name;
		if (options.params) {
			log.eventparams = options.params;
			if (typeof log.eventparams == "object")
				log.eventparams = querystring.stringify(log.eventparams);
		}
		if(options.msg) {
			log.explain = options.msg;
			if (typeof log.explain == "object")
				log.explain = JSON.stringify(log.explain);
		}
		add(log);
	}
};

module.exports = trace;