//import * as constants from './constants.js'
import DroneTracer from '/src/DroneTracer/main.js'
import { readImage, isAnImageFile } from '/src/DroneTracer/filereader.js'
import LineTracer from '/src/DroneTracer/tracer.js'
import ImageManager from '/src/DroneTracer/imagemanager.js'
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
        wallId: 'MX19-002',
        gpsLocation: [0, 0],
        wallSize: [30000, 20000], // in millimeters
        canvasSize: [20000, 20000], // millimeters
        canvasPosition: [100, 0], // (origin = [bottom left])
        colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
        droneResolution: 200, 
    }
    var tracer = new DroneTracer(paintingConfig)

    tracer.transform(
        imageManager.source,
        (progress) => { console.log(`${progress}%`) },
        {
            centerline: false,
            //centerline: true,
            blurKernel: 3,
            traceFilterTolerance: 1.2
        }
    ).then( (dronePaint) => {
        console.log( 'result path: ', dronePaint.svgFile )
    })

/*
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
