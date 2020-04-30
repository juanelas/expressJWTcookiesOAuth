'use strict'

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const GitHubStrategy = require('passport-github').Strategy
const bcrypt = require('bcrypt')

const config = require('../config')
const users = require('./users')

passport.use('local', new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  function (username, password, done) {
    const user = users.findByUsername(username)
    if (user && bcrypt.compareSync(password, user.password)) {
      console.log(`username ${username}: good password!`)
      return done(null, user)
    }
    return done(null, false, { message: 'Incorrect username/password' })
  }
))

/**
 * JWT strategies differ in how the token is got from the request:
 * either cookies or the HTTP bearer authorization header
 */
passport.use('jwtCookie', new JwtStrategy(
  {
    jwtFromRequest: (req) => {
      if (req && req.cookies) { return req.cookies.jwt }
      return null
    },
    secretOrKey: config.jwt.secret
  },
  _jwtVerifyCallback
))
passport.use('jwtBearer', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret
  },
  _jwtVerifyCallback
))

/**
 * For the GitHubStrategy to work you need some setup. Create a file in /config/IdP/
 * with name github.js with the following contents:
module.exports = {
    clientID: '<yourClientId>',
    clientSecret: '<yourClientSecret>',
    callbackURL: 'https://<yourDomain>:<yourPort>/auth/github/callback'
};
 */
const githubConfig = require('./IdP/github')
passport.use('github', new GitHubStrategy(
  {
    clientID: githubConfig.clientID,
    clientSecret: githubConfig.clientSecret,
    callbackURL: githubConfig.callbackURL
  }, _githubVerifyCallback)
)

const githubSpaConfig = require('./IdP/githubSPA')
passport.use('githubSPA', new GitHubStrategy(
  {
    clientID: githubSpaConfig.clientID,
    clientSecret: githubSpaConfig.clientSecret,
    callbackURL: githubSpaConfig.callbackURL
  }, _githubVerifyCallback)
)

function _jwtVerifyCallback (jwtPayload, done) {
  const user = users.findByUsername(jwtPayload.sub)
  // console.log(JSON.stringify(user));
  if (user) { return done(null, user) }
  return done(null, false)
}

function _githubVerifyCallback (accessToken, refreshToken, profile, cb) {
  let user = users.findByUsername(profile.username)
  if (!user) {
    user = users.createUserFromGitHub(profile)
  }
  return cb(null, user)
}

module.exports = passport
