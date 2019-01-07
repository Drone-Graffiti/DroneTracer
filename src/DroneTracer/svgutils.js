const traceToSVGPolyline = function(trace, scale = 1) {
    var ePolylineStr = ''
		
    var ePoly_start = '<polyline points="'
    var ePoly_end = '" />'

    var polyStr = ''
    for(let i = 0; i < trace.length-1; i++) {
        var point = trace[i]
        //var nextPoint = trace[1+1]
        polyStr += `${point.x * scale},${point.y * scale} `
    }
            
    ePolylineStr = ePoly_start + polyStr + ePoly_end
        
    return ePolylineStr
}

const getMaxSize = function(traces) {
    var maxX = 0, maxY = 0
    for (let trace of traces) {
        for (let point of trace) {
            maxX = point.x > maxX ? point.x : maxX
            maxY = point.y > maxY ? point.y : maxY
        }
    }

    return {x: maxX, y: maxY}
}

export const exportSVG = function(traces) {
    var SVGString = ''
    var description = ''
    var {x, y} = getMaxSize(traces)
    var scale = 35
    var w = x * scale, h = y * scale
    var strokeWidth = 10

    var SVGHeader = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" desc="${description}">`
    var SVGGlobalStyle = `<g fill="none" stroke="#000" stroke-width="${strokeWidth}cm" stroke-linecap="round" stroke-linejoin="round">`
    var SVGEnd ='</g></svg>'

    var eStr = ''
    for (let trace of traces) {
        eStr += traceToSVGPolyline(trace, scale)
    }

    SVGString = SVGHeader + SVGGlobalStyle + eStr + SVGEnd

    return SVGString
}
