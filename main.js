
var _ = 				require("underscore");
var Converter = 		require("./Converter");
var path = 				require('path');
var fs = 				require("fs-extra");
const {exec} = 			require('child_process');
const Promise = 		require("bluebird");
const AdmZip = 			require('adm-zip');
const _JSON = 			require("./JSON");
const _PAGE = 			require("./PAGE");
const _XML = 			require("./XML");
const rimraf = 			require("rimraf");
var Jimp =				require("jimp");
var zipFolder = 		require('zip-folder');

Converter.process({
	"title":"Anglo Saxon - Crime and Punishment",
	"name":"Anglo_saxons_crimeslides",
	"location":"anglo",
	"folder":"bloglinks",
	"filename":"en_gb.publish",
	"dest":"gen/"
}).then(Converter.toZip);





