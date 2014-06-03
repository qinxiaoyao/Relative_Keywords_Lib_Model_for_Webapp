var http = require('http');
var fs = require('fs');
var BufferHelper = require('bufferhelper');
var iconv = require('iconv-lite'); 
var _ = require('underscore');
var when = require('when');
var Read_File = "iphone5s.txt";
var Write_File = "iphone5s_l1.txt";

//console.log("===============================================");
//var firstloop = ["4g手机","4g资费高遭吐槽","4g网络","4g手机有哪些","4g套餐","4g资费","4g是什么意思","4g牌照"];
var initLoop = [];
var keywords = [];

function searchAll(keywords){
	var deferreds = [];
	for (var i = keywords.length - 1; i >= 0; i--) {
		deferreds.push(searchRelativeKeyword(keywords[i]));
	};
	return deferreds;
}

function searchRelativeKeyword(keyword){
	var deferred = when.defer();
	var baidu = "http://suggestion.baidu.com/su?wd="+keyword+"&json=1&p=3&sid=4684_5230_1467_5225_6504_4759_6018_6462_6428_6382_6313_6441_6450&cb=jQuery110209145664188035061_1399875026965&_=1399875026970&qq-pf-to=pcqq.group";
	http.get(baidu, function(res) {
		  var bufferHelper = new BufferHelper();
		  res.on('data', function (chunk) {
		    bufferHelper.concat(chunk);
		  });
		  res.on('end',function(){ 
		    var result = iconv.decode(bufferHelper.toBuffer(),'GBK');
		    deferred.resolve(eval(result));
		  });
	}).on('error', function(e) {
	  console.error(e);
	});
	return deferred.promise;
}

function jQuery110209145664188035061_1399875026965(data){
	//keywords = _.union(keywords, data.s);
	//console.log(data.s);
	return data.s;
}

function readAllKeyWords(){
	var deferred = when.defer();
	var rs = fs.createReadStream(Read_File);
	var bufferHelper = new BufferHelper();
	var data = '';
	rs.on("data", function (chunk){
	    bufferHelper.concat(chunk);
	});
	rs.on("end", function () {
	   // var result = iconv.decode(bufferHelper.toBuffer(),'GBK');
	    var result = bufferHelper.toBuffer().toString();
	    console.log(bufferHelper.toBuffer().toString());
	    initLoop = result.split(",");
		deferred.resolve(initLoop);
	});


	// fs.readFile(Read_File, function (err, data) {
	//   if (err) throw err;
	//   initLoop = (data.toString()).split(",");
	//   deferred.resolve(initLoop);
	// });
	return deferred.promise;
}

when.all(readAllKeyWords().then(searchAll)).then(function(data){
	for (var i = data.length - 1; i >= 0; i--) {
		//console.log(data[i]);
		keywords = _.union(keywords, data[i]);
		//console.log(keywords);
		//console.log("=========================");
	};
	//console.log(keywords);
	keywords = _.union(keywords, initLoop);
	 fs.writeFile(Write_File,keywords.toString(),function(err){
        if(err) throw err;
        console.log('一共 '+keywords.length+" 条记录 写入完毕！");
    });
});






