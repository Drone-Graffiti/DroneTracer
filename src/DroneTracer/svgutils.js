import polyline2bezier from '../libs/polyline2bezier.js'

export const traceToSVGPolyline = function(trace, scale = 1, origin = {x:0,y:0}) {
    var ePolylineStr = ''
		
    var ePoly_start = '<polyline points="'
    var ePoly_end = '" />'

    var polyStr = ''
    for(let i = 0; i < trace.length-1; i++) {
        var point = trace[i]
        //var nextPoint = trace[1+1]
        polyStr += `${(point.x-origin.x)*scale},${(point.y-origin.y)*scale} `
    }
            
    ePolylineStr = `${ePoly_start}${polyStr}${ePoly_end}
`
        
    return ePolylineStr
}

const traceToBezier = function(trace, scale = 1, origin = {x:0,y:0}) {
    var bezierCurves = []

    var arr = trace.map(t=>[(t.x-origin.x)*scale,(t.y-origin.y)*scale])
    bezierCurves = polyline2bezier(arr)

    return bezierCurves
}

export const traceToSVGPath = function(trace, scale = 1, origin = {x:0,y:0}) {
    var ePathStr = ''

    var ePath_start = '<path d="'
    var ePath_end = '" />'

    var bezierCurves = traceToBezier(trace, scale, origin)
    if (bezierCurves) {
        var pathStr = `M${bezierCurves[0][0].x},${bezierCurves[0][0].y} C`

        for (let segment of bezierCurves) {
            for (let i = 1; i <= 3; i++) {
                var point = segment[i]
                pathStr += ` ${point.x},${point.y}`
            }
        }

        ePathStr = `${ePath_start}${pathStr}${ePath_end}
    `
    }

    return ePathStr
}

export const getBoundingBox = function(traces) {
    var maxX = 0, maxY = 0
    var minX = 9999, minY = 9999
    for (let trace of traces) {
        for (let point of trace) {
            maxX = point.x > maxX ? point.x : maxX
            maxY = point.y > maxY ? point.y : maxY
            minX = point.x < minX ? point.x : minX
            minY = point.y < minY ? point.y : minY
        }
    }

    return {maxX, maxY, minX, minY}
}

export const countTraces = function(traces) {
    var result = {
        accumulated: 0,
        painting: 0,
        flying: 0
    }
    var p1, p2

    for (let trace = 0; trace < traces.length; trace++) {
        if (trace > 0 && trace < traces.length) {
            p1 = traces[trace-1][traces[trace-1].length-1]
            p2 = traces[trace][0]
            result.flying += Math.sqrt( Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2) )
        }
        result.accumulated += traces[trace].length
        for (let point = 1; point < traces[trace].length; point++) {
            p1 = traces[trace][point-1]
            p2 = traces[trace][point]
            result.painting += Math.sqrt( Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2) )
        }
    }

    return result
}

export const getSVGHeader = function(width, height, canvasOrigin = {x:0,y:0}, config) {
    var viewBox = `viewBox="0 0 ${width} ${height}"`
    var size = `width="${width}mm" height="${height}mm"`

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
    ${viewBox}
    ${size}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns:wallCanvas="http://www.drone.paint/"
    wallCanvas:origin="${canvasOrigin.x} ${canvasOrigin.y}" >
    wallCanvas:wallId="${config.wallId}" >
`
}

export const getGlobal = function(color, strokeWeight) {
    return `<g fill="none" stroke="${color}" stroke-width="${strokeWeight}" stroke-linecap="round" stroke-linejoin="round">`
}
