var modifiedReq = function(req){
	var i,j;
	var url;
	var finalsearchReqObj = {};
	var filters = [];
	var tempObj = {};
	var searchReqObj = {}, searchReq = {};
	var params;
	var path;
	url = req.url;
	params = typeof(url)!= "undefined" ? url.split("?")[1] : "";
	path = typeof(url)!= "undefined" ? url.split("?")[0] : "";
	if(typeof(params) != "undefined" ){
		if( params[0] == "&"){
			params = params.substring(1);
		}
		searchReq = decodeURI(params).split("&");
		for(i in searchReq){
			if(searchReq.hasOwnProperty(i)){
				if (searchReq[i].split("=").length > 1){
					if( searchReq[i].split("=")[0] in searchReqObj ){
						searchReqObj[searchReq[i].split("=")[0]].push(searchReq[i].split("=")[1])
					}else{
						searchReqObj[searchReq[i].split("=")[0]] = [searchReq[i].split("=")[1]]
					}
				}
			}
		}
		for( i in searchReqObj){
			if( searchReqObj.hasOwnProperty(i) && i.indexOf("_fq") > -1 ){
				var temp = {}
				for( j in searchReqObj[i]){
					if(searchReqObj[i].hasOwnProperty(j)){
						temp[searchReqObj[i][j].replace(/^\"/,"").replace(/\"$/,"")] = i
					}
				}
				tempObj[i] = temp
			}else{
				finalsearchReqObj[i] = searchReqObj[i]
			}
		}
		url = Object.keys(finalsearchReqObj).map(function(k) {
		    return encodeURIComponent(k) + '=' + encodeURIComponent(finalsearchReqObj[k])
		}).join('&')
		for (var x in tempObj) {
			if (tempObj.hasOwnProperty(x)) {
				var a = [];
				for (var y in tempObj[x]) {
					if (tempObj[x].hasOwnProperty(y)) {
						a.push((x + ':"' + encodeURIComponent(y.replace(/\"/g, '\\"')) + '"').replace(/\"{2,}/g, '"'))
					}
				}
				if (a.length > 0) url += "&filter=" +  a.join(" OR ");
			}
		}
		req.url = path +"?"+ url
	}
}
module.exports = modifiedReq;