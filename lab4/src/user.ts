import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

var crypto = require('crypto')
var key = 'my secret key'

export class User {
  public username: string
  public email: string
  private password: string = ""

  constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
    this.username = username
    this.email = email

    if (!passwordHashed) {
      this.setPassword(password)
    } else this.password = password
  }

  static fromDb(username: string, value: any): User {
    const [password, email] = value.split(":")
    return new User(username, email, password, true)
  }

  public setPassword(toSet: string): void {
    // Hash and set password
    var hash = crypto.createHmac('sha256', key)
    hash.update(toSet)
    this.password = hash.digest('hex')
  }

  public getPassword(): string {
    return this.password
  }

  public validatePassword(toValidate: String): boolean {
    // return comparison with hashed password
    var hash = crypto.createHmac('sha256', key)
    hash.update(toValidate)
    toValidate = hash.digest('hex')

    if (this.password == toValidate) return true
    else return false
  }
}

export class UserHandler {
  public db: any

  public get(username: string, callback: (err: Error | null, result?: User) => void) {
    this.db.get(`user:${username}`, function (err: Error, data: any) {
      if (err) callback(err)
      else if (data === undefined) callback(null, data)
      else {
        callback(null, User.fromDb(username, data))
      }
    })
  }

  public save(user: User, callback: (err: Error | null) => void) {
    this.db.put(`user:${user.username}`, `${user.getPassword()}:${user.email}`, (err: Error | null) => {
      callback(err)
    })
  }

  public delete(username: string, callback: (err: Error | null) => void) {
    // TODO
    this.db.del(`user:${username}`,callback(null))
  }

  constructor(path: string) {
    this.db = LevelDB.open(path)
  }
}