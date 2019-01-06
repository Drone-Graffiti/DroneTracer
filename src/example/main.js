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
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);


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

    // Transform image into a flyable drone path
    tracer.transform(
      imagefile, // loaded File API
      (progress) => { console.log(`${progress}%`) }, // log progress
      {
        size: [5,8], // graffiti size in meters | default 4mx3m
        color: 2  // default 0. Color id from the paintingConfig color list
      }
    ).then( (dronePaint) => {
      /* The dronePaint object, provides functions to access and modify
       * related information to the svg for the drone.
       * This functions does not affect the transformation process.
       */
      //dronePaint.setPaintingPosition(12.1, 0.85) // default: middle of the wall
      //dronePaint.setPaintingScale(2.5) // post-scale the svg
      //dronePaint.setPaintingData('dataName', 'datAvalue')

      console.log( 'result path: ', dronePaint.svgFile )
      //console.log( 'image source: ', dronePaint.sourceImage )
      //console.log( 'painting time: ', dronePaint.estimatedTime )
    });

}
