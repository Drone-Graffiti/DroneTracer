var assert = chai.assert
var expect = chai.expect
var should = chai.should()

import * as ImageProcessing from '/src/DroneTracer/imageprocessing.js'
import ImageManager from '/src/DroneTracer/imagemanager.js'

var imageFile = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAADCAYAAACqPZ51AAAACXBIWXMAAFxGAABcRgEUlENBAAAASklEQVQIHWP4xcD///clxv/B3xj+Mz+2+c+wYeZ/hpQ7/2UN/v+PFvn/fyHDu///GVb9Z2IgEjD+BwKY2vr6ehiToampCc4GKQAASEQftX2O/s8AAAAASUVORK5CYII=`
var imageData
ImageManager.base64ToImageData(imageFile).then(data=>imageData=data)

describe('Image Processing', () => {
	describe('Gray Scale', () => {
		it('Shoud return a grayscale array', () => {
            var grayscaleImg = ImageProcessing.grayscale(imageData)
            grayscaleImg.length.should.be.equals(imageData.height)
            grayscaleImg[0].length.should.be.equals(imageData.width)

            var expected_image = [
                [76.65,199.31,170.04,141.43,120.66999999999999,83.2,65.07,67.15,74.47999999999999,95.2],
                [76.65,199.31,170.04,141.43,120.66999999999999,83.2,65.07,67.15,74.47999999999999,95.2],
                [255,255,255,125.99999999999999,125.99999999999999,125.99999999999999,0,0,0,76.5]
            ]
            expect(grayscaleImg).to.be.eql(expected_image)
        })
	})

	describe('Invert', () => {
		it('Shoud return an inverted image array', () => {
            var imageData = [
                [  0,   0,   0,   0],
                [255, 255, 255, 255],
                [100, 200,  50, 150]
            ]
            var invertedImg = ImageProcessing.invert(imageData)
            var expected_image = [
                [255, 255, 255, 255],
                [  0,   0,   0,   0],
                [155,  55, 205, 105]
            ]

            expect(invertedImg).to.be.eql(expected_image)
        })
	})

	describe('Gaussian Blur', () => {
		it('Shoud return a Gaussian Blur array', () => {
            var grayscaleImg = ImageProcessing.grayscale(imageData)

            var gaussianBlurImg = ImageProcessing.gaussianBlur(grayscaleImg)
            gaussianBlurImg.length.should.be.equals(imageData.height)
            gaussianBlurImg[0].length.should.be.equals(imageData.width)

            var expected_image = [
                [
                    114.27492999999997,186.72557143000003,166.66568641292997,
                    147.61364729282943,120.08505778203856,87.80335019130429,
                    69.53080811325601,66.03643187123693,67.82836954185007,84.1465276896126
                ],
                [
                    121.00970799807547,189.56660952478143,169.7307485448746,149.40222811471983,
                    121.10258345868176,88.27045805960857,68.8658184703041,63.89126958524633,
                    64.65587670726092,80.95142705389664
                ],
                [
                    232.36691476422408,218.2202330092225,201.8786408985867,140.51798328507923,
                    122.48783957137809,104.38265938144487,40.96311351474241,37.10445261063525,
                    29.974370012752228,71.72975718832012
                ]
            ]
            expect(gaussianBlurImg).to.be.eql(expected_image)
        })
	})

	describe('thresholdFilter', () => {
		it('Shoud return an absolute 0 | 255 array image', () => {
            var grayscaleImg = ImageProcessing.grayscale(imageData)

            var thresholdImg = ImageProcessing.thresholdFilter(grayscaleImg, 30)
            thresholdImg.length.should.be.equals(imageData.height)
            thresholdImg[0].length.should.be.equals(imageData.width)
            var expected_image = [
                [255, 255, 255, 255, 255, 255, 0, 0, 0, 255],
                [255, 255, 255, 255, 255, 255, 0, 0, 0, 255],
                [255, 255, 255, 255, 255, 255, 0, 0, 0, 0]
            ]
            expect(thresholdImg).to.be.eql(expected_image)

            thresholdImg = ImageProcessing.thresholdFilter(grayscaleImg, 80)
            var expected_image = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [255, 255, 255, 0, 0, 0, 0, 0, 0, 0]
            ]
            expect(thresholdImg).to.be.eql(expected_image)
        })
	})

	describe('Dilation', () => {
		it('Shoud return a dilated image array', () => {
            var imageData = [
                [255,  0,  0,  0,  0,  0,255,255,255,255,  0,255],
                [255,  0,255,255,255,255,255,255,255,255,  0,255],
                [255,  0,255,255,255,255,255,255,255,255,  0,255],
                [255,  0,255,255,255,255,255,255,  0,  0,  0,255],
                [255,255,255,255,255,255,255,  0,  0,  0,255,255],
                [255,255,255,255,255,255,  0,  0,  0,  0,255,255],
                [255,255,255,255,255,  0,255,  0,  0,255,255,255],
                [255,255,255,255,  0,255,255,  0,  0,255,255,255],
                [255,255,  0,  0,255,255,255,  0,  0,255,255,255],
                [255,255,255,255,255,255,255,  0,  0,255,255,  0],
            ]
            var dilatedImg = ImageProcessing.dilation(imageData, 1)
            var expected_image = [
                [  0,  0,  0,  0,  0,  0,  0,255,255,  0,  0,  0],
                [  0,  0,  0,  0,  0,  0,  0,255,255,  0,  0  ,0],
                [  0,  0,  0,255,255,255,255,  0,  0,  0,  0,  0],
                [  0,  0,  0,255,255,255,  0,  0,  0,  0,  0,  0],
                [  0,  0,  0,255,255,  0,  0,  0,  0,  0,  0,  0],
                [255,255,255,255,  0,  0,  0,  0,  0,  0,  0,255],
                [255,255,255,  0,  0,  0,  0,  0,  0,  0,  0,255],
                [255,  0,  0,  0,  0,  0,  0,  0,  0,  0,255,255],
                [255,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
                [255,  0,  0,  0,  0,255,  0,  0,  0,  0,  0,  0]
            ]

            expect(dilatedImg).to.be.eql(expected_image)
        })
	})

	describe('screen', () => {
		it('Should return an array image masked by a map', () => {
            var imgSource = [
                [255, 0, 0, 0, 0, 255, 255, 255, 0],
                [255, 0, 0, 0, 0, 0,    0,  255, 0],
                [255, 0, 0, 0, 0, 255, 255, 255, 0]
            ]
            var imgMap = [
                [255, 255, 255, 255, 255, 255, 255, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [255, 255, 0, 0, 0, 255, 255, 255, 255]
            ]

            var screenImg = ImageProcessing.screen(imgSource, imgMap)

            var expected_image = [
                [255, 255, 255, 255, 255, 255, 255, 255, 0],
                [255, 0, 0, 0, 0, 0,    0,  255, 0],
                [255, 255, 0, 0, 0, 255, 255, 255, 255]
            ]
            expect(screenImg).to.be.eql(expected_image)
        })
	})
})
