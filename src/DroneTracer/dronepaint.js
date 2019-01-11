import * as svgUtils from './svgutils.js'
import * as helper from './helper.js'

const calculateEstimatedTime = function(svg) {
    svg = 0
    return 3 * 60 * 1000 + svg
} 

// Drone Paint provides functions to access and modify related information to the svg for the drone
class DronePaint {
    constructor(paintingConfig, source, traces) {
        this.paintingConfig = paintingConfig
        this.setPaintingData('wallId', paintingConfig.wallId)

        // asign
        this.source = source
        this.traces = traces

        this.calculateFlyableConditions()
        this.calculateSVG()
    }


    // getters
    get svgFile() {
        return this.svg
    }

    get sourceImage() {
        return this.source
    }

    get estimatedTime() {
        return calculateEstimatedTime(this.svg)
    }


    setPaintingPosition(x, y) {
        this.paintingPosition = [x,y]
        this.setPaintingData('position', this.paintingPosition)
    }

    setPaintingScale(scale) {
        if (scale < 1.0) return
        // The svg is optimized to fit the drone resolution.
        // Scaling down the svg will result into a non flyable path.
        this.setPaintingData('scale', this.paintingScale)
        this.paintingScale = scale
    }

    setPaintingData(name, value) {
        // TODO: add a data property
        return `data:${name}-${value}`
    }

    calculateSVG() {
        var boundingBox = svgUtils.getBoundingBox(this.traces)
        var density = this.counts.accumulated / (
            (boundingBox.maxX-boundingBox.minX) * (boundingBox.maxY-boundingBox.minY)
        )
        // TODO: map based on config.strokeWeight
        var map = helper.map(density, 0, 1, 1, 3000)
        var scale = 3 + map
        // convert into SVG file
        this.svg = svgUtils.exportSVG(this.traces, this.paintingConfig.strokeWeight, boundingBox, scale)

        this.counts.painting *= scale
        this.counts.flying *= scale
    }

    calculateFlyableConditions() {
        this.counts = svgUtils.countTraces(this.traces)
    }
}

export default DronePaint
