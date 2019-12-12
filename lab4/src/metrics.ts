import { LevelDB } from './leveldb'
import WriteStream from 'level-ws'

export class Metric {
  public username: string
  public m_name: string
  public timestamp: string
  public value: number

  constructor(u: string, m_name: string, ts: string, v: number) {
    this.username = u
    this.m_name = m_name
    this.timestamp = ts
    this.value = v
  }
}

export class MetricsHandler {
  private db: any

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  public save(myMetric: Metric, callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)

    var username = myMetric.username
    var m_name = myMetric.m_name
    var timestamp = myMetric.timestamp
    var value = myMetric.value
    
    stream.write({ key: `${username}|${m_name}|${timestamp}`, value: `${value}` })
    
    stream.end()
  }

  
  public getAll( username: string,
    callback: (error: Error | null, result: Metric[]) => void) {
    let metrics: Metric[] = [];
    this.db.createReadStream()
      .on('data', function (data) {
        var [u, m_name, timestamp] = data.key.split('|')
        var value = data.value
        if(username == u){
          let oneMetric: Metric = new Metric(u, m_name, timestamp, value)
          metrics.push(oneMetric)
        }
      }) 
      .on('error', function (err) {
        console.log('Oh my!', err)
        callback(err, err)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
        callback(null, metrics)
      })
  }

  
  public getOne(username : string , key: string ,
    callback: (error: Error | null, result: Metric[]) => void) {
      let metrics: Metric[] = [];
      this.db.createReadStream()
        .on('data', function (data) {
          var [u, m_name, timestamp] = data.key.split('|')
          var value = data.value
          if( username==u && key == m_name){
            let oneMetric: Metric = new Metric(u, m_name, timestamp, value)
            metrics.push(oneMetric)
          }
      })
      .on('error', function (err) {
        console.log('Oh my!', err)
        callback(err, err)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
        callback(null, metrics)
      })
  }


  public delOne(key: string , callback: (error: Error | null) => void) {
      
      this.db.del(key, callback(null ))
  }

  public updateOne(key: string, value: number , callback: (error: Error | null) => void) {
    this.db.put(key, value, (error)=> {
      if (error) {
        console.log('error trying update')
        callback(error)
      } else callback(null)
    })
  }

  public close(){
    this.db.close()
  }

}
