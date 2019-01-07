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

	describe('Gaussian Blur', () => {
		it('Shoud return a Gaussian Blur array', () => {
            var grayscaleImg = ImageProcessing.grayscale(imageData)
            var gaussianBlurImg = ImageProcessing.gaussianBlur(grayscaleImg)
            gaussianBlurImg.length.should.be.equals(imageData.height)
            gaussianBlurImg[0].length.should.be.equals(imageData.width)

            var expected_image = [
                [114.27492999999997,186.72557143000003,166.66568641292997,147.61364729282943,123.46381778203856,93.30046695130429,76.64514270801601,74.06730048920969,76.18684289056232,90.97881370649786],
                [121.00970799807547,189.56660952478143,169.85238390487459,149.76512944143985,126.15675249851583,96.51061350334292,79.62374576813922,76.07869471256923,77.05828100740396,90.99126535766717],
                [232.37129363718407,218.2392376414254,202.17959604202434,141.3680441777598,129.0395696844371,118.52218148022645,45.170042892024625,41.45406965205647,33.48501550697741,74.4043557498391]
            ]
            expect(gaussianBlurImg).to.be.eql(expected_image)
        })
	})
})
