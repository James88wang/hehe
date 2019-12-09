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
  public getAll(
    callback: (error: Error | null, result: Metric[]) => void) {
    let metrics: Metric[] = [];
    this.db.createReadStream()
      .on('data', function (data) {
        let oneMetric: Metric = new Metric(data.key, data.value)
        metrics.push(oneMetric)
        console.log(data.key, '=', data.value)
        //callback(null, data) we will retrive data metrics with the callback in "end" !!
      }) // if i put this callback then we have 2 setheaders leading to error !
      .on('error', function (err) {
        console.log('Oh my!', err)
        callback(err, err) // 
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
        callback(null, metrics)
      })
  }

  public getOne(key,
    callback: (error: Error | null, result: Metric[]) => void) {
    let metrics: Metric[] = [];
    this.db.createReadStream()
      .on('data', function (data) {
        if (data.key == key) {
          let oneMetric: Metric = new Metric(data.key, data.value)
          // trouver une methode pour afficher qu'un seul metric
          metrics.push(oneMetric)
          console.log(data.key, '=', data.value)
        }
      })
      .on('error', function (err) {
        console.log('Oh my!', err)
        callback(err, err) // 
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
        callback(null, metrics)
      })
  }

  public delOne(key, callback: (error: Error | null) => void) {
      
      this.db.del(key, callback(null ))
      
  }

  static get(callback: (error: Error | null, result?: Metric[]) => void) {
    const result = [
      new Metric('2013-11-04 14:00 UTC', 12),
      new Metric('2013-11-04 14:30 UTC', 15)
    ]
    callback(null, result)
  }
}
