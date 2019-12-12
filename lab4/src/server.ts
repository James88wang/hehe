import express = require('express')
import { Metric, MetricsHandler } from './metrics'
import path = require('path')
import bodyparser = require('body-parser')
import session = require('express-session')
import levelSession = require('level-session-store')
import { UserHandler, User } from './user'
const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()


const app = express()
app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))


const LevelStore = levelSession(session)

app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))

authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
  console.log('test delete')
  res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

authRouter.post('/login', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    if (err) next(err)
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
})

const userRouter = express.Router()
app.use(authRouter)
app.use('/user', userRouter)

const port: string = process.env.PORT || '8082'

app.use(express.static(path.join(__dirname, '/../public')))

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')


userRouter.post('/', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    if (!err || result !== undefined) {
      res.status(409).send("user already exists")
    } else {
      let newUser = new User(req.body.username, req.body.email, req.body.password)
      dbUser.save(newUser, function (err: Error | null) {
        if (err) next(err)
        else res.status(201).send("user persisted")
      })
    }
  })
})

userRouter.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result?: User) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})

userRouter.delete('/:username', (req: any, res: any) => {
  dbUser.delete(req.params.username, function (err: Error | null, result?: User) {
    //console.log(req.params.username)
    res.end()
  })
})


const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { name: JSON.stringify(req.session.user.username) })
})

const metricRouter = express.Router()
app.use('/metrics', metricRouter)

metricRouter.post('/', (req: any, res: any) => {
  var dateNow = JSON.stringify(new Date)
  var myMetric = new Metric(req.session.user.username, req.body.m_name, dateNow, req.body.value)
  dbMet.save(myMetric, (err: Error | null) => {
    if (err) throw err
    res.status(200).redirect('/')
  })
})


metricRouter.get('/', (req: any, res: any) => {
    dbMet.getAll(req.session.user.username,
      (
        err: Error | null, result?: any
      ) => {
        if (err) throw err
        res.status(200).send(result)
      })
}) 

metricRouter.get('/:m_name', (req: any, res: any) => {
  
  dbMet.getOne( req.session.user.username, req.params.m_name,
    (
      err: Error | null, result?: any
    ) => {
      if (err) throw err
      res.status(200).send(result)
    })
})

metricRouter.delete('/:m_name', (req: any, res: any) => { 
  var username = req.session.user.username
  var m_name = req.params.m_name
  var metrics

  dbMet.getOne(username, m_name, (err: Error | null, result?: any)=> {
    metrics = result

    metrics.forEach(element => {
      var timestamp = element.timestamp
      var key = username + '|' + m_name + '|' + timestamp
  
      dbMet.delOne(key, (err: Error | null) => {  console.log('Error delOne')})
    });
  })

  res.redirect('/')
})


/*
app.post('/metrics/:id', (req: any, res: any) => {
  
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send('ola que tal ?')
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

/
app.get('/metrics/delOne/:key', (req: any, res: any) => {
  dbMet.delOne(req.params.key,
    (err: Error | null) => {

      console.log("we try to delete a metric")
      res.status(200).send('Delete successful')
    })
})
*/

app.get('/', (req: any, res: any) => {
  res.write('Hello world')
  res.end()
})

app.get('/hello/:name', (req: any, res: any) => {
  res.render('hello.ejs', { name: req.params.name })
})
/*
app.get('/metrics.json', (req: any, res: any) => {
  MetricsHandler.get((err: Error | null, result?: any) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
})*/

app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`Server is running on http://localhost:${port}`)
})
