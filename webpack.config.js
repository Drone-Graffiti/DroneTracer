const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

var env = process.env.WEBPACK_ENV || 'build'

var libraryName = 'DroneTracer'

var envMode, entry = [], outputFile, outputPath, optimizations = {}, babelplugins = []
var mainjs = path.resolve('src', libraryName, 'main.js')
outputPath = path.resolve('build')

if (env === 'build') {
    envMode = 'production'
    entry.push('@babel/polyfill', mainjs)
    outputFile = `${libraryName}.min.js`
    optimizations.minimizer = [new UglifyJsPlugin()]
}
else {
    envMode = 'development'
    entry.push(mainjs)
    // use generator for dev and test and not polyfill async
    //babelplugins.push('@babel/plugin-transform-async-to-generator')
    outputFile = `${libraryName}.js`
}

console.log('entry: ', entry)
console.log('output: ', outputFile)
console.log('babel plugins: ', babelplugins)


module.exports = {
	entry: entry, 
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
					presets: ['@babel/preset-env'],
                    plugins: babelplugins
				}
			}
		}]
	}

}
