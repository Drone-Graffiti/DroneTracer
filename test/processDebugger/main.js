//import * as constants from './constants.js'
//import DronePaint from './dronepaint.js'
import { readImage, isAnImageFile } from '/src/DroneTracer/filereader.js'
//import * as helper from './helper.js'
import LineTracer from '/src/DroneTracer/svgtracer.js'
import ImageManager  from '/src/DroneTracer/imagemanager.js'

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

    // read the images
    var imgSource = await readImage(imageManager.source)
    var imgTrace =  await readImage(imageManager.traceSource)

    // decode base64
    imageManager.source =       await ImageManager.base64ToImageData(imgSource)
    imageManager.traceSource =  await ImageManager.base64ToImageData(imgTrace)

    // display source Image
    //displayImage(imgSource)
    background(255)

    // run transformation
    var ltracer = new LineTracer(imageManager)
    ltracer.extractColorLayer()
    ltracer.edgeAnalysis()
    var paths = ltracer.pathNodeScan()
    var traces = ltracer.tracePaths(paths)

    window.setTimeout(() => {
        // display paths
        //for (var path of paths)
            //drawPath(path, color(80, 200, 80))
        for (var trace of traces)
            drawPath(trace, color(0))
    }, 1000) // wait to be transform

}
