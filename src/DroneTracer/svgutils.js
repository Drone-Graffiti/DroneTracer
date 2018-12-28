const traceToSVGPolyline = function(trace) {
    var ePolylineStr = ''
    var scale = 1
		
    var ePoly_start = `<polyline points="`
    var ePoly_end = `" />`

    var polyStr = ''
    for(let i = 0; i < trace.length-1; i++) {
        var point = trace[i]
        var nextPoint = trace[1+1]
        polyStr += `${point.x * scale},${point.y * scale} `
    }
            
    ePolylineStr = ePoly_start + polyStr + ePoly_end
        
    return ePolylineStr
}

export const exportSVG = function(traces) {
    var SVGString = ''
    var description = ''
    var w = 500, h = 500
    var strokeWidth = 0.02

    var SVGHeader = `<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" desc="${description}">`
    var SVGGlobalStyle = `<g fill="none" stroke="#000" stroke-width="${strokeWidth}cm" stroke-linecap="round" stroke-linejoin="round">`
    var SVGEnd =`</g></svg>`

    var eStr = ''
    for (let trace of traces) {
        eStr += traceToSVGPolyline(trace)
    }

    SVGString = SVGHeader + SVGGlobalStyle + eStr + SVGEnd

    return SVGString
} 
