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



/*
 * Layer and edge node logic base on jankovicsandras imagetracerjs
 */

export class LineTracer {
    
    // pull out color into layer | Color quantization
    static extractColorLayer(imageData, colorSearch = 0, range = 20) {
        var colorLayer = []

		// Initialize colorLayer with -1
		for(let y = 0; y < imageData.height+2; y++ ){
            colorLayer[y]=[]
            for(let x = 0; x < imageData.width+2 ; x++){
                colorLayer[y][x] = -1
            }
        }

        // loop through all pixels
        for(let y = 0; y < imageData.height; y++ ){
            for(let x = 0; x < imageData.width; x++ ){
                var index = (y*imageData.width+x)*4 // 4 values (RGBA)

                // Linear interpolation | Taxicab geometry
                var difference =
                    Math.abs(colorSearch.r-imageData.data[index]) +
                    Math.abs(colorSearch.g-imageData.data[index+1]) +
                    Math.abs(colorSearch.b-imageData.data[index+2]) +
                    Math.abs(colorSearch.a-imageData.data[index+3])

                // compare difference betweeen seach color and pixel index color
                if(difference < range) arr[y+1][x+1] = this.colorIdentifier
            }
        }

        return colorLayer
    }

	// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
	// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
	// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
	//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15

    // analyse the relationship of each pixel related with the neighbours
    static edgeAnalysis(colorLayer) {
		var nodeLayer = [],
            lh = colorLayer.length,
            lw = colorLayer[0].length

		// Initialize NodeLayer
		for(let y=0; y<lh; y++){
			nodeLayer[y] = []
			for(let x=0; x<lw; x++){
				nodeLayer[y][x]=0
			}
		}

		// Looping through all pixels and calculating edge node type
		for(let y=1; y<lh; y++){
			for(let x=1; x<lw; x++){
			    nodeLayer[y][x] =
					( colorLayer[y-1][x-1]===this.colorIdentifier ? 1 : 0 ) +
					( colorLayer[y-1][x]  ===this.colorIdentifier ? 2 : 0 ) +
					( colorLayer[y][x-1]  ===this.colorIdentifier ? 8 : 0 ) +
					( colorLayer[y][x]    ===this.colorIdentifier ? 4 : 0 )
			}
		}

		return nodeLayer
	}
}

