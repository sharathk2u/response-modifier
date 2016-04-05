'use strict';
var http = require('http');
var zlib = require('zlib');
var modifiedAPI = function(data,req,res) {
	var builder = {
		error : {},
		unbxd: {},
		modifiedResult: {},
		init : function(data,req,res){
			var unbxdstr = data;
			builder.modifyRes(unbxdstr,req);
		},
		modifiedsearchMetaData:function(req){
			if(builder.unbxd.hasOwnProperty("searchMetaData")){
				//authKey =
				var params = {};
				var headers = {};
				var i;
				var param;
				var filterTemp;
				for(param in builder.unbxd.searchMetaData.queryParams){
					if(builder.unbxd.searchMetaData.queryParams.hasOwnProperty(param)){
						if(param == "page"){
							var page = builder.unbxd.searchMetaData.queryParams.hasOwnProperty("page") ? parseInt(builder.unbxd.searchMetaData.queryParams["page"]) + 1 + "": "1";
							params["page"] = (typeof(page) == "string") ? [page] : page;
						}else if( param == "q" ){
							var query = builder.unbxd.searchMetaData.queryParams.hasOwnProperty("q") ? builder.unbxd.searchMetaData.queryParams["q"] : "*";
							params["q"] = (typeof(query) == "string") ? [query] : query;
						}else if( param == "rows" ){
							var rows = builder.unbxd.searchMetaData.queryParams.hasOwnProperty("rows") ? builder.unbxd.searchMetaData.queryParams["rows"] : "10" ;
							params["rows"] = (typeof(rows) == "string") ? [rows] : rows;
						}else if(param == "filter"){
							var filterName;
							if(typeof(builder.unbxd.searchMetaData.queryParams[param]) == "object"){
								var fil;
								for(fil in builder.unbxd.searchMetaData.queryParams[param]){
									filterName = builder.unbxd.searchMetaData.queryParams[param][fil].split(":")[0] + "Filter";
									builder.modifiedResult[filterName] = builder.unbxd.searchMetaData.queryParams[param][fil];
								}
							}else if(typeof(builder.unbxd.searchMetaData.queryParams[param]) == "string") {
								filterName = builder.unbxd.searchMetaData.queryParams[param].split(":")[0] + "Filter";
								builder.modifiedResult[filterName] = builder.unbxd.searchMetaData.queryParams[param];
							}
						}else{
							params[param] = builder.unbxd.searchMetaData.queryParams[param]
						}
					}

				}
				params["authKey"] = ["d35e7f77da5329b2e8eeffbeac555695"];
				params["customer_name"] = ["shopclues"]
				var mainHeaders = req.headers;

				for( i in mainHeaders){
					if( mainHeaders.hasOwnProperty(i) && i != "cookie"){
						headers[i] = mainHeaders[i];
					}
				}
				var mainCookie = mainHeaders.hasOwnProperty('cookie') ? mainHeaders['cookie'] : "";
				var cookie = mainCookie.split(";");
				var request_params = {"params":params,"headers":headers,"inCookies": cookie,"post":"false"};
				builder.modifiedResult["_request_params"] = request_params;
			}
		},
		modifyStats : function(){
			if(builder.unbxd.hasOwnProperty("stats")){
				var stats_fields = {};
				var fields;
				for(fields in builder.unbxd["stats"]){
					stats_fields[fields] = builder.unbxd["stats"][fields];
				}
				builder.modifiedResult["stats"] = {"stats_fields" : stats_fields};
			}
		},
		modifyResponse : function(){
			if(builder.unbxd.hasOwnProperty("response")){
				var response = {};
				var numFound = builder.unbxd["response"]["numberOfProducts"];
				var docs = builder.unbxd["response"]["products"];
				response = {"numFound":numFound,"docs":docs};
				builder.modifiedResult["response"] = response;
			}
		},
		modifyFacets: function(){
			var facet;
			var facet_fields = {};
			var facet_ranges = {};
			var facets = {};
			var generateRanges = function(facetName,values){
				var modifiedRanges = [];
				var i;
				var temp;
				for(i=0;i<=(values["counts"].length-2);i=i+2){
					temp = {}
					temp["start"] = (i == 0) ? "*" : values["counts"][i]
					temp["end"] = (typeof(values["counts"][i+2])!="undefined") ? values["counts"][i+2] : values["counts"][i];
					temp["numDocs"] = values["counts"][i+1]
					temp["filter"] = escape(facetName + ":" + "[" + temp["start"] + " TO " + temp["end"] + "]");
					modifiedRanges.push(temp);
				}
				/*
				for(i = parseInt(values.start); i<= parseInt(values.end) ; i=i+parseInt(values.gap)){
					temp = {}
					temp["start"] = (i == 0) ? "*" : (parseFloat(i)+"");
					temp["end"] = parseFloat((i+parseInt(values.gap))) + "";
					console.log((parseFloat(i)+1)+".0",values["counts"])
					temp["numDocs"] = values["counts"][values["counts"].indexOf(parseFloat(i)+"")+1];
					temp["filter"] = escape(facetName + ":" + "[" + temp["start"] + " TO " + temp["end"] + "]");
					modifiedRanges.push(temp);
				}*/
				return modifiedRanges;
			}
			var generateFacets = function(facetName,values){
				var modifiedFacets = [];
				var i;
				var temp;
				var filterTemp;
				for(i=0;i<=(values.length-2);i=i+2){
					temp = {}
					temp["name"] = values[i]
					temp["numDocs"] = values[i+1]
					filterTemp = (typeof(temp["name"]) == "string" ) ? '"'+temp["name"]+'"' : temp["name"] 
					temp["filter"] = escape(facetName + ':' + filterTemp);
					modifiedFacets.push(temp);
				}
				return modifiedFacets;
			}
			if(builder.unbxd.hasOwnProperty("facets")){
				for(facet in builder.unbxd["facets"] ){
					if(builder.unbxd["facets"].hasOwnProperty(facet)){
						if(builder.unbxd["facets"][facet]["type"] == "facet_fields"){
							facet_fields[facet.split("_fq")[0]] = generateFacets(facet,builder.unbxd["facets"][facet]["values"]);
						}else{
							facet_ranges[facet.split("_fq")[0]] = generateRanges(facet,builder.unbxd["facets"][facet]["values"]);
						}
					}
				}
			}

			facets = {"facet_fields" : facet_fields , "facet_ranges": facet_ranges };
			builder.modifiedResult["facets"] = facets;
		},
		modifyRes : function(unbxdstr,req){
			try {
				unbxdstr = unbxdstr.replace(/^jQuery.*?\(|\)\n$/g, '');
				builder.unbxd = JSON.parse(unbxdstr);
				if(builder.unbxd.hasOwnProperty("response")){
					builder.modifiedResult["response Type"] = 'SEARCH_RESPONSE';
					builder.modifiedResult["q"] = builder.unbxd.searchMetaData.queryParams.hasOwnProperty("q") ? builder.unbxd.searchMetaData.queryParams["q"] : "*";
					builder.modifiedsearchMetaData(req);
					builder.modifyStats();
					builder.modifyResponse();
					builder.modifyFacets();
				}
			}catch (err) {
				console.log("inside catch modifyRes")
				builder.error["message"] = err.toString();
				builder.error["stack"] = err.stack
			}
		}
	}
	builder.init(data,req,res);
	if( builder.error.hasOwnProperty("message")){
		return JSON.stringify(builder.error,null,4);
	}else{
		// console.log(JSON.stringify(builder.modifiedResult,null,4))
		return JSON.stringify(builder.modifiedResult,null,4);
	}
};
module.exports = modifiedAPI;