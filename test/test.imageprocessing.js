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
                [66.67528,87.23401928000001,94.43987090328001,85.74084016798729,67.77545781379527,50.77372111505507,40.61534263160582,37.33198759769905,28.964979730115278,21.92582148254614],
                [66.08239353867808,85.13907939225429,90.60504476843273,80.13308333197985,63.22288441196228,45.861426552323664,34.865851781527155,29.852674128395694,21.15383792777295,15.204122521766289],
                [55.99359741294395,60.993882826592326,61.37794782485488,52.8596162361468,43.44795477848807,31.44424446770945,19.13694600881765,17.53600765830795,14.39400805597489,11.412977570205406]
            ]
            expect(gaussianBlurImg).to.be.eql(expected_image)
        })
	})
})
