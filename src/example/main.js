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

        //
        // Transform the image with DroneTracer
        //
        tracerTransform(file)
    }
}

function handleDragOver(e) {
    // Prevent default behavior (Prevent file from being opened)
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy
}


// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone')
dropZone.addEventListener('dragover', handleDragOver, false)
dropZone.addEventListener('drop', handleFileSelect, false)

//
// UI
//
var preview_zone = document.getElementById('preview_zone')
var display_zone = document.getElementById('display_zone')

document.querySelectorAll('input[type=range]').forEach((el)=>{
    el.oninput = function(e) {
        e.srcElement.setAttribute('value', this.value)
    }
})

const map = function(n, start1, stop1, start2, stop2) {
    var newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    return newval;
}

/*
 *     ____  ____   __   __ _  ____  ____  ____   __    ___  ____  ____
 *    (    \(  _ \ /  \ (  ( \(  __)(_  _)(  _ \ / _\  / __)(  __)(  _ \
 *     ) D ( )   /(  O )/    / ) _)   )(   )   //    \( (__  ) _)  )   /
 *    (____/(__\_) \__/ \_)__)(____) (__) (__\_)\_/\_/ \___)(____)(__\_)
 *
 */
// Painting wall configuration
var paintingConfig = {
  wallId: 1,
  gpsLocation: [-99.134982,19.413494],
  dimensions: [30.4, 22.07],
  colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
  droneResolution: 0.1, // default 0.2
}

// Instance of a drone tracer
var tracer = new DroneTracer(paintingConfig)

function tracerTransform(imagefile) {

    console.time('TransformProcess')
    // Transform image into a flyable drone path
    tracer.transform(
      imagefile, // loaded File API
      (progress) => {
          var progressStatus = parseFloat(progress*100)
          console.log(`progress ${progressStatus}%`)
      }, // log progress
      {
        blurKernel: document.getElementById('range_blur').value*1.0,
        hysteresisHighThreshold: document.getElementById('range_hthreshold').value*1.0,
        hysteresisLowThreshold: document.getElementById('range_lthreshold').value*1.0,
        contrastConcatLengthFactor: document.getElementById('range_distance').value*1.0,
        traceFilterTolerance: document.getElementById('range_smooth').value/10.0,
        centerline: document.getElementById('checkbox_centerline').checked,
        dilationRadius: document.getElementById('range_dilation').value*1.0,
        drone: {
            minimunDistance: 10
        }
      }
    ).then( (dronePaint) => {
        console.timeEnd('TransformProcess')
        preview_zone.innerHTML = dronePaint.svgFile
        preview_zone.children[0].style.width = '100%'
        preview_zone.children[0].style.height = '100%'
        display_zone.innerText = dronePaint.svgFile
    });

}
