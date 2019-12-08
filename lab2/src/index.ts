import * as exp  from 'express';
var express = require('express')
var app = express()

var metrics = require('./metrics')

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

app.set('port', 1337)

app.set('views', __dirname + "/views")
app.set('view engine', 'ejs')

app.get('/hello/:name',
    (req: exp.Request, res: exp.Response) => res.render('hello.ejs', { name: req.params.name })
)

app.post('/', (req: exp.Request, res: exp.Response) => {
    // POST
})

app
    .put('/', function (req: exp.Request, res: exp.Response) {
        // PUT
    })
    .delete('/', (req: exp.Request, res: exp.Response) => {
        // DELETE
    })

app.get('/metrics.json', (req: exp.Request, res: exp.Response) => {
    metrics.get((err: Error, data: any) => {
        if (err) throw err
        res.status(200).json(data)
    })
})

app.listen(

    app.get('port'),
    () => console.log(`server listening on ${app.get('port')}`)
) 