var assert = chai.assert
var expect = chai.expect
var should = chai.should()

import ImageManager from '/src/DroneTracer/imagemanager.js'
import imageFile from '/files/base64File.js'


describe('Image Decoder', () => {
	describe('base64 to Image', () => {
		it('Shoud return a canvas imageData', async () => {
            var imageData = await ImageManager.base64ToImageData(imageFile)
            expect(imageData.width).to.be.equals(160)
            expect(imageData.height).to.be.equals(111)
        }).timeout(1000)
	})
})

describe('ImageManager', () => {
	describe('# Class structure', () => {
		it('Getter, Setter, abstraction', () => {
            var imgm = new ImageManager()
            const testObj = {txt: 'hello world'}
            imgm.source = testObj 
            imgm.source.should.be.equals(testObj)
		})
    })
})
