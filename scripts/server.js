var publicDir = process.argv[2]
var port = process.argv[3]

var static = require( 'node-static' ),
    http = require( 'http' );

var file = new static.Server( publicDir, {
    cache: 3600,
    gzip: true
} );

http.createServer( function ( request, response ) {
    request.addListener( 'end', function () {
        file.serve( request, response );
    } ).resume();
} ).listen( port );

console.log(`Server running. Visit http://localhost:${port}`)
