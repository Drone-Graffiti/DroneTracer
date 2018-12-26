import ImageManager from './imagemanager.js'

/*
 * Layer and edge node logic base on jankovicsandras imagetracerjs
 */

export default class LineTracer {

    constructor(imageManager) {
        this.imgm = imageManager

        this.validNodes = [4,5,6,7,12,13,14]

        this.colorIdentifier = 1
        this.contrastPathIdentifier = 2
        this.minimunPathLength = 8
        this.contrastPathLengthFactor = 15 // relative %

        this.pathNode_lookup = [
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

        this.dirNode_lookup = [
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
    }

    // main call for automatize transformation process
    traceImage() {
        this.extractColorLayer()
        this.edgeAnalysis()
        this.pathNodeScan()
    }

    // pull out color into layer | Color quantization
    extractColorLayer(colorSearch = {r:0,g:0,b:0,a:255}, range = 20) {
        this.imgm.initColorLayer()

        // loop through all pixels
        for(let y = 0; y < this.imgm.traceSource.height; y++ ){
            for(let x = 0; x < this.imgm.traceSource.width; x++ ){
                var index = this.toIndex(x, y) * 4 // 4 values (RGBA)

                // Linear interpolation | Taxicab geometry
                var difference =
                    Math.abs(colorSearch.r-this.imgm.traceSource.data[index]) +
                    Math.abs(colorSearch.g-this.imgm.traceSource.data[index+1]) +
                    Math.abs(colorSearch.b-this.imgm.traceSource.data[index+2]) +
                    Math.abs(colorSearch.a-this.imgm.traceSource.data[index+3])

                // compare difference betweeen seach color and pixel index color
                if(difference < range) this.imgm.colorLayer[y+1][x+1] = this.colorIdentifier
            }
        }

        return this.imgm.colorLayer
    }


    // analyse the relationship of each pixel related with the neighbors
    edgeAnalysis() {
        this.imgm.initNodeLayer()

        // Looping through all pixels and calculating edge node type
        for(let y = 1; y < this.imgm.colorLayer.length; y++) {
            for(let x = 1; x < this.imgm.colorLayer[0].length; x++) {
                this.imgm.nodeLayer[y][x] =
                    ( this.imgm.colorLayer[y-1][x]  === this.colorIdentifier ? 1 : 0 ) +
                    ( this.imgm.colorLayer[y-1][x-1]=== this.colorIdentifier ? 2 : 0 ) +
                    ( this.imgm.colorLayer[y][x]    === this.colorIdentifier ? 4 : 0 ) +
                    ( this.imgm.colorLayer[y][x-1]  === this.colorIdentifier ? 8 : 0 )
            }
        }

        return this.imgm.nodeLayer
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
    pathNodeScan() {
        var paths = []
        this.imgm.initTracedMap()

        for(var y = 0; y < this.imgm.nodeLayer.length; y++) {
            for(var x = 0; x < this.imgm.nodeLayer[0].length; x++) {

                // find starting edge
                if( this.imgm.nodeLayer[y][x] == 4 ) {
                    var path = []
                    path.push({ x: x, y: y, t: this.imgm.nodeLayer[y][x] })

                    // seach path following nodes and contrast, dir = 1
                    var right_path = this.findCenterline(x, y, 1)

                    // if can not continue, search from the starting pixel in the
                    // opposite direction and concatenate the two outlines
                    // reset starting edge node
                    this.imgm.nodeLayer[y][x] = 4
                    // search path, following nodes and contrast, dir = 2
                    var left_path = this.findCenterline(x, y, 2)

                    path = path.concat(right_path)
                    path = left_path.reverse().concat(path)

                    if( path.length >= this.minimunPathLength ) paths.push(path)
                }
            }
        }
        
        return paths    
    }

    findCenterline(px, py, dir) {
        var path = []
        var pathfinished = false
        while(!pathfinished) {
            // walk nodes and find next valid node
            var {ndir,nx,ny} = this.nodeWalk(dir, px, py)
            if (ndir !==  -1) {
                path.push({ x: nx, y: ny, t: this.imgm.nodeLayer[ny][nx] })
                px = nx, py = ny, dir = ndir
                this.registerTrace( this.imgm.tracedMap, px, py )
            } else {
                // not valid node found

                var contrastPath = this.findContrastPath(nx, ny)

                // finish the line if you can not find another centerline within the maximum length
                if (contrastPath.length === 0) pathfinished = true
                else {
                    px = contrastPath[contrastPath.length-1].x
                    py = contrastPath[contrastPath.length-1].y
                    path = path.concat(contrastPath)
                }
            }
        }
        return path
    }

    // valid nodes are nodes which core pixel is a colorLayer pixel
    isValidNode(node) {
        return this.validNodes.includes(node)
    }

    nodeWalk(d, x, y) {
        var nx = x, ny = y
        var nodeFound = false
        for(let step = 0; step < 3 && !nodeFound; ++step) {
            var node = this.imgm.nodeLayer[ny][nx]
            if (node >= 0 && d >= 0) {
                var lookupDir = this.pathNode_lookup[ node ][ d ]
                var lookupPos = this.dirNode_lookup[ node ][ d ]

                // replace node
                if(lookupDir === undefined) debugger
                this.imgm.nodeLayer[ny][nx] = lookupDir[0]
            
                // find new direction
                d = lookupDir[1]

                // compute new direction
                nx += lookupPos[0]
                ny += lookupPos[1]

                var newNode = this.imgm.nodeLayer[ny][nx]
                // is a valid node?
                if( this.isValidNode(this.imgm.nodeLayer[ny][nx]) ) nodeFound = true
            }
        }
        var ndir = nodeFound ? d : -1
        return {ndir, nx, ny}
    }

    findContrastPath(x, y, contrastFactor = 10, maxLengthFactor = this.contrastPathLengthFactor) {
        var path = []
        var maxLength = parseInt( (this.imgm.traceSource.width+this.imgm.traceSource.height)/100.0
            * maxLengthFactor)

        // clone tracedMap
        var tempTracedMap = this.imgm.tracedMap.slice(0)
        this.registerTrace( tempTracedMap, x, y )

        var cnt = 0
        while (cnt < maxLength) {
            // get all the neighbors possitions that has not been traced before
            var neighbors = this.createNeighborsPossitions(tempTracedMap, x, y)

            // find direction by comparing all neighbors contrast
            var diff = 0, nextPossition = {}
            for (let n of neighbors) {
                // compare each neighbors with the next pixels
                var nextPixels = this.createNeighborsPossitions(tempTracedMap, n.x, n.y)
                var difference = this.calculateDifference(n, nextPixels, this.imgm.source)

                if (difference > diff) {
                    diff = difference
                    nextPossition = n
                }
            }

            if (neighbors.length != 0) {
                if (diff > contrastFactor) {
                    path.push({ x: nextPossition.x, y: nextPossition.y, t: 15 })
                    this.registerTrace( tempTracedMap, nextPossition.x, nextPossition.y )
                    x = nextPossition.x, y = nextPossition.y
                }
                else {
                    // random move
                    var randomDirection = Math.floor(Math.random()*10) // 0 to 9 possitions
                    nextPossition = {x: x, y: y}
                    nextPossition.x -=1, nextPossition.y -=1 // start corner left

                    for(let i = 1; i < randomDirection; i++) {
                        nextPossition.x++
                        if (i%3 === 0) {
                            nextPossition.x -= 3
                            nextPossition.y++
                        }
                    }

                    if ( this.checkBounds(
                        this.imgm.traceSource.width, this.imgm.traceSource.height,
                        nextPossition.x, nextPossition.y
                    ) ) {
                        path.push({ x: nextPossition.x, y: nextPossition.y, t: 15 })
                        this.registerTrace( tempTracedMap, nextPossition.x, nextPossition.y )
                        x = nextPossition.x, y = nextPossition.y
                    }
                }
            }

            // when connect with node path
            if( nextPossition.x != undefined &&
                this.isValidNode(this.imgm.nodeLayer[nextPossition.y][nextPossition.x]) ) {
                break
            }
            cnt++
        }
        if (path.length < maxLength) {
            this.imgm.tracedMap = tempTracedMap
        } else path = []

        return path
    }

    registerTrace(mapLayer, x, y) {
        mapLayer[y][x] = this.contrastPathIdentifier
    }

    calculateDifference(pixel, nextPixels, source) {
        var diff = 0
        var index = this.toIndex(pixel.x, pixel.y, true) * 4 // 4 values (RGBA)

        var pr = source.data[index]
        var pg = source.data[index+1]
        var pb = source.data[index+2]

        var nr = 0, ng = 0, nb = 0
        for (let n of nextPixels) {
            var index = this.toIndex(n.x, n.y, true) * 4
            nr = source.data[index]
            ng = source.data[index+1]
            nb = source.data[index+2]

            diff += Math.abs(pr-nr) + Math.abs(pg-ng) + Math.abs(pb-nb)
        }

        // average difference
        diff /= parseFloat(nextPixels.length)
        return diff
    }

    createNeighborsPossitions(tracedMap, x, y) {
        var possitions = []
        var px = x - 1, py = y - 1 // start corner left
        for (let i = 0; i < 9; i++) {
            if ( this.checkBounds(this.imgm.traceSource.width, this.imgm.traceSource.height, px, py) ) {
                if (tracedMap[py][px] != this.contrastPathIdentifier)
                    possitions.push({x:px, y:py})
            }
            px++
            if (px > x+1) {
                px = x - 1
                py++
            }
        }
        return possitions
    }

    checkBounds(layer, x, y) {
        return x < layer[0].length && x >= 0 && y < layer.length && y >= 0
    }

    checkBounds(width, height, x, y) {
        return x <= width && x > 0 && y <= height && y > 0
    }

    toIndex(x, y, indexed = false) {
        var ix = indexed ? -1 : 0
        return ((y + ix) * this.imgm.traceSource.width + (x + ix))
    }

}

