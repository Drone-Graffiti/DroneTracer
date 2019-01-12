import * as constants from './constants.js'
import DronePaint from './dronepaint.js'
import { readImage, isAnImageFile } from './filereader.js'
import * as helper from './helper.js'
import LineTracer from './tracer.js'
import ImageManager  from './imagemanager.js'
import * as ImageProcessing from './imageprocessing.js'


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
        // map default options
        if (options.lowThreshold === undefined)
            options.lowThreshold == transformOptions.highThreshold * 0.10

        // create a ProgressReport instance
        var progressReport = new helper.ProgressReport(progress)

        // calculate number of steps
        var progressSteps = transformOptions.centerline ? 13 : 12
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
            // minimun resolution (too small = no data)
            

            // Initialize ImageManager and source image file
            var imageManager = new ImageManager()
            imageManager.source = await ImageManager.base64ToImageData(imageFile)

            progressReport.reportIncreaseStep()

            /*
             * Image Filtering
             */

            // TODO: improve deviation logic (automate)
            if (transformOptions.centerline) {
                // Zhang-Suen thinning
                var grayscaleImg = ImageProcessing.grayscale(imageManager.source)
                progressReport.reportIncreaseStep()

                var thresholdImg = ImageProcessing.thresholdFilter(
                    grayscaleImg, transformOptions.binaryThreshold)
                progressReport.reportIncreaseStep()

                var igradient = ImageProcessing.gradient(thresholdImg)
                progressReport.reportIncreaseStep()

                var invertSobel = ImageProcessing.invert(igradient.sobelImage)
                progressReport.reportIncreaseStep()

                var dilationImg = ImageProcessing.dilation(invertSobel, transformOptions.dilationRadius)
                progressReport.reportIncreaseStep()

                var screenImg = ImageProcessing.screen(dilationImg, thresholdImg)
                progressReport.reportIncreaseStep()

                var thinningImg = ImageProcessing.zsthinning(screenImg)
                progressReport.reportIncreaseStep()


                // assign maps to ImageManager
                imageManager.traceSource = thinningImg
                imageManager.differenceSource = thinningImg
            }
            else {
                // canny edge detection
                var gaussianBlurImg = ImageProcessing.fastBlur(
                    imageManager.source, transformOptions.blurKernel)
                progressReport.reportIncreaseStep()

                var grayscaleImgData = ImageProcessing.grayscale(gaussianBlurImg)
                progressReport.reportIncreaseStep()

                var gradient = ImageProcessing.gradient(grayscaleImgData)
                progressReport.reportIncreaseStep()

                var nmsuImg = ImageProcessing.nonMaximumSuppression(gradient.sobelImage, gradient.dirMap)
                progressReport.reportIncreaseStep()

                var hysteresisImg = ImageProcessing.hysteresis(nmsuImg,
                    transformOptions.hysteresisHighThreshold, transformOptions.hysteresisLowThreshold)
                progressReport.reportIncreaseStep()

                // assign maps to ImageManager
                imageManager.cannyImageData = hysteresisImg
                imageManager.traceSource = ImageProcessing.invert(imageManager.cannyImageData)
                imageManager.differenceSource = nmsuImg 
            }

            // Initialize LineTracer
            var lineTracer =  new LineTracer(imageManager, transformOptions, progressReport)
            var traces = lineTracer.traceImage()


            // calculate transformations and create a DronePaint object
            var dronePaint = new DronePaint(
                this.paintingConfig,
                source,
                traces
            )

            resolve(dronePaint)
        })
    }

    get uiParameters() {
        var conf =  constants.defaultTransformOptions
        var uiParams = []
        uiParams.push(
            helper.uiParamGenerator('Illustration', 'centerline', conf.centerline, 'checkbox')
        )

        var paramsGroup = {label: 'Photo parameters', type: 'group', nested: [] }
        paramsGroup.condition = 'centerline === false'

        paramsGroup.nested.push(
            helper.uiParamGenerator('Blur Radius', 'blurKernel', conf.blurKernel, 'range', 1, 10)
        )
        paramsGroup.nested.push(
            helper.uiParamGenerator(
                'Threshold', 'hysteresisHighThreshold', conf.hysteresisHighThreshold, 'range', 1, 100
            )
        )

        uiParams.push(paramsGroup)

        paramsGroup = {label: 'Illustration parameters', type: 'group', nested: [] }
        paramsGroup.condition = 'centerline === true'

        paramsGroup.nested.push(
            helper.uiParamGenerator(
                'Color threshold', 'binaryThreshold', conf.binaryThreshold, 'range', 0, 100
            )
        )
        paramsGroup.nested.push(
            helper.uiParamGenerator(
                'Stroke weight', 'dilationRadius', conf.dilationRadius, 'range', 1, 20
            )
        )

        uiParams.push(paramsGroup)

        var colorsGroup = {label: 'Colors', type: 'group', nested: [] }
        this.paintingConfig.colors.forEach( color => {
            colorsGroup.nested.push(
                helper.uiParamGenerator(color, 'svgcolor', color, 'radio')
            )
        })

        uiParams.push(colorsGroup)

        return uiParams
    } 
}

export default DroneTracer
