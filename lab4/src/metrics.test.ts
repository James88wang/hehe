import 'chai'
import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"

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

  describe('Metrics', function () {
    it('should save and get', function () {
      expect(a).to.equal(0)
    })
  })

  after(function () {
    dbMet.close()
  })
})

