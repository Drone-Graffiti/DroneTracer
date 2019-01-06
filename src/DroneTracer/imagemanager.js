import * as helper from './helper.js'

export default class ImageManager {
    constructor() {
        // Properties defaults
        this.sourceImageData = undefined // original source image
        this.traceSource = undefined // data to be traced
        this.cannyImageData = undefined
        this.differenceSource = undefined // map used for finding paths through contrast
        this.colorLayer = []
        this.nodeLayer = []
        this.tracedMap = []
    }


    initColorLayer() {
        if (this.source === 'undefined') helper.throw('Source imageData is required')

        // Initialize colorLayer with -1
        // add border (1/side = +2)
        for(let y = 0; y < this.source.height+2; y++) {
            this.colorLayer[y]=[]
            for(let x = 0; x < this.source.width+2 ; x++) {
                this.colorLayer[y][x] = -1
            }
        }
    }

    initNodeLayer() {
        if (this.colorLayer === 'undefined') helper.throw('Color Layer has to be initialized')

        var lh = this.colorLayer.length
        var lw = this.colorLayer[0].length

        // Initialize nodeLayer
        for(let y = 0; y < lh; y++) {
            this.nodeLayer[y] = []
            for(let x = 0; x < lw; x++) {
                this.nodeLayer[y][x]=0
            }
        }
    }

    initTracedMap() {
        if (this.source === 'undefined') helper.throw('Source imageData is required')

        for(let y = 0; y < this.source.height+2; y++) {
            this.tracedMap[y]=[]
            for(let x = 0; x < this.source.width+2 ; x++) {
                this.tracedMap[y][x] = 0
            }
        }
    }


    // getters and setters
    get source() {
        return this.sourceImageData
    }

    set source(sourceImage) {
        this.sourceImageData = sourceImage
    }

    static  base64ToImageData(base64) {
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


}
