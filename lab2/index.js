express = require('express')
app = express()

app.set('port', 1337)

app.get('/hello/:name', 
(req, res) => res.send("Hello " + req.params.name)
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