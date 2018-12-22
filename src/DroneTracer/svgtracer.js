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

    // Node scan direction
    //  0   1   2   3
    //  >   ^   <   v
    static pathNodeScan(nodeLayer) {
        var paths = [],
            lh = nodeLayer.length,
            lw = nodeLayer[0].length

        for(var y = 0; y < lh; y++) {
            for(var x = 0; x < lw; x++) {

                // find starting edge
                if( nodeLayer[y][x] == 4 ) {
                    var path = []
                    path.push({ x: x, y: y, t: nodeLayer[y][x] })

                    // seach path following nodes and contrast, dir = 1
                    var right_path = this.findCenterline(x, y, nodeLayer, 1)

                    // if can not continue, search from the starting pixel in the
                    // opposite direction and concatenate the two outlines
                    // reset starting edge node
                    nodeLayer[y][x] = 4
                    // search path, following nodes and contrast, dir = 2
                    var left_path = this.findCenterline(x, y, nodeLayer, 2)

                    path = path.concat(right_path)
                    path = left_path.reverse().concat(path)

                    if( path.length >= this.minimunPathLength ) paths.push(path)
                }
            }
        }
        
        return paths    
    }

    static findCenterline(px, py, nodeLayer, dir) {
        var path = []
        var pathfinished = false
        while(!pathfinished) {
            // walk nodes and find next valid node
            var {ndir,nx,ny} = this.nodeWalk(nodeLayer, dir, px, py)
            if (ndir !==  -1) {
                path.push({ x: nx, y: ny, t: nodeLayer[ny][nx] })
                px = nx, py = ny, dir = ndir
            } else {
                // not valid node found
                // TODO; contrast path finder with limit
                pathfinished = true
            }
        }
        return path
    }

    // valid nodes are nodes which core pixel is a colorLaye pixel
    static isValidNode(node) {
        var validNodes = [4,5,6,7,12,13,14]
        return validNodes.includes(node)
    }

    static nodeWalk(nodeLayer, d, x, y) {
        var nx = x, ny = y
        var nodeFound = false
        for(let step = 0; step < 3 && !nodeFound; ++step) {
            var node = nodeLayer[ny][nx]
            if (node >= 0) {
                var lookupDir = this.pathNode_lookup[ node ][ d ]
                var lookupPos = this.dirNode_lookup[ node ][ d ]

                // replace node
                nodeLayer[ny][nx] = lookupDir[0]
            
                // find new direction
                d = lookupDir[1]

                // compute new direction
                nx += lookupPos[0]
                ny += lookupPos[1]

                var newNode = nodeLayer[ny][nx]
                // is a valid node?
                if( this.isValidNode(nodeLayer[ny][nx]) ) nodeFound = true
            }
        }
        var ndir = nodeFound ? d : -1
        return {ndir, nx, ny}
    }
}

LineTracer.colorIdentifier = 1
LineTracer.minimunPathLength = 8
LineTracer.pathNode_lookup = [
    [[-1,-1], [-1,-1], [-1,-1], [-1,-1]], // node type 0 is invalid
    [[-1,-1], [-1,-1], [ 0, 1], [ 0, 0]], // 1
    [[ 0, 1], [-1,-1], [-1,-1], [ 0, 2]], // 2
    [[ 0, 0], [-1,-1], [ 0, 2], [-1,-1]], // 3

    [[-1,-1], [ 0, 0], [ 0, 3], [-1,-1]], // 4
    [[-1,-1], [ 0, 1], [ 0, 1], [ 0, 3]], // 5
    [[14, 0], [14, 2], [ 0, 2], [ 0, 3]], // 6
    [[ 0, 3], [ 0, 1], [ 0, 3], [ 0, 3]], // 7 ??? check later

    [[ 0, 3], [ 0, 2], [-1,-1], [-1,-1]], // 8
    [[ 0, 1], [ 0, 1], [11, 2], [ 0, 2]], // 9
    [[ 0, 0], [ 0, 1], [-1,-1], [ 0, 3]], // 10
    [[-1,-1], [ 0, 2], [-1,-1], [-1,-1]], // 11??? check later

    [[ 0, 0], [-1,-1], [ 0, 2], [-1,-1]], // 12
    [[ 0, 1], [-1,-1], [-1,-1], [ 0, 2]], // 13??? check later
    [[ 0, 0], [-1,-1], [ 0, 2], [ 0, 0]], // 14
    [[-1,-1], [-1,-1], [-1,-1], [-1,-1]]  // node type 15 is invalid
]

LineTracer.dirNode_lookup = [
    [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]], // 0
    [[-1,-1], [-1,-1], [ 0,-1], [ 1, 0]], // 1
    [[ 0,-1], [-1,-1], [-1,-1], [-1, 0]], // 2
    [[ 0,-1], [-1,-1], [ 0,-1], [-1,-1]], // 3

    [[-1,-1], [ 1, 0], [ 0, 1], [-1,-1]], // 4
    [[-1,-1], [ 0,-1], [ 0,-1], [ 0, 1]], // 5
    [[ 1, 0], [ 0, 1], [ 0, 1], [ 0, 1]], // 6
    [[ 0, 1], [ 0,-1], [ 0, 1], [ 0, 1]], // 7

    [[ 0, 1], [-1, 0], [-1,-1], [-1,-1]], // 8
    [[ 0,-1], [ 0, 1], [-1, 0], [-1, 0]], // 9
    [[ 1, 0], [-1, 0], [-1,-1], [-1, 0]], // 10
    [[-1,-1], [-1, 0], [-1,-1], [-1,-1]], // 11

    [[ 1, 0], [-1,-1], [-1, 0], [-1,-1]], // 12
    [[ 0, 1], [-1,-1], [-1,-1], [-1, 0]], // 13
    [[ 1, 0], [-1,-1], [-1, 0], [ 1, 0]], // 14
    [[-1,-1], [-1,-1], [-1,-1], [-1,-1]]  // 15
]

export {LineTracer}
