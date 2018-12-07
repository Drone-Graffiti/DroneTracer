// TODOD: test Library and test src files | test DronePaint , tracing logic
var assert = require('chai').assert
var expect = require('chai').expect
var should = require('chai').should()
var fileAPI = require('./file')


require('@babel/polyfill')
// use non polyfill version
var DroneTracer = require('../build/DroneTracer.js')

var imageFile = fileAPI.createFile('ufo.jpg')

describe('Library', () => {
	describe('#require', () => {
		it('Shoud load UMD lirary', () => {
			DroneTracer.should.not.be.undefined
		})
		it('Default should be exposed', () => {
            expect(DroneTracer.default).to.be.undefined
		})
	})

    describe('#DroneTracer class', () => {
        it('Should check constructor options', ()=> {
            let construct = function() {
                new DroneTracer({gpsLocation: [0,0], dimensions: [0,0]})
            }
            expect(construct).to.throw()

            var tracer = new DroneTracer({wallId: 12, gpsLocation: [0,0], dimensions: [0,0]})
            tracer.paintingConfig.wallId.should.be.equals(12)
        })
    })

    describe('#Transform', () => {
        var tracer = new DroneTracer({wallId: 1, gpsLocation: [0,0], dimensions: [0,0]})
        it('Should check parameters', () => {
            expect(tracer.transform).to.throw()

            var callTransform = function() {
                var image = {}
                tracer.transform(imageFile)
            }
            expect(callTransform).to.not.throw()
        })
        it('Should return a Promise', ()=> {
            tracer.transform(imageFile).should.be.a('promise');
        })
        // TODO; find bug on no promise response (nested promise)
        // solution for async + polyfill
/*
 *        it('Transform should return a valid DronePaint instance', async ()=> {
 *            var image = imageFile
 *            var dronePaint = await tracer.transform(image)
 *            console.log('[test], after await')
 *
 *            // TODO: check with DronePaint object
 *
 *            //console.log('DronePaint', dronePaint)
 *            dronePaint.should.not.be.undefined
 *            //dronePaint.sourceImage.should.be.equals(image)
 *            dronePaint.estimatedTime.should.be.equals(1000)
 *        }).timeout(10000)
 */
    })

/*
 *    describe('#DronePaint object', () => {
 *        var tracer = new DroneTracer({wallId: 1, gpsLocation: [0,0], dimensions: [0,0]})
 *
 *        it('Should not accept negative scaling factors', async ()=> {
 *            var dronePaint = await tracer.transform(imageFile)
 *
 *            dronePaint.setPaintingScale(2)
 *            dronePaint.setPaintingScale(0.3)
 *            dronePaint.paintingScale.should.be.equals(2)
 *        }).timeout(10000)
 *    })
 */
})
