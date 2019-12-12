import express = require('express')
import { Metric, MetricsHandler } from './metrics'
import path = require('path')
import bodyparser = require('body-parser')
import session = require('express-session')
import levelSession = require('level-session-store')
import { UserHandler, User } from './user'

const port: string = process.env.PORT || '8082'

const dbUser: UserHandler = new UserHandler('./db/users')
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

const app = express()
app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/../public')))

const LevelStore = levelSession(session)


app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))

/////////////////////////////////////////
//////////    Authentication   //////////
//////////      Management     //////////
/////////////////////////////////////////

const authRouter = express.Router()
app.use(authRouter)

authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
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

const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { name: JSON.stringify(req.session.user.username) })
})


/////////////////////////////////////////
//////////////    User    ///////////////
////////////// Management ///////////////
/////////////////////////////////////////

const userRouter = express.Router()
app.use('/user', userRouter)

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
    res.end()
  })
})



/////////////////////////////////////////
//////////////   Metric   ///////////////
////////////// Management ///////////////
/////////////////////////////////////////

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

  dbMet.getOne(req.session.user.username, req.params.m_name,
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

  dbMet.getOne(username, m_name, (err: Error | null, result?: any) => {

    result.forEach(element => {
      var timestamp = element.timestamp
      var key = username + '|' + m_name + '|' + timestamp

      dbMet.delOne(key, (err: Error | null) => {
        if (err) {
          console.log('Error delOne')
          res.status(500)
        }
        else res.status(200)
      })
    });
  })
})

metricRouter.put('/:m_name', (req: any, res: any) => {
  var username = req.session.user.username
  var m_name = req.params.m_name
  var value = req.body.value

  dbMet.getOne(username, m_name, (err: Error | null, result?: any) => {

    result.forEach(element => {
      var timestamp = element.timestamp
      var key = username + '|' + m_name + '|' + timestamp

      dbMet.updateOne(key, value, (err: Error | null) => {
        if (err) {
          console.log('Error updateOne')
          res.status(500)
        }
        else res.status(200)
      })
    });
  })
})


app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`Server is running on http://localhost:${port}`)
})
