const traceToSVGPolyline = function(trace, scale = 1, origin = {x:0,y:0}) {
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

const getBoundingBox = function(traces) {
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

export const getSVGHeader = function(width, height, description = '', UI = false) {
    var viewBox = `viewBox="0 0 ${width} ${height}"`
    var size = ''

    if (UI) size = 'width="100%" height="100%"'
    else size = `width="${width}mm" height="${height}mm"`

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
    ${viewBox}
    ${size}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    desc="${description}"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg">
`
}

export const getGlobal = function(color, strokeWidth) {
    return `<g fill="none" stroke="${color}" stroke-width="${strokeWidth*10}" stroke-linecap="round" stroke-linejoin="round">`
}

export const exportSVG = function(traces) {
    var SVGString = ''
    var description = ''

    var {maxX, maxY, minX, minY} = getBoundingBox(traces)

    var unitFactor = 35.43307
    //var unitFactor = 37.795
    var strokeWidth = 10
    //var scale = unitFactor * (strokeWidth*0.3)
    var scale = unitFactor
    var w = (maxX-minX)*scale, h = (maxY-minY)*scale

    var SVGHeader = getSVGHeader(w, h, description) 
    var SVGGlobalStyle = getGlobal('#ff0000',strokeWidth)
    var SVGEnd ='</g></svg>'

    var eStr = ''
    for (let trace of traces) {
        eStr += traceToSVGPolyline(trace, scale, {x:minX, y:minY})
    }

    SVGString = SVGHeader + SVGGlobalStyle + eStr + SVGEnd

    return SVGString
}
