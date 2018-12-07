import * as constants from './constants'
import DronePaint from './dronepaint'
import {readImage, isAnImageFile} from './filereader'
import * as helper from './helper'


// TODO: dev /vs/ release logic
// dis/examples

class DroneTracer {
    constructor(options = {}) {
        // check required data
        for (let key of constants.requiredPaintingConfigParams) {
            if(options[key] === undefined) helper.throw(`parameter ${key} is required`)
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
        if (source === undefined) helper.throw('source image is required. |Image API|')
        var transformOptions = Object.assign({}, constants.defaultTransformOptions, options)

        progress(0)

        return new Promise( async (resolve, reject) => {
            if(!isAnImageFile(source)) helper.reject(reject, 'Not an image file')

            var imageFile = await readImage(source)

            // TODO: calculate size/resolution of source
            // TODO: implement transformation logic
            // calculate transformations and create a DronePaint object
            var svg = '<xml></xml>'
            var dronePaint = new DronePaint(
                this.paintingConfig,
                transformOptions,
                imageFile,
                svg
            )

            resolve(dronePaint)
        })
    }
}

export default DroneTracer
