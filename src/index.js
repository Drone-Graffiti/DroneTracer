import * as constants from './constants.js'

const errorThrow = function(msg) {
    throw `DroneTracer, ${arguments.callee.caller.name} | ${msg}`
}

class DroneTracer {
    constructor(options) {
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
            setTimeout(() => resolve(transformOptions), 1000)
        })
    }
}

export default DroneTracer
