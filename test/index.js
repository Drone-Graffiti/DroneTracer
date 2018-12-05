//var assert = require('assert')
var assert = require('chai').assert
var expect = require('chai').expect
var should = require('chai').should()

var DroneTracer = require('../dist/DroneTracer.js')

describe('Library', () => {
	describe('#require', () => {
		it('Shoud load UMD lirary', () => {
			DroneTracer.should.not.be.undefined
		})
		it('Shoud answer to ping', () => {
			DroneTracer.ping().should.be.equals('pong')
		})
	})
})
