// load in Webpack Node and Browser
import '../libs/imagetracer.js'
import * as ImageTracer from '../libs/imagetracer.js'

var tracer = {}
if (ImageTracer.versionnumber === undefined)
    tracer = self.ImageTracer
else
    tracer = ImageTracer


export const base64ToImageData = function(base64) {
    return new Promise( async (resolve) => {
        var image = new Image()

        image.onload = function() {
            var canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height

            var context = canvas.getContext('2d')
            context.drawImage(image, 0, 0)

            var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            resolve(imageData)
        }

        image.src = base64
    })
}

// TEMP using imagetracer by jankovicsandras
export const trace = function(imageData) {
    return tracer.imagedataToSVG(imageData)
}


