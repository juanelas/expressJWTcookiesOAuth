'use strict';

const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const path = require('path');

const router = express.Router();

router.get('/', passport.authenticate('jwtCookie', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const userToken = jwt.decode(req.cookies.jwt);
        res.send(`<h1>Welcome to the intranet, ${userToken.name}!</h1>
    <p>${req.cookies.jwt}</p>
    <p>${JSON.stringify(userToken)}</p>`);
    }
);

router.get('/login',
    (request, response) => {
        response.sendFile('/views/login.html', {root: path.join(__dirname, '..')});
    });

router.post('/login', passport.authenticate('local', { session: false, failureRedirect: '/login' }),
    function (req, res) {
        _setJWTCookie(req.user, res);
        /** Report success and allow the user to visit the intranet */
        res.send('<p>Login succeeded. Please proceed to the <a href="/">intranet</a></p>');
    }
);

router.get('/login/github',
    passport.authenticate('github', { session: false })
);

router.get('/auth/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    function (req, res) {
        _setJWTCookie(req.user, res);
        /** And finally redirect to the intranet */
        res.send('<p>Login succeeded. Please proceed to the <a href="/">intranet</a></p>');
    }
);

function _setJWTCookie(user, res) {
    /** This is what ends up in our JWT */
    const jwtClaims = {
        sub: user.username,
        iss: require('../config/tokenNCookies').jwtIss,
        aud: require('../config/tokenNCookies').jwtAud,
        exp: Math.floor(Date.now() / 1000) + 604800, // 1 weak (7×24×60×60=604800s) from now
        name: user.name,
        email: user.email
    };

    /** generate a signed json web token and return it in the response */
    const token = jwt.sign(jwtClaims, require('../config/tokenNCookies').jwtSecret);

    /** assign our jwt to the cookie */
    res.cookie('jwt', token, require('../config/tokenNCookies').cookieOptions);
}

module.exports = router;