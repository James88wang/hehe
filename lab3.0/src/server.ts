import express = require('express')
import { Metric, MetricsHandler } from './metrics'
import path = require('path')
import bodyparser = require('body-parser')


const app = express()
const port: string = process.env.PORT || '8082'
app.use(express.static(path.join(__dirname, '/../public')))

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send('ola que tal ?')
  })
})

app.get('/metrics/getAll', (req: any, res: any) => {
  dbMet.getAll(
    (
      err: Error | null, result?: any
    ) => {
      if (err) throw err
      console.log("we try to get All metrics")
      res.status(200).send(result)
    })
})

app.get('/metrics/getOne/:key', (req: any, res: any) => {
  dbMet.getOne(req.params.key,
    (
      err: Error | null, result?: any
    ) => {
      console.log("we try to get one metric")
      res.status(200).send(result)
    })
})

app.get('/metrics/delOne/:key', (req: any, res: any) => {
  dbMet.delOne(req.params.key,
    (err: Error | null) => {

      console.log("we try to delete a metric")
      res.status(200).send('Delete successful')
    })
})

app.get('/', (req: any, res: any) => {
  res.write('Hello world')
  res.end()
})

app.get('/hello/:name', (req: any, res: any) => {
  res.render('hello.ejs', { name: req.params.name })
})

app.get('/metrics.json', (req: any, res: any) => {
  MetricsHandler.get((err: Error | null, result?: any) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
})

app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`Server is running on http://localhost:${port}`)
})
