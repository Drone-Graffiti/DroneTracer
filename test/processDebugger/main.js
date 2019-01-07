//import * as constants from './constants.js'
import DroneTracer from '/src/DroneTracer/main.js'
import { readImage, isAnImageFile } from '/src/DroneTracer/filereader.js'
import LineTracer from '/src/DroneTracer/tracer.js'
import ImageManager from '/src/DroneTracer/imagemanager.js'
import { exportSVG } from '/src/DroneTracer/svgutils.js'
import * as ImageProcessing from '/src/DroneTracer/imageprocessing.js'

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.')
}

/*
 *     ____  ____   __  ____    ____  __  __    ____
 *    (    \(  _ \ /  \(  _ \  (  __)(  )(  )  (  __)
 *     ) D ( )   /(  O )) __/   ) _)  )( / (_/\ ) _)
 *    (____/(__\_) \__/(__)    (__)  (__)\____/(____)
 *
 */

function handleFileSelect(e) {
    // Prevent default behavior (Prevent file from being opened)
    e.stopPropagation()
    e.preventDefault()

    var files = e.dataTransfer.files; // FileList object.

    // files is a FileList of File objects
    for (var file of files) {
        // Only process image files.
        if (!file.type.match('image.*')) {
            continue
        }
        if (e.currentTarget.id === 'drop_zone_photo') {
            imageManager.source = file 
        }
        else {
            imageManager.traceSource = file 
        }
    }
}

function handleDragOver(e) {
    // Prevent default behavior (Prevent file from being opened)
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy
}


// Setup the dnd listeners.
var dropZonePhoto = document.getElementById('drop_zone_photo')
var dropZoneCanny = document.getElementById('drop_zone_canny')
dropZonePhoto.addEventListener('dragover', handleDragOver, false)
dropZonePhoto.addEventListener('drop', handleFileSelect, false)
dropZoneCanny.addEventListener('dragover', handleDragOver, false)
dropZoneCanny.addEventListener('drop', handleFileSelect, false)

var buttonTransform = document.getElementById('buttonTransform')
buttonTransform.addEventListener('click', tracerTransform, false)

var imageManager = new ImageManager()


/*
 *     ____  ____   __   __ _  ____  ____  ____   __    ___  ____  ____
 *    (    \(  _ \ /  \ (  ( \(  __)(_  _)(  _ \ / _\  / __)(  __)(  _ \
 *     ) D ( )   /(  O )/    / ) _)   )(   )   //    \( (__  ) _)  )   /
 *    (____/(__\_) \__/ \_)__)(____) (__) (__\_)\_/\_/ \___)(____)(__\_)
 *
 */
async function tracerTransform() {
    console.time('FilteringProcess')

    var paintingConfig = {
        wallId: 1,
        gpsLocation: [-99.134982,19.413494],
        dimensions: [30.4, 22.07],
        colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
        droneResolution: 0.1, // default 0.2
    }
    var tracer = new DroneTracer(paintingConfig)

    tracer.transform(
        imageManager.source,
        (progress) => { console.log(`${progress}%`) },
        {
            blurKernel: 3,
            blurSigma: 1.4,
            centerline: false,
            contrastConcatLengthFactor: 2,
            drone: {minimunDistance: 10},
            hysteresisHighThreshold: 50,
            hysteresisLowThreshold: 5,
            traceFilterTolerance: 1
        }
    ).then( (dronePaint) => {
        console.log( 'result path: ', dronePaint.svgFile )
    })

/*
    // read the images
    var imgSource = await readImage(imageManager.source)
    //var imgTrace = await readImage(imageManager.traceSource)

    // decode base64
    imageManager.source = await ImageManager.base64ToImageData(imgSource)
    //imageManager.traceSource = await ImageManager.base64ToImageData(imgTrace)
    //imageManager.differenceSource = imageManager.source

    // canny edge detection
    var grayscaleImg = ImageProcessing.grayscale(imageManager.source)
    var gaussianBlurImg = ImageProcessing.gaussianBlur(grayscaleImg, 2.4, 7)
    var gradient = ImageProcessing.gradient(gaussianBlurImg)
    var nmsuImg = ImageProcessing.nonMaximumSuppression(gradient.sobelImage, gradient.dirMap)
    var hysteresisImg = ImageProcessing.hysteresis(nmsuImg, 50, 10)

    // assign maps to ImageManager
    imageManager.cannyImageData = hysteresisImg
    imageManager.traceSource = ImageProcessing.invert(imageManager.cannyImageData)
    imageManager.differenceSource = nmsuImg
    //imageManager.traceSource = grayscaleImg
    //imageManager.differenceSource = grayscaleImg

    // display source Image
    //displayImage(imgSource)
    background(255)

    console.timeEnd('FilteringProcess')

    //var renderTarget = gaussianBlurImg
    //var renderTarget = gradient.sobelImage
    var renderTarget = nmsuImg
    //var renderTarget = gradient.dirMap
    for (var y = 0; y < renderTarget.length; y++)
        for (var x = 0; x < renderTarget[0].length; x++)
            drawPoint(x,y, color(renderTarget[y][x]))

    // run transformation
    var options = {
        //centerline: false
        //centerline: true,
        //minimunPathLength: 12,
        contrastConcatLengthFactor: 22,
        drone: {minimunDistance: 6}
    }

    console.time('TraceProcess')
    var ltracer = new LineTracer(imageManager, options)
    var traces = ltracer.traceImage()

    console.timeEnd('TraceProcess')

    window.setTimeout(() => {
        // display paths
        for (var trace of traces) {
            //drawPath(trace, color(0))
            drawPath(trace)
        }

        console.log( exportSVG(traces) )
    }, 100) // wait to p5 to refresh
    */

}
