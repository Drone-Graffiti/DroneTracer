import * as constants from './constants.js'
import DronePaint from './dronepaint.js'

const errorThrow = function(msg) {
    throw `DroneTracer, ${arguments.callee.caller.name} | ${msg}`
}

// TODO: dev /vs/ release logic
// dis/examples

class DroneTracer {
    constructor(options = {}) {
        // check required data
        for (let key of constants.requiredPaintingConfigParams) {
            if(options[key] === undefined) errorThrow(`parameter ${key} is required`)
        }
        // merge options with default configuration
        this.paintingConfig = Object.assign({}, constants.defaultPaintingConfig, options)
    }

    // Getter
    get working() {
        return this.paintingConfig ? true : false
    }

    // Method
    transform(source, progress = ()=>{}, options = {}) {
        // check parameters
        if (source === undefined) errorThrow('source image is required. |Image API|')
        var transformOptions = Object.assign({}, constants.defaultTransformOptions, options)

        progress(0)

        return new Promise((resolve) => {
            // TODO: check and read file -> throw error
            // TODO: calculate size/resolution of source
            // TODO: implement transformation logic
            // calculate transformations and create a DronePaint object
            var svg = '<xml></xml>'
            var dronePaint = new DronePaint(
                this.paintingConfig,
                transformOptions,
                source,
                svg
            )

            setTimeout(() => resolve(dronePaint), 300)
        })
    }
}

export default DroneTracer
