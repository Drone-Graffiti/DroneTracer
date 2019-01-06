var assert = chai.assert
var expect = chai.expect
var should = chai.should()

import LineTracer from '/src/DroneTracer/tracer.js'
import ImageManager from '/src/DroneTracer/imagemanager.js'

describe('svg Tracing', async () => {
        var smallImageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAACXBIWXMAAFxGAABcRgEUlENBAAAAHUlEQVQIHWNkYGD4D8RgwAQi//+H8BlBbLAwkAAAaCcFAP1akycAAAAASUVORK5CYII=`
        var smallImageData = await ImageManager.base64ToImageData(smallImageFile)

        var mediumImageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAACXBIWXMAAFxGAABcRgEUlENBAAAAMklEQVQIHWP8DwQMWAALSIyRkRFFCqSWCSYC4iBrhkvAdMEkwRIwDkw3iAYZDrYcXRIABIgW/EUU+SMAAAAASUVORK5CYII=`
        var mediumImageData = await ImageManager.base64ToImageData(mediumImageFile)

        var complexImageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAFxGAABcRgEUlENBAAAAb0lEQVQoFXWR0RKAIAgEpen/f7lam3XULl4E7ha06nqihaiqlqQTL+IemBPUAcxp2j6EegCz6MY0JALJ6MCDxPva9HSTNWcHSP4gtDkGMDfJ0xei/3mD1/Ad1pjpLYAmRCJtWYDXln+kWgQQ920CNzv4Lh5m/AjgAAAAAElFTkSuQmCC`
        var complexImageData = await ImageManager.base64ToImageData(complexImageFile)

	describe('LineTracer', () => {
		it('Should pull out color layer', () => {
            var imgm = new ImageManager()
            imgm.source = smallImageData
            imgm.traceSource = smallImageData

            var ltracer = new LineTracer(imgm)
            var colorLayer = ltracer.extractColorLayer()

            // image width / height + 2 (1 pixel per border)
            colorLayer.length.should.be.equals(5)
            colorLayer[0].length.should.be.equals(5)
            
            colorLayer[2][2].should.be.equals(-1)   // white hole
            colorLayer[1][1].should.be.equals(1)    // black line
		})

		it('Should find analysis edges as nodes', () => {
            var imgm = new ImageManager()
            imgm.source = smallImageData
            imgm.traceSource = smallImageData
            imgm.differenceSource = imgm.source

            var ltracer = new LineTracer(imgm)
            ltracer.extractColorLayer()
            var nodeLayer = ltracer.edgeAnalysis()

            // same side as colorLayer
            nodeLayer.length.should.be.equals(5)
            nodeLayer[0].length.should.be.equals(5)

            nodeLayer[1][1].should.be.equals(4)     // top corner
            nodeLayer[2][2].should.be.equals(11)    // top inside corner
            nodeLayer[4][4].should.be.equals(2)     // bottom corner
            nodeLayer[1][2].should.be.equals(12)     // bottom corner
		})

		it('Should find path', async () => {
            var imgm = new ImageManager()
            imgm.source = smallImageData
            imgm.traceSource = smallImageData
            imgm.differenceSource = imgm.source

            var ltracer = new LineTracer(imgm, {minimunPathLength: 4})
            ltracer.extractColorLayer()
            ltracer.edgeAnalysis()
            var paths = ltracer.pathNodeScan()

            // should find one single black path (square shape)
            paths.length.should.be.equals(1)
            var expected_path = [
                {x: 1, y: 1, t: 4},
                {x: 2, y: 1, t: 12},
                {x: 3, y: 1, t: 12},
                {x: 3, y: 2, t: 7},
                {x: 3, y: 3, t: 13},
                {x: 2, y: 3, t: 14},
                {x: 1, y: 3, t: 5},
                {x: 1, y: 2, t: 5}
            ]
            paths[0].should.be.eql(expected_path)
		})

		it('Should find 2 directions path', async () => {
            var imgm = new ImageManager()
            imgm.source = mediumImageData
            imgm.traceSource = mediumImageData
            imgm.differenceSource = imgm.source

            var ltracer = new LineTracer(imgm, {minimunPathLength: 4})
            ltracer.extractColorLayer()
            ltracer.edgeAnalysis()
            var paths = ltracer.pathNodeScan()

            paths.length.should.be.equals(1)
            var expected_path = [
                {x: 1, y: 6, t: 4},
                {x: 2, y: 6, t: 12},
                {x: 3, y: 5, t: 7},
                {x: 2, y: 4, t: 5},
                {x: 2, y: 3, t: 5},
                {x: 2, y: 2, t: 4},
                {x: 3, y: 2, t: 12},
                {x: 4, y: 2, t: 12},
                {x: 5, y: 2, t: 12},
                {x: 5, y: 3, t: 7}
            ]
            paths[0].should.be.eql(expected_path)
		})

		it('Should find complex path', async () => {
            var imgm = new ImageManager()
            imgm.source = complexImageData
            imgm.traceSource = complexImageData
            imgm.differenceSource = imgm.source

            var ltracer = new LineTracer(imgm, {minimunPathLength: 4})
            ltracer.extractColorLayer()
            ltracer.edgeAnalysis()
            var paths = ltracer.pathNodeScan()

            paths.length.should.be.equals(2)
            paths[0].length.should.be.equals(22)
            paths[1].length.should.be.equals(8)
            var expected_path = [
                {x: 8, y: 6, t: 4},
                {x: 8, y: 7, t: 5},
                {x: 7, y: 8, t: 4},
                {x: 6, y: 9, t: 12},
                {x: 5, y: 9, t: 14},
                {x: 4, y: 9, t: 5},
                {x: 4, y: 8, t: 5},
                {x: 4, y: 7, t: 6},
                {x: 3, y: 6, t: 6},
                {x: 2, y: 5, t: 5},
                {x: 2, y: 4, t: 5},
                {x: 2, y: 3, t: 5},
                {x: 2, y: 2, t: 4},
                {x: 3, y: 2, t: 12},
                {x: 4, y: 2, t: 12},
                {x: 5, y: 2, t: 12},
                {x: 6, y: 2, t: 12},
                {x: 7, y: 1, t: 4},
                {x: 8, y: 2, t: 6},
                {x: 8, y: 3, t: 5},
                {x: 7, y: 4, t: 12},
                {x: 6, y: 4, t: 4}
            ]
            paths[0].should.be.eql(expected_path)

            expected_path = [
                {x: 6, y: 12, t: 5},
                {x: 6, y: 11, t: 4},
                {x: 7, y: 11, t: 12},
                {x: 8, y: 11, t: 13},
                {x: 8, y: 10, t: 4},
                {x: 9, y: 9, t: 4},
                {x: 10, y: 9, t: 12},
                {x: 11, y: 9, t: 12}
            ]
            paths[1].should.be.eql(expected_path)
		})

		it('Should Contrast Path finder', async () => {

            var lineImageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAFxGAABcRgEUlENBAAACpUlEQVR4Ae2cYU/CQBBErfH//2VljZdcDq/AzVQG+5oQS+nuTd9jK/qB7fOyvbHFEHiPSUKQbwIICXsjIAQhYQTC4jAhCAkjEBaHCUFIGIGwOEwIQsIIhMVhQhASRiAsDhOCkDACYXGYEISEEQiLw4QgJIxAWBwmBCFhBMLiMCEICSMQFocJQUgYgbA4TAhCwgiExWFCEBJGICwOE4KQMAJhcZgQhIQRCIvDhCAkjEBYHCYEIWEEwuIwIQgJIxAWhwlBSBiBsDhMCELCCITFYUIQEkYgLA4TgpAwAmFxmBCEhBEIi8OEICSMQFgcJiRMyEdYnqfG2bbt1/X/8mspEfKjoGTMwDdRs9d7i3t9+vNm+9yyLmRuQSwR9WhiZjBv9ZnV9ce3y0Kn/prYRyE2KUdhO/WEPCqj3skloh5NTP/uduyfVsiKjB44E9LTEPdVGeLyu+Wnm5BkGWVq6WOv86KqV78ddSuoNZy5+8zO/SUhzgCjgCZoPK6u+Qoy6hqXblkFq4FTQY311dvd/1VkLAsZIR7x3Cmler3KtjQhdXFOYDNYbY2jpnG27jOPLwup0A2Y4wJm0GsN5zqOrEf2ePov9SaioO9to5Rb5+/1Sn7N8r+se6H2IFZqfqtvx/6LIIuQBqVBruczQO2c2eut11l/Wm9ZPeQGfgTbnzO+xvPFv9TvAQf4eyhdnyN9yrpuxxGVAEJUguZ6hJiBqu0QohI01yPEDFRthxCVoLkeIWagajuEqATN9QgxA1XbIUQlaK5HiBmo2g4hKkFzPULMQNV2CFEJmusRYgaqtkOIStBcjxAzULUdQlSC5nqEmIGq7RCiEjTXI8QMVG2HEJWguR4hZqBqO4SoBM31CDEDVdshRCVorkeIGajaDiEqQXM9QsxA1XZfErOXq2XeV8YAAAAASUVORK5CYII=`
            var lineImageData = await ImageManager.base64ToImageData(lineImageFile)
            var photoImageFile = `data:image/png;base64,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`
            var photoImageData = await ImageManager.base64ToImageData(photoImageFile)

            var imgm = new ImageManager()
            imgm.source = photoImageData
            imgm.traceSource = lineImageData
            imgm.differenceSource = imgm.source

            var ltracer = new LineTracer(imgm)
            ltracer.extractColorLayer()
            ltracer.edgeAnalysis()
            var paths = ltracer.pathNodeScan()
            console.log(paths)

		}).timeout(10000)
	})
})