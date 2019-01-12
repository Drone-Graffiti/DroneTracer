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

var uiControlsEl = document.getElementById('uiControls')

var createUiElement = function(type, name, classname = '', value = false) {
    var el
    switch (type) {
        case 'label':
            el = document.createElement(type)
            el.innerText = name
            break;
        case 'div':
            el = document.createElement(type)
            break;
        case 'span':
            el = document.createElement(type)
            break;
        default:
            el = document.createElement('input')
            el.type = type
            el.name = name
    }
    el.id = `${type}_${name}`
    el.className = classname
    if (value) el.value = value

    if (type === 'checkbox') {
        var wrap = createUiElement('div', '', 'center')
        wrap.appendChild( createUiElement('label', '', 'switch') )
        wrap.children[0].appendChild(el)
        wrap.children[0].appendChild( createUiElement('span', '', 'slider round') )
        return wrap
    }
    return el
}

var dronePaintObj = {}
var changeColor = function(val) {
    dronePaintObj.setPaintingColor(val)
    preview_zone.innerHTML = dronePaintObj.svgFile
    preview_zone.children[0].style.width = '100%'
    preview_zone.children[0].style.height = '100%'
    display_zone.innerText = dronePaintObj.svgFile
}
var renderUI = function(list) {
    uiControlsEl.innerHTML = ''
    console.log(list)

    for (var el of list) {
        if (el.type === 'group') {
            var divEl = createUiElement('div', el.label, 'group')
            for (let gEl of el.nested) {
                if( el.label === 'Colors') {
                    var bEl = createUiElement('div', '', 'block')
                    bEl.appendChild( createUiElement('label', gEl.value) )
                    bEl.appendChild( createUiElement(gEl.type, gEl.name, '', gEl.value) )
                    divEl.appendChild(bEl)
                    divEl.className = 'group center'
                }
                else {
                    divEl.appendChild( createUiElement('label', gEl.label, 'center') )
                    divEl.appendChild( createUiElement(gEl.type, gEl.name, 'center', gEl.value) )
                }
            }
            uiControlsEl.appendChild(divEl)
        }
        else {
            var labelEl = createUiElement('label', el.label, 'center')
            var inputEl = createUiElement(el.type, el.name, 'center')
        
            uiControlsEl.appendChild(labelEl)
            uiControlsEl.appendChild(inputEl)
        }
    }


    // update range UI
    document.querySelectorAll('input[type=range]').forEach((el)=>{
        el.setAttribute('value', el.value)
        el.oninput = function(e) {
            e.srcElement.setAttribute('value', this.value)
        }
    })

    // call color change
    document.querySelectorAll('input[type=radio]').forEach((el)=>{
        var value = el.value
        el.onchange = function(e) {
            changeColor(value)
        }
    })
}

/*
 *     ____  ____   __   __ _  ____  ____  ____   __    ___  ____  ____
 *    (    \(  _ \ /  \ (  ( \(  __)(_  _)(  _ \ / _\  / __)(  __)(  _ \
 *     ) D ( )   /(  O )/    / ) _)   )(   )   //    \( (__  ) _)  )   /
 *    (____/(__\_) \__/ \_)__)(____) (__) (__\_)\_/\_/ \___)(____)(__\_)
 *
 */

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
        centerline: document.getElementById('checkbox_centerline').checked,
        blurKernel: document.getElementById('range_blurKernel').value*1.0,
        hysteresisHighThreshold: document.getElementById('range_hysteresisHighThreshold').value*1.0,
        binaryThreshold: document.getElementById('range_binaryThreshold').value*1.0,
        dilationRadius: document.getElementById('range_dilationRadius').value*1.0,
      }
    ).then( (dronePaint) => {
        dronePaintObj = dronePaint
        console.timeEnd('TransformProcess')
        preview_zone.innerHTML = dronePaint.svgFile
        preview_zone.children[0].style.width = '100%'
        preview_zone.children[0].style.height = '100%'
        display_zone.innerText = dronePaint.svgFile
    });

}


// Painting wall configuration
var paintingConfig = {
    wallId: 'MX19-001',
    gpsLocation: [0,0],
    wallSize: [30000, 20000], // in meters
    canvasSize: [20000, 20000], // meters
    canvasPosition: [10000, 0], // meters (origin = [bottom left])
    colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
    droneResolution: 200, // in meters
}

// Instance of a drone tracer
var tracer = new DroneTracer(paintingConfig)

renderUI(tracer.uiParameters)


