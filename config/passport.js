'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require('bcrypt');

const users = require('./users');

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `done` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use('local', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        session: false   // we are storing a JWT in the cookie with all the required session data. The server is session-less
    },
    function (username, password, done) {
        const user = users.findByUsername(username);
        if (user && bcrypt.compareSync(password, user.password)) {
            console.log(`username ${username}: good password!`);
            return done(null, user);
        }
        return done(null, false);
    }
));

passport.use('jwtCookie', new JwtStrategy(
    {
        jwtFromRequest: (req) => {
            if (req && req.cookies)
                return req.cookies.jwt;
            return null;
        },
        secretOrKey: require('./tokenNCookies').jwtSecret
    },
    function (jwt_payload, done) {
        const user = users.findByUsername(jwt_payload.sub);
        console.log(JSON.stringify(user));
        if (user)
            return done(null, user);
        return done(null, false, { message: 'Incorrect username/password' });
    }
));

/**
 * For the GitHubStrategy to work you need some setup. Create a file in /config/IdP/
 * with name github.js with the following contents:
module.exports = {
    clientID: '<yourClientId>',
    clientSecret: '<yourClientSecret>',
    callbackURL: 'https://<yourDomain>:<yourPort>/auth/github/callback'
};
 */
passport.use('github', new GitHubStrategy(require('./IdP/github'),
    function (accessToken, refreshToken, profile, cb) {
        let user = users.findByUsername(profile.username);
        if (!user) {
            user = users.createUserFromGitHub(profile);
        }
        return cb(null, user);
    }
));

module.exports = passport;
