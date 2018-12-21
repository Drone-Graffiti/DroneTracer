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

        var complexImageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAFxGAABcRgEUlENBAAAAbklEQVQoFX2QWw7AIAgEpen9r2w7mjUU1/KhPHYAjf5aMxYRzZVutBSrIXbQABC7brUJ8QJyURNdEws4oRpeONpXSd2apJh7ADgniFq2BeQkvvsh8tsbtIbeoRgxuQ8gEUXMTTmuNJH9/AXqRPAHLfouF64EwTYAAAAASUVORK5CYII=`
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

            // should find one single black path (square shape)
            paths.length.should.be.equals(1)
            var expected_path = [
                {x: 1, y: 6, t: 4},
                {x: 2, y: 6, t: 12},
                {x: 3, y: 5, t: 7},
                {x: 3, y: 4, t: 14},
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

            // should find one single black path (square shape)
            paths.length.should.be.equals(2)
            // TODO: fix bug 1 - 6 - 10
            //paths[0].length.should.be.equals(22)
            //paths[1].length.should.be.equals(5)
            //var expected_path = [
            //]
            //paths[0].should.be.eql(expected_path)
		})
	})
})
