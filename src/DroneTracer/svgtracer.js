// load in Webpack Node and Browser
import '../libs/imagetracer.js'
import * as ImageTracer from '../libs/imagetracer.js'

var tracer = {}
if (ImageTracer.versionnumber === undefined)
    tracer = self.ImageTracer
else
    tracer = ImageTracer


export const base64ToImageData = function(base64) {
    return new Promise( async (resolve) => {
        var image = new Image()

        image.onload = function() {
            var canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height

            var context = canvas.getContext('2d')
            context.drawImage(image, 0, 0)

            var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            resolve(imageData)
        }

        image.src = base64
    })
}

// TEMP using imagetracer by jankovicsandras
export const trace = function(imageData) {
    return tracer.imagedataToSVG(imageData)
}



/*
 * Layer and edge node logic base on jankovicsandras imagetracerjs
 */

class LineTracer {

    // pull out color into layer | Color quantization
    static extractColorLayer(imageData, colorSearch = {r:0,g:0,b:0,a:255}, range = 20) {
        var colorLayer = []

		// Initialize colorLayer with -1
        // add border (1/side = +2)
		for(let y = 0; y < imageData.height+2; y++ ){
            colorLayer[y]=[]
            for(let x = 0; x < imageData.width+2 ; x++){
                colorLayer[y][x] = -1
            }
        }

        // loop through all pixels
        for(let y = 0; y < imageData.height; y++ ){
            for(let x = 0; x < imageData.width; x++ ){
                var index = (y*imageData.width+x)*4 // 4 values (RGBA)

                // Linear interpolation | Taxicab geometry
                var difference =
                    Math.abs(colorSearch.r-imageData.data[index]) +
                    Math.abs(colorSearch.g-imageData.data[index+1]) +
                    Math.abs(colorSearch.b-imageData.data[index+2]) +
                    Math.abs(colorSearch.a-imageData.data[index+3])

                // compare difference betweeen seach color and pixel index color
                if(difference < range) colorLayer[y+1][x+1] = this.colorIdentifier
            }
        }

        return colorLayer
    }


    // analyse the relationship of each pixel related with the neighbours
    static edgeAnalysis(colorLayer) {
		var nodeLayer = [],
            lh = colorLayer.length,
            lw = colorLayer[0].length

		// Initialize nodeLayer
		for(let y = 0; y < lh; y++) {
			nodeLayer[y] = []
			for(let x = 0; x < lw; x++) {
				nodeLayer[y][x]=0
			}
		}

		// Looping through all pixels and calculating edge node type
		for(let y = 1; y < lh; y++) {
			for(let x = 1; x < lw; x++) {
			    nodeLayer[y][x] =
					( colorLayer[y-1][x]  === this.colorIdentifier ? 1 : 0 ) +
					( colorLayer[y-1][x-1]=== this.colorIdentifier ? 2 : 0 ) +
					( colorLayer[y][x]    === this.colorIdentifier ? 4 : 0 ) +
					( colorLayer[y][x-1]  === this.colorIdentifier ? 8 : 0 )
			}
		}

		return nodeLayer
	}

    /*
     * Trace single lines following autotrace centerline approach,
     * combined with jankovicsandras imagetracerjs and contrast path finding
     */

	// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
	//  ░░  ░▓  ▓░  ▓▓  ░░  ░▓  ▓░  ▓▓  ░░  ░▓  ▓░  ▓▓  ░░  ░▓  ▓░  ▓▓
	//  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
	//  0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15

    static pathNodeScan(nodeLayer) {
        var paths = [],
            lh = nodeLayer.length,
            lw = nodeLayer[0].length,
			dir=0

		for(var y = 0; y < lh; y++) {
			for(var x = 0; x < lw; x++) {

                // find starting edge
				if( nodeLayer[y][x] == 4 ) {
					
					var px = x, py = y
					var dir = 1
					var pathfinished = false

                    var path = []

                    // Follow points from path. Path is finished when 2 ends has been found
					while(!pathfinished){
						
                        path.push({ x: px-1, y: py-1, t: nodeLayer[py][px] })

						// Next: look up the replacement, direction and coordinate
                        // changes = clear this cell, turn if required, walk forward
						var lookuprow = this.pathNode_lookup[ nodeLayer[py][px] ][ dir ]
						nodeLayer[py][px] = lookuprow[0]
                        dir = lookuprow[1]
                        px += lookuprow[2]
                        py += lookuprow[3]

						// when path is finished
                        /*
						 *if( (px-1 === path[0].x ) && ( py-1 === path[0].y ) ){
						 *    pathfinished = true
						 *    
						 *    // Discarding paths shorter than minimun
						 *    if( paths[pacnt].points.length < this.minimunPathLength ) path.pop()
						 *    
						 *}
                         */
                        pathfinished = true

                        if (pathfinished) {
                            paths.push(path)
                        }
						
					}
					
				} // end find starting node
				
			}
		}
		
		return paths    
    }

}

LineTracer.colorIdentifier = 1
LineTracer.minimunPathLength = 6
// TODO: change LookupTables to match new edge logic. 
LineTracer.pathNode_lookup = [
    [[-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1]],// node type 0 is invalid
    [[ 0, 1, 0,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 2,-1, 0]],
    [[-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 1, 0,-1], [ 0, 0, 1, 0]],
    [[ 0, 0, 1, 0], [-1,-1,-1,-1], [ 0, 2,-1, 0], [-1,-1,-1,-1]],

    [[-1,-1,-1,-1], [ 0, 0, 1, 0], [ 0, 3, 0, 1], [-1,-1,-1,-1]],
    [[13, 3, 0, 1], [13, 2,-1, 0], [ 7, 1, 0,-1], [ 7, 0, 1, 0]],
    [[-1,-1,-1,-1], [ 0, 1, 0,-1], [-1,-1,-1,-1], [ 0, 3, 0, 1]],
    [[ 0, 3, 0, 1], [ 0, 2,-1, 0], [-1,-1,-1,-1], [-1,-1,-1,-1]],

    [[ 0, 3, 0, 1], [ 0, 2,-1, 0], [-1,-1,-1,-1], [-1,-1,-1,-1]],
    [[-1,-1,-1,-1], [ 0, 1, 0,-1], [-1,-1,-1,-1], [ 0, 3, 0, 1]],
    [[11, 1, 0,-1], [14, 0, 1, 0], [14, 3, 0, 1], [11, 2,-1, 0]],
    [[-1,-1,-1,-1], [ 0, 0, 1, 0], [ 0, 3, 0, 1], [-1,-1,-1,-1]],

    [[ 0, 0, 1, 0], [-1,-1,-1,-1], [ 0, 2,-1, 0], [-1,-1,-1,-1]],
    [[-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 1, 0,-1], [ 0, 0, 1, 0]],
    [[ 0, 1, 0,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 2,-1, 0]],
    [[-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1]]// node type 15 is invalid
]

export {LineTracer}
