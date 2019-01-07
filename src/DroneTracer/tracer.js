import simplify from '../libs/simplify.js'
import * as helper from './helper.js'

/*
 * Layer and edge node logic base on jankovicsandras imagetracerjs
 */

export default class LineTracer {

    constructor(imageManager, options = {}, progressReport = false) {
        this.imgm = imageManager
        this.progressReport = progressReport

        this.validNodes = [4,5,6,7,12,13,14]

        this.colorIdentifier = 1
        this.contrastPathIdentifier = 2

        this.pathNode_lookup = [
            [[-1,-1], [-1,-1], [-1,-1], [-1,-1]], // node type 0 is invalid
            [[-1,-1], [-1,-1], [ 0, 1], [ 0, 0]], // 1
            [[ 0, 1], [-1,-1], [-1,-1], [ 0, 2]], // 2
            [[ 0, 0], [-1,-1], [ 0, 2], [-1,-1]], // 3

            [[ 0, 0], [ 0, 0], [ 0, 3], [-1,-1]], // 4
            [[-1,-1], [ 0, 1], [ 0, 1], [ 0, 3]], // 5
            [[14, 0], [14, 1], [ 0, 2], [ 0, 3]], // 6
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

            [[ 1, 0], [ 1, 0], [ 0, 1], [-1,-1]], // 4
            [[-1,-1], [ 0,-1], [ 0,-1], [ 0, 1]], // 5
            [[ 1, 0], [-1,-1], [-1,-1], [ 0, 1]], // 6
            [[ 0, 1], [ 0,-1], [ 0, 1], [ 0, 1]], // 7

            [[ 0, 1], [-1, 0], [-1,-1], [-1,-1]], // 8
            [[ 0,-1], [ 0,-1], [-1, 0], [-1, 0]], // 9
            [[ 1, 0], [-1, 0], [-1,-1], [-1, 0]], // 10
            [[-1,-1], [-1, 0], [-1,-1], [-1,-1]], // 11

            [[ 1, 0], [-1,-1], [-1, 0], [-1,-1]], // 12
            [[ 0, 1], [-1,-1], [-1,-1], [-1, 0]], // 13
            [[ 1, 0], [-1,-1], [-1, 0], [ 1, 0]], // 14
            [[-1,-1], [-1,-1], [-1,-1], [-1,-1]]  // 15
        ]

        this.config = options
    }

    // main call for automatize transformation process
    traceImage() {
        this.extractColorLayer()
        this.edgeAnalysis()
        var paths = this.pathNodeScan()
        var traces
        if (!this.config.centerline)
            traces = this.tracePaths(paths)
        else
            traces = paths
        var smoothTraces = this.filterTraces(traces)
        return smoothTraces
    }

    // pull out color into layer | Color quantization
    extractColorLayer(colorSearch = 0) {
        if (this.progressReport) this.progressReport.increaseStep()
        this.imgm.initColorLayer()

        // loop through all pixels
        for(let y = 0; y < this.imgm.traceSource.length; y++ ){
            for(let x = 0; x < this.imgm.traceSource[0].length; x++ ){
                if (this.imgm.traceSource[y][x] == colorSearch)
                    this.imgm.colorLayer[y+1][x+1] = this.colorIdentifier
            }
            if (this.progressReport)
                this.progressReport.report(this.imgm.traceSource.length, y)
        }

        return this.imgm.colorLayer
    }


    // analyse the relationship of each pixel related with the neighbors
    edgeAnalysis() {
        if (this.progressReport) this.progressReport.increaseStep()
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
            if (this.progressReport)
                this.progressReport.report(this.imgm.colorLayer.length, y)
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
        if (this.progressReport) this.progressReport.increaseStep()
        var paths = []
        this.imgm.initTracedMap()

        for(var y = 0; y < this.imgm.nodeLayer.length; y++) {
            for(var x = 0; x < this.imgm.nodeLayer[0].length; x++) {

                // find starting edge
                if( this.imgm.nodeLayer[y][x] == 4 || this.imgm.nodeLayer[y][x] == 6 ) {
                    var path = []
                    path.push({ x: x, y: y, t: this.imgm.nodeLayer[y][x] })

                    // seach path following nodes and contrast, dir = 0
                    var right_path = this.findCenterline(x, y, 0)

                    // if can not continue, search from the starting pixel in the
                    // opposite direction and concatenate the two outlines
                    // reset starting edge node
                    this.imgm.nodeLayer[y][x] = 4
                    // search path, following nodes and contrast, dir = 2
                    var left_path = this.findCenterline(x, y, 2)

                    path = path.concat(right_path)
                    path = left_path.reverse().concat(path)

                    if( path.length >= this.config.minimunPathLength ) paths.push(path)
                }
            }
            if (this.progressReport)
                this.progressReport.report(this.imgm.nodeLayer.length, y)
        }
        
        return paths    
    }

