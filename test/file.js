// File API Polyfill
const FileAPI = require('file-api'),
    File = FileAPI.File,
    FileList = FileAPI.FileList

// make it global so the Library can use it
global.FileReader = FileAPI.FileReader


module.exports.createFile = function(url) {
    return new File(`${__dirname}/files/${url}`)
}
