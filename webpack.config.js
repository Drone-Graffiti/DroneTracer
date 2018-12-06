const path = require('path');

var libraryName = 'DroneTracer';

module.exports = {
	entry: path.resolve('src','main.js'),

	output: {
		path: path.resolve('dist'),
		library: libraryName,
		libraryTarget: 'umd',
        libraryExport: 'default',
		umdNamedDefine: true,
		globalObject: "typeof self !== 'undefined' ? self : this",
		filename: libraryName+'.js'
	},

	module: {
		rules: [{
			enforce: 'pre',
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'eslint-loader',
		}, {
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env']
				}
			}
		}]
	}
};
