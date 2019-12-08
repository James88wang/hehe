express = require('express')
app = express()

path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

app.set('port', 1337)

app.set('views', __dirname + "/views")
app.set('view engine', 'ejs')

app.get('/hello/:name', 
(req, res) => res.render('hello.ejs', {name: req.params.name})
  )
  
  app.post('/', (req, res) => {
    // POST
  })
  
  app
    .put('/', function (req, res) {
      // PUT
    })
    .delete('/', (req, res) => {
      // DELETE
    })

app.listen(

  app.get('port'), 
  () => console.log(`server listening on ${app.get('port')}`)
) 