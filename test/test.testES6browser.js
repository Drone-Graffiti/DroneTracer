var assert = chai.assert
var expect = chai.expect
var should = chai.should()

import {defaultPaintingConfig} from '/src/DroneTracer/constants.js'

describe('Test Browser ES6 enviroment', () => {
	describe('chai', () => {
        it('Should load | assert expect and should |', () => {
            var n = 1
            assert(n == 1)
            expect(n).to.be.equals(1)
            n.should.be.equals(1)
        })
    })
	describe('import module', () => {
		it('Shoud load import', () => {
            defaultPaintingConfig.should.not.be.undefined
		})
	})
})
