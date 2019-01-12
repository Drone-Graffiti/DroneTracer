import * as svgUtils from './svgutils.js'
import * as helper from './helper.js'

const calculateEstimatedTime = function(svg) {
    svg = 0
    return 3 * 60 * 1000 + svg
} 

// TODO: Migrate to to HTML element logic? Or keep strings for non Browser platform.

// Drone Paint provides functions to access and modify related information to the svg for the drone
class DronePaint {
    constructor(paintingConfig, source, traces) {
        this.paintingConfig = paintingConfig

        // asign
        this.source = source
        this.traces = traces

        this.paintingColor = this.paintingConfig.colors[0]
        this.paintingScale = 1

        this.calculateSVG()
    }


    // getters
    get svgFile() {
        return `${this.SVGHeader}${this.SVGGlobalStyle}${this.SVGPaths}</g></svg>`
    }

    get sourceImage() {
        return this.source
    }

    get estimatedTime() {
        return calculateEstimatedTime(this.svg)
    }


    setPaintingPosition(x, y) {
        // TODO: check boundaries and calculate relative / absolute positioning
        this.paintingPosition = [x,y]
        this.setSVGHeader()
    }

    setPaintingScale(scale) {
        if (scale < 1.0) return
        // The svg is optimized to fit the drone resolution.
        // Scaling down the svg will result into a non flyable path.
        this.paintingScale = scale
        this.calculateSVG()
    }

    setPaintingColor(color) {
        this.paintingColor = color
        this.setSVGGlobal()
    }

    setSVGHeader() {
        this.SVGHeader = svgUtils.getSVGHeader(
            this.paintingWidth, this.paintingHeight,
            {x:0, y:0}, // painting origin (bottom-left of wall)
            this.paintingConfig
        )
    }

    setSVGGlobal() {
        this.SVGGlobalStyle = svgUtils.getGlobal(this.paintingColor,this.paintingConfig.strokeWeight)
    }

    calculateSVG() {
        // calculate flyable path
        this.counts = svgUtils.countTraces(this.traces)

        var maxX = 0, maxY = 0, minX = 0, minY = 0
        var scale = 1

        if (this.counts > 0) {
            // find boundingBox
            var boundingBox = svgUtils.getBoundingBox(this.traces)
            maxX = boundingBox.maxX, maxY = boundingBox.maxY
            minX = boundingBox.minX, minY = boundingBox.minY

            // find scale factor
            var density = this.counts.accumulated / ( (maxX-minX)*(maxY-minY) )
            var map = helper.map(density, 0, 1, 0, this.paintingConfig.strokeWeight*3)
            scale = (6+map) * this.paintingScale
        }

        // calculate size in mm
        var w = (maxX-minX)*scale, h = (maxY-minY)*scale
        this.paintingWidth = w
        this.paintingHeight = h

        // generate SVG strings
        this.setSVGHeader()
        this.setSVGGlobal()

        this.SVGPaths= ''
        for (let trace of this.traces) {
            //this.SVGPaths += svgUtils.traceToSVGPolyline(trace, scale, {x:minX, y:minY})
            this.SVGPaths += svgUtils.traceToSVGPath(trace, scale, {x:minX, y:minY})
        }

        // scale counts
        this.counts.painting *= scale
        this.counts.flying *= scale
    }
}

export default DronePaint
