var express = 			require("express");
var formidable =	 	require("formidable");
var path = 				require('path');
var jimp = 				require('jimp');
var fs = 				require("fs");
var zipFolder = 		require("zip-folder");
var mkdirp = 			require("mkdirp");
var Promise = 			require("bluebird");
var extract = 			require('extract-zip');
var Converter = 		require("./Converter");

var app = 				express();
var port = 				Number(process.env.PORT || 5000);

var zipFile, appName;

app.configure(function(){
	app.use(express.static(__dirname + "/public"));
});

app.get('/download', function(req, res){
	var zipName = appName.replace(/\s+/g, "_");
	res.download(__dirname + "/gen/" + zipName + ".zip");
});

app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
	form.multiples = true;
	form.on('file', function(field, file) {
		zipFile = file;
	});
	form.on('field', function(name, val){
		appName = val;
	});
	form.on('error', function(err) {
		console.log('An error has occured: \n' + err);
	});
	form.on('end', function() {
		Converter.processZip(zipFile, appName).then(function(){
			res.status(200).end();
		});
	});
	form.parse(req);
});

app.get('/', function(req, res) {
	app.render(res, "public/src/index.html");
});

app.listen(port, function() {
  console.log("Listening on " + port);
});
