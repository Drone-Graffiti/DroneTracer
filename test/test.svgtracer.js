var assert = chai.assert
var expect = chai.expect
var should = chai.should()

import {base64ToImageData, LineTracer} from '/src/DroneTracer/svgtracer.js'
import imageFile from '/files/base64File.js'

describe('Image Decoder', () => {
	describe('base64 to Image', () => {
		it('Shoud return a canvas imageData', async () => {
            var imageData = await base64ToImageData(imageFile)
            expect(imageData.width).to.be.equals(160)
            expect(imageData.height).to.be.equals(111)
        }).timeout(1000)
	})
})

describe('svg Tracing', async () => {
        var smallImageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAACXBIWXMAAFxGAABcRgEUlENBAAAAHUlEQVQIHWNkYGD4D8RgwAQi//+H8BlBbLAwkAAAaCcFAP1akycAAAAASUVORK5CYII=`
        var smallImageData = await base64ToImageData(smallImageFile)

        var mediumImageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAACXBIWXMAAFxGAABcRgEUlENBAAAAMklEQVQIHWP8DwQMWAALSIyRkRFFCqSWCSYC4iBrhkvAdMEkwRIwDkw3iAYZDrYcXRIABIgW/EUU+SMAAAAASUVORK5CYII=`
        var mediumImageData = await base64ToImageData(mediumImageFile)

        var complexImageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAFxGAABcRgEUlENBAAAAb0lEQVQoFXWR0RKAIAgEpen/f7lam3XULl4E7ha06nqihaiqlqQTL+IemBPUAcxp2j6EegCz6MY0JALJ6MCDxPva9HSTNWcHSP4gtDkGMDfJ0xei/3mD1/Ad1pjpLYAmRCJtWYDXln+kWgQQ920CNzv4Lh5m/AjgAAAAAElFTkSuQmCC`
        var complexImageData = await base64ToImageData(complexImageFile)

	describe('LineTracer', () => {
		it('Should pull out color layer', () => {
            var colorLayer = LineTracer.extractColorLayer(smallImageData)
            // image width / height + 2 (1 pixel per border)
            colorLayer.length.should.be.equals(5)
            colorLayer[0].length.should.be.equals(5)
            
            colorLayer[2][2].should.be.equals(-1)   // white hole
            colorLayer[1][1].should.be.equals(1)    // black line
		})

		it('Should find analysis edges as nodes', () => {
            var colorLayer = LineTracer.extractColorLayer(smallImageData)
            var nodeLayer = LineTracer.edgeAnalysis(colorLayer)
            // same side as colorLayer
            nodeLayer.length.should.be.equals(5)
            nodeLayer[0].length.should.be.equals(5)

            nodeLayer[1][1].should.be.equals(4)     // top corner
            nodeLayer[2][2].should.be.equals(11)    // top inside corner
            nodeLayer[4][4].should.be.equals(2)     // bottom corner
            nodeLayer[1][2].should.be.equals(12)     // bottom corner
		})

		it('Should find path', async () => {
            var colorLayer = LineTracer.extractColorLayer(smallImageData)
            var nodeLayer = LineTracer.edgeAnalysis(colorLayer)
            var paths = LineTracer.pathNodeScan(nodeLayer)

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
            var colorLayer = LineTracer.extractColorLayer(mediumImageData)
            var nodeLayer = LineTracer.edgeAnalysis(colorLayer)
            var paths = LineTracer.pathNodeScan(nodeLayer)

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
            var colorLayer = LineTracer.extractColorLayer(complexImageData)
            var nodeLayer = LineTracer.edgeAnalysis(colorLayer)
            var paths = LineTracer.pathNodeScan(nodeLayer)

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
	})
})
