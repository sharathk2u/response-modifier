'use strict';
var modifiedReq = function(req){
	var url;
	var path;
	var params;
	var param = {};
	var temp;
	var paramTemp = [];
	var i;
	url = req.url;
	params = typeof(url)!= "undefined" ? url.split("?")[1] : "";
	path = typeof(url)!= "undefined" ? url.split("?")[0] : "";
	console.log(params);
	temp = typeof(params)!= "undefined" ? params.split("&") : paramTemp;
	for(i in temp){
		param[temp[i].split("=")[0]] = temp[i].split("=")[1]
	}
	if(param.hasOwnProperty("page")){
		var tem;
		tem = param["page"]
		param["page"] = parseInt(tem) - 1 + ""
	}
	for(i in param){
		if(param.hasOwnProperty(i)){
			paramTemp.push(i+"="+param[i])
		}
	}
	var appnd = (paramTemp.length >= 1) ? "?" : "";
	req.url = path + appnd + paramTemp.join("&");

}
module.exports = modifiedReq;