    tracePaths(paths) {
        if (this.progressReport) this.progressReport.increaseStep()
        var traces = paths.slice(0)
        var concatContrastDistance = parseInt(
            (this.imgm.traceSource[0].length+this.imgm.traceSource.length)/100.0 *
            (this.config.contrastConcatLengthFactor)
        )
        
        for(let j = 0; j < traces.length; j++) {
            var path = traces[j]
            var targetPathId = -1, concatMode = 4
            var smallest = concatContrastDistance // minimun size

            for(let k = j+1; k < traces.length; k++) {
                let line = traces[k]

                // check direct connection
                let pStart = path[0]
                let pEnd = path[path.length-1]
                let lStart = line[0]
                let lEnd = line[line.length]

                // find closest path
                var distances = []
                distances[0] = this.calculateDistance(pEnd,lStart)
                distances[1] = this.calculateDistance(pStart,lEnd)
                distances[2] = this.calculateDistance(pStart,lStart)
                distances[3] = this.calculateDistance(pEnd,lEnd)

                for (var i = 0; i < distances.length; i++) {
                    if (distances[i] < smallest) {
                        smallest = distances[i]
                        targetPathId = k
                        concatMode = i
                    }
                }
            }

            if (targetPathId !== -1) {
                let line = traces[targetPathId]

                let pStart = path[0]
                let pEnd = path[path.length-1]
                let lStart = line[0]
                let lEnd = line[line.length]

                var contrastPath = []
                switch(concatMode) {
                // pEnd -> lStart
                case 0:
                    contrastPath = this.findContrastPath(
                        pEnd.x, pEnd.y, 100, this.config.contrastConcatLengthFactor, lStart
                    )
                    break

                // pStart lEnd
                case 1:
                    path.reverse()
                    line.reverse()
                    contrastPath = this.findContrastPath(
                        pStart.x, pStart.y, 100, this.config.contrastConcatLengthFactor, lEnd
                    )
                    break

                // pStart lStart
                case 2:
                    path.reverse()
                    contrastPath = this.findContrastPath(
                        pStart.x, pStart.y, 100, this.config.contrastConcatLengthFactor, lStart
                    )
                    break

                // pEnd lEnd
                case 3:
                    line.reverse()
                    contrastPath = this.findContrastPath(
                        pEnd.x, pEnd.y, 100, this.config.contrastConcatLengthFactor, lEnd
                    )
                    break

                }

                if (contrastPath.length > 0) {
                    path = path.concat(contrastPath)
                    traces[j] = path.concat(line)
                    traces.splice(targetPathId,1)
                }

            }

            if (this.progressReport)
                this.progressReport.report(traces.length, j)
        }

        return traces
    }

    filterTraces(traces, tolerance = this.config.traceFilterTolerance) {
        if (this.progressReport) this.progressReport.increaseStep()
        // TODO: calculate distance based in cm in wall
        var distance = this.config.drone.minimunDistance
        var smoothTraces = []

        for (let trace of traces) {
            // Bounding box
            var boundingbox = [trace[0].x, trace[0].y, trace[0].x, trace[0].y]
            for(let point of trace) {
                if (point.x < boundingbox[0]) boundingbox[0] = point.x
                if (point.x > boundingbox[2]) boundingbox[2] = point.x
                if (point.y < boundingbox[1]) boundingbox[1] = point.y
                if (point.y > boundingbox[3]) boundingbox[3] = point.y
            }
            // do not process small paths
            if (boundingbox[2]-boundingbox[0] > distance
                && boundingbox[3] - boundingbox[1] > distance)
                smoothTraces.push(simplify(trace, tolerance, true))
        }

        if (this.progressReport) this.progressReport.report(1,1)
        return smoothTraces
    }

    /*
     * Private Methods
     */

