import * as constants from './constants.js'
import DronePaint from './dronepaint.js'
import { readImage, isAnImageFile } from './filereader.js'
import * as helper from './helper.js'
import LineTracer from './tracer.js'
import ImageManager  from './imagemanager.js'


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

            // TODO: calculate size/resolution of source

            // Initialize ImageManager and source image file
            var imageManager = new ImageManager()
            imageManager.source = await ImageManager.base64ToImageData(imageFile)

            // Initialize LineTracer
            var lineTracer =  new LineTracer(imageManager)
            //lineTracer.processLines??()


            // calculate transformations and create a DronePaint object
            var svg = ''
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
