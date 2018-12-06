const calculateEstimatedTime = function(svg) {
    svg = 0
    return 1000 + svg
} 

// Drone Paint provides functions to access and modify related information to the svg for the drone
class DronePaint {
    constructor({wallId, dimensions}, {size}, source, svg) {
        var middleX = dimensions[0]/2.0 - size[0]/2.0
        var middelY = dimensions[1]/2.0 - size[1]/2.0
        this.setPaintingPosition( middleX, middelY )
        this.setPaintingScale( 1.0 )

        this.setPaintingData('wallId', wallId)

        // asign
        this.source = source
        this.svg = svg
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
}

export default DronePaint
