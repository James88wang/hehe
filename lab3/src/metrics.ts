import { LevelDB } from './leveldb'
import WriteStream from 'level-ws'

export class Metric {
  public timestamp: string
  public value: number

  constructor(ts: string, v: number) {
    this.timestamp = ts
    this.value = v
  }
}

export class MetricsHandler {
  private db: any

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  public save(key: number, metrics: Metric[], callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    metrics.forEach((m: Metric) => {
      stream.write({ key: `metric:${key}${m.timestamp}`, value: m.value })
    })
    stream.end()
  }

  public getAll(callback: (error: Error | null, result: Metric[]) => void) {
    let metrics: Metric[] = [];
    this.db.createReadStream()
      .on('data', function (data) {
        console.log(data.key, '=', data.value)
        let oneMetric: Metric = new Metric(data.key, data.value)
          metrics.push(oneMetric)
          console.log(data.key, '=', data.value)
      })
      .on('error', function (err) {
        console.log('Oh my!', err)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
        callback(null, metrics) 
      })

  }


  static get(callback: (error: Error | null, result?: Metric[]) => void) {
    const result = [
      new Metric('2013-11-04 14:00 UTC', 12),
      new Metric('2013-11-04 14:30 UTC', 15)
    ]
    callback(null, result)
  }
}

