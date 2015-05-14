var extend = require('node.extend');
var yaml = require('js-yaml');
var fs = require('fs');
var expressReverse = require('express-reverse');
var path = require('path');

module.exports = function(app, options) {

	options = extend(true, {
		routingFile: __dirname+'/../../app/config/routes.yml',
		controllerPath: __dirname+'/../../app/controllers',
		helperName: 'url'
	}, options || {});
	
	expressReverse(app, {helperName: options.helperName});

	initRoutes(app, options);
};

function initRoutes(app, options) {

	// Load all controllers
	//TODO: 
	//-search subfolders

	var controllers = {};
	fs.readdirSync(options.controllerPath).forEach(function(file) {
		var name = file.substr(0, file.indexOf('.'));
		controllers[name] = require(options.controllerPath +'/'+ file);
	});


	var parseYML = function(file, prefix) {
		
		prefix = prefix || '';
		
		var routesYaml = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
		
		for (var key in routesYaml) {
			
			var obj = routesYaml[key];

			if (obj.resource) {
				parseYML(path.dirname(file) + '/' + obj.resource, obj.prefix);
				continue;
			}

			var split = obj.controller.split(':'),
				bundle = split[0],
				controller = split[1] + 'Controller';
		 
			obj.methods.forEach(function(method) {
				var c = controllers[bundle]();
				app[method.toLowerCase()](key, prefix + obj.pattern, c[controller] );
			});
		}
	};
	
	//Load YAML
	parseYML(options.routingFile);

}
