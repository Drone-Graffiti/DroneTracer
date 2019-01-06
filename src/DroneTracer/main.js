import * as constants from './constants.js'
import DronePaint from './dronepaint.js'
import { readImage, isAnImageFile } from './filereader.js'
import * as helper from './helper.js'
import LineTracer from './tracer.js'
import ImageManager  from './imagemanager.js'
import * as ImageProcessing from './imageprocessing.js'
import { exportSVG } from './svgutils.js'


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

        // create a ProgressReport instance
        var progressReport = new helper.ProgressReport(progress)

        // calculate number of steps
        var progressSteps = options.centerline ? 11 : 12
        progressReport.setSteps(progressSteps)

        return new Promise( async (resolve, reject) => {
            progressReport.reportIncreaseStep()

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

            progressReport.reportIncreaseStep()

            /*
             * Image Filtering
             */

            // canny edge detection
            var grayscaleImg = ImageProcessing.grayscale(imageManager.source)
            progressReport.reportIncreaseStep()

            var gaussianBlurImg = ImageProcessing.gaussianBlur(grayscaleImg)
            progressReport.reportIncreaseStep()

            var gradient = ImageProcessing.gradient(gaussianBlurImg)
            progressReport.reportIncreaseStep()

            var nmsuImg = ImageProcessing.nonMaximumSuppression(gradient.sobelImage, gradient.dirMap)
            progressReport.reportIncreaseStep()

            var hysteresisImg = ImageProcessing.hysteresis(nmsuImg)
            progressReport.reportIncreaseStep()

            // assign maps to ImageManager
            imageManager.cannyImageData = hysteresisImg
            imageManager.traceSource = ImageProcessing.invert(imageManager.cannyImageData)
            imageManager.differenceSource = nmsuImg 

            // Initialize LineTracer
            var options = { centerline: false }
            var lineTracer =  new LineTracer(imageManager, progressReport, options)
            var traces = lineTracer.traceImage()

            // convert into SVG file
            var svg = exportSVG(traces)

            // calculate transformations and create a DronePaint object
            var dronePaint = new DronePaint(
                this.paintingConfig,
                transformOptions,
                imageManager.source,
                svg
            )

            resolve(dronePaint)
        })
    }
}

export default DroneTracer
