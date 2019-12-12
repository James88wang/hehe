import 'chai'
import { expect, assert } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"
import { doesNotReject, AssertionError } from 'assert'
import { watchFile } from 'fs'

const a: number = 0
const dbPath: string = 'db_test'
var dbMet: MetricsHandler

describe('Metrics', function () {
  before(function () {
    LevelDB.clear(dbPath)
    dbMet = new MetricsHandler(dbPath)
  })

  describe('#getAll', function () {
    it('should get empty array on non existing group', function () {
      dbMet.getAll("0", function (err: Error | null, result?: Metric[]) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })
  })

  describe('#save', function () {
    it('should save One ', function () {
        let myMetric = new Metric("heni", "ripsa", "1888-88-88", 8)
        dbMet.save(myMetric, function (err: Error | null) {
            expect(err).to.be.undefined
        })
    })
    it('should update existing data', function(){
        dbMet.updateOne("heni|ripsa|1888-88-88", 123, function (err: Error | null) {
            expect(err).to.be.null
        })
    })
  })

  describe('#getOne', function () {
    it('should get One', function () {
        dbMet.getOne("heni", "ripsa", function (err: Error | null, result?: Metric[]) {
            // assert.equal(err,null)
            expect(err).to.be.null
            expect(result).to.not.be.null
            expect(result).to.not.be.empty
        })
    })
  })

  describe('#delete', function () {
    it('should delete data ', function () {
        dbMet.delOne("heni|ripsa|1888-88-88", function (err: Error | null) {
            expect(err).to.be.null
        })
    })
    it('should not fail if data does not exist', function(){
        dbMet.delOne("heni|ripsa|1888-88-88", function (err: Error | null) {
            expect(err).to.be.null
        })
    })
  })

  describe('#getOne', function () {
    it('should not get data deleted', function () {
        dbMet.getOne("heni", "ripsa", function (err: Error | null, result?: Metric[]) {
            // assert.equal(err,null)
            expect(err).to.be.null
            expect(result).to.be.empty
        })
    })
  })

  after(function () {
    dbMet.close()
  })
})

