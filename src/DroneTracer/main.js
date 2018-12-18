import * as constants from './constants.js'
import DronePaint from './dronepaint.js'
import { readImage, isAnImageFile } from './filereader.js'
import * as helper from './helper.js'
import { base64ToImageData, trace, LineTracer } from './svgtracer.js'


class DroneTracer {
    constructor(options = {}) {
        // check required data
        for (let key of constants.requiredPaintingConfigParams) {
            if(options[key] === undefined) helper.throw(`parameter ${key} is required`)
        }
        // merge options with default configuration
        this.paintingConfig = Object.assign({}, constants.defaultPaintingConfig, options)
    }

    // Method
    // source could be an File API object or a base64 image (string)
    transform(source, progress = ()=>{}, options = {}) {
        // check parameters
        if (source === undefined) helper.throw('source image is required. |Image API|')
        var transformOptions = Object.assign({}, constants.defaultTransformOptions, options)

        progress(0)

        return new Promise( async (resolve, reject) => {
            var imageFile

            if(typeof(source) === 'string') imageFile = source 

            else {
                if(!isAnImageFile(source)) helper.reject(reject, 'Not an image file')
                imageFile = await readImage(source)
            }

            // TEMP svg tracer
            var imageData = await base64ToImageData(imageFile)
            var svgOutput = trace(imageData)

            var colorLayer = LineTracer.extractColorLayer(imageData)
            console.log('color layer', colorLayer)

            var nodeLayer = LineTracer.edgeAnalysis(colorLayer)
            console.log('node layer', nodeLayer)


            // TODO: calculate size/resolution of source
            // TODO: implement transformation logic

            // calculate transformations and create a DronePaint object
            var svg = svgOutput
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
