var assert = require('chai').assert
var expect = require('chai').expect
var should = require('chai').should()

var DroneTracer = require('../dist/DroneTracer.js')

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
                tracer.transform(image)
            }
            expect(callTransform).to.not.throw()
        })
        it('Should return a Promise', ()=> {
            tracer.transform({}).should.be.a('promise');
        })
    })
})
