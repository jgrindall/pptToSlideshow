
var _ = 				require("underscore");
var fs = 				require("fs-extra");
var path = 				require('path');
const {exec} = 			require('child_process');
const Promise = 		require("bluebird");
const AdmZip = 			require('adm-zip');
const _JSON = 			require("./JSON");
const _PAGE = 			require("./PAGE");
const _XML = 			require("./XML");
const rimraf = 			require("rimraf");
var Jimp =				require("jimp");
var zipFolder = 		require('zip-folder');
var extract = 			require('extract-zip');

var _cloneStr = function(str){
	return "" + str;
};

var _clone = function(jsonObj){
	return JSON.parse(JSON.stringify(jsonObj));
};

var _replaceStr = function(str, _find, _replace){
	return str.replace(new RegExp(_find, 'g'), _replace);
};

var _replace = function(jsonObj, _find, _replace){
	var str = JSON.stringify(jsonObj);
	str = _replaceStr(str, _find, _replace);
	return JSON.parse(str);
};

var _getNumbers = function(s){
	return parseInt(s.replace(/\D/g, ''));
};

var _getSize = function(url, callback){
	Jimp.read(url).then(function (img) {
		callback({w:img.bitmap.width, h:img.bitmap.height});
	});
};

var _createEmptyDir = function(p){
	rimraf.sync(p); 
	if (!fs.existsSync(p)){
		fs.mkdirSync(p);
	}
};

var _process = function(options){
	return new Promise(function(resolve){
		console.log("reasd", options, options.location);
		fs.readdir(options.location, function(err, items) {
			console.log("read", items);
			var numbers = _.map(items, _getNumbers).sort(function(a, b){return a - b});
			options.lastSlideNum = _.last(numbers);
			_getSize(options.location + "/" + items[0], function(size){
				var json = _clone(_JSON), page, i, xml;
				for(i = 1; i <= options.lastSlideNum; i++){
					page = _clone(_PAGE);
					page = _replace(page, "%%IMG%%", "./Slide" + i + ".PNG");
					page = _replace(page, "%%PAGE_WIDTH%%", size.w);
					page = _replace(page, "%%PAGE_HEIGHT%%", size.h);
					json[0].segments.push(page);
				}
				json = _replace(json, "%%PAGE_WIDTH%%", size.w);
				json = _replace(json, "%%PAGE_HEIGHT%%", size.h);
				json = _replace(json, "%%APP_NAME%%", options.name);
				json = _replace(json, "%%APP_FOLDER%%", options.folder);
				json = _replace(json, "%%PAGE_COUNT%%", items.length);
				xml = _cloneStr(_XML);
				xml = _replaceStr(xml, "%%APP_NAME%%", options.name);
				xml = _replaceStr(xml, "%%APP_TITLE%%", options.title);
				xml = _replaceStr(xml, "%%APP_FOLDER%%", options.folder);
				xml = _replaceStr(xml, "%%APP_LINK%%", options.filename);
				resolve(_.extend(options, {"json":json, "xml":xml}));
			});
		});
	});
};

var _toZip = function(options){
	return new Promise(function(resolve){
		_createEmptyDir(options.dest);
		fs.writeFileSync(options.dest + "/install.xml", options.xml);
		fs.writeFileSync(options.dest + "/" + options.filename, JSON.stringify(options.json));
		for(i = 1; i <= options.lastSlideNum; i++){
			fs.copySync(options.location + "/Slide" + i + ".PNG", options.dest + "/Slide" + i + ".PNG");
		}
		zipFolder(options.dest, "gen/" + options.name + '.zip', function(err) {
			resolve(options);
		});
	});
};

var _processZip = function(zipFile, appName){
	console.log("process", zipFile, appName);
	_createEmptyDir(process.cwd() + "/gen");
	var extractedFolder = process.cwd() + "/gen/extracted";
	_createEmptyDir(extractedFolder);
	return new Promise(function(resolve){
		extract(zipFile.path, {"dir": extractedFolder, onEntry:function(){}}, function (err) {
			return _process({
				"title":appName,
				"name":appName.replace(/\s+/g, "_"),
				"location":extractedFolder,
				"folder":"bloglinks",
				"filename":"en_gb.publish",
				"dest":"gen/files"
			}).then(function(options){
				_toZip(options)
					.then(function(options){
						resolve(options);
					});
			});
		});
	});
};

module.exports = {
	"process":_process,
	"toZip":_toZip,
	"processZip":_processZip
};

