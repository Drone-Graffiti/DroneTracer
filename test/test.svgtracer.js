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
        var imageData = await base64ToImageData(smallImageFile)

	describe('LineTracer', () => {
		it('Should pull out color layer', () => {
            var colorLayer = LineTracer.extractColorLayer(imageData)
            // image width / height + 2 (1 pixel per border)
            colorLayer.length.should.be.equals(5)
            colorLayer[0].length.should.be.equals(5)
            
            colorLayer[2][2].should.be.equals(-1)   // white hole
            colorLayer[1][1].should.be.equals(1)    // black line
		})

		it('Should find analysis edges as nodes', () => {
            var colorLayer = LineTracer.extractColorLayer(imageData)
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
            var colorLayer = LineTracer.extractColorLayer(imageData)
            var nodeLayer = LineTracer.edgeAnalysis(colorLayer)
            var paths = LineTracer.pathNodeScan(nodeLayer)

            // should find one single black path (square shape)
            paths.length.should.be.equals(1)
		})
	})
})