    calculateDistance(from, to = {x:0,y:0}) {
        // return just maximun distance not Pythagoras Euclidean distance
        var x = Math.abs(from.x - to.x)
        var y = Math.abs(from.y - to.y)

        return Math.max(x, y)
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
                //pathfinished = true

                var contrastPath = this.findContrastPath(
                    nx, ny, 30, this.config.contrastPathLengthFactor
                )
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
                if(lookupDir === undefined) helper.throw('Not a defined lookup table') 
                this.imgm.nodeLayer[ny][nx] = lookupDir[0]
            
                // find new direction
                d = lookupDir[1]

                // compute new direction
                nx += lookupPos[0]
                ny += lookupPos[1]

                // is a valid node?
                if( this.isValidNode(this.imgm.nodeLayer[ny][nx]) ) nodeFound = true
            }
        }
        var ndir = nodeFound ? d : -1
        return {ndir, nx, ny}
    }

    findContrastPath(
        x, y, contrastFactor = 10, maxLengthFactor = this.config.contrastPathLengthFactor,
        target = false
    ) {
        var path = []
        var maxLength = parseInt( (this.imgm.traceSource[0].length+this.imgm.traceSource.length)/100.0
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
            var differences = []
            for (let n of neighbors) {
                // compare each neighbors with the next pixels
                var nextPixels = this.createNeighborsPossitions(tempTracedMap, n.x, n.y)
                // use difference map instead
                var difference = this.calculateDifference(n, nextPixels, this.imgm.differenceSource)

                if (difference > diff) {
                    diff = difference
                    nextPossition = n
                }

                differences.push({pixel: n, diff: difference})
            }

            // induce target direction
            if (target) {
                var relativeTarget = {}
                relativeTarget.x = Math.min(1, Math.max(-1, target.x - x) )
                relativeTarget.y = Math.min(1, Math.max(-1, target.y - y) )

                var targetPossition = {x: x, y: y}
                targetPossition.x += relativeTarget.x, targetPossition.y += relativeTarget.y

                if( !(nextPossition.x===targetPossition.x && nextPossition.y===targetPossition.y)
                    && diff > 0) {
                    for(let k of differences) {
                        if(k.pixel.x === targetPossition.x && k.pixel.y === targetPossition.y) {
                            if (diff - k.diff < (diff*this.config.targetInfluence)) nextPossition = targetPossition
                        }
                    }
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
                    if (target && Math.random() > 0.5)
                        randomDirection = this.possitionToDirection(relativeTarget)
                    nextPossition = {x: x, y: y}

                    var pos = this.directionToPossition(randomDirection)
                    nextPossition.x += pos.x, nextPossition.y += pos.y

                    if ( this.checkBounds(
                        this.imgm.traceSource[0].length-1, this.imgm.traceSource.length-1,
                        nextPossition.x, nextPossition.y
                    ) ) {
                        path.push({ x: nextPossition.x, y: nextPossition.y, t: 15 })
                        this.registerTrace( tempTracedMap, nextPossition.x, nextPossition.y )
                        x = nextPossition.x, y = nextPossition.y
                    }
                }
            }

            if (this.checkBounds(
                this.imgm.traceSource[0].length-1, this.imgm.traceSource.length-1, 
                nextPossition.x, nextPossition.y
            ) ) {
                // when connect with node path
                if( nextPossition.x != undefined &&
                    this.isValidNode(this.imgm.nodeLayer[nextPossition.y][nextPossition.x]) ) {
                    break
                }
            }
            cnt++
        }
        if (path.length < maxLength-1) {
            this.imgm.tracedMap = tempTracedMap
        } else path = []

        return path
    }

    directionToPossition(direction) {
        return {x: (direction%3)-1, y: Math.floor(direction/3)-1}
    }

    possitionToDirection(possition) {
        return (possition.y+1)*3+(possition.x+1) 
    }

    registerTrace(mapLayer, x, y) {
        mapLayer[y][x] = this.contrastPathIdentifier
    }

    calculateDifference(pixel, nextPixels, map) {
        var diff = 0
        var px = map[pixel.y][pixel.x]
        var npx = 0
        for (let n of nextPixels) {
            npx = map[n.y][n.x]
            diff += Math.abs(px-npx)
        }

        // average difference
        diff /= parseFloat(nextPixels.length)
        return diff
    }

    createNeighborsPossitions(tracedMap, x, y) {
        var possitions = []
        var px = x - 1, py = y - 1 // start corner left
        for (let i = 0; i < 9; i++) {
            if ( this.checkBounds(
                this.imgm.traceSource[0].length-1, this.imgm.traceSource.length-1, px, py)
            ) {
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

    checkBounds(width, height, x, y) {
        return x <= width && x > 0 && y <= height && y > 0
    }

    toIndex(x, y, indexed = false) {
        var ix = indexed ? -1 : 0
        return ((y + ix) * this.imgm.traceSource[0].length + (x + ix))
    }

}

