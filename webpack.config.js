const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

var env = process.env.WEBPACK_ENV || 'build'

var libraryName = 'DroneTracer'

var envMode, outputFile, outputPath, optimizations = {}
outputPath = path.resolve('build')

if (env === 'build') {
    envMode = 'production'
    outputFile = `${libraryName}.min.js`
    optimizations.minimizer = [new UglifyJsPlugin()]
}
else {
    envMode = 'development'
    outputFile = `${libraryName}.js`
}


module.exports = {
	entry: path.resolve('src', libraryName, 'main.js'),
    devtool: 'source-map',
    mode: envMode,

	output: {
		path: outputPath,
		library: libraryName,
		libraryTarget: 'umd',
        libraryExport: 'default',
		umdNamedDefine: true,
		globalObject: "typeof self !== 'undefined' ? self : this",
		filename: outputFile
	},

    optimization: optimizations,

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
}
