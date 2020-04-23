'use strict';

const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const path = require('path');

const router = express.Router();


/*
 * Our website is a an intranet and requires a cookie with a valid token in 
 * order to access.That is why the endpoint / is authenticated with the 
 * passport strategy 'jwtCookie', which is defined in /config/passsport.js
 * 
 * If the client doesn't have a cookie with a valid token, it is redirected to 
 * the login page (/login). There, the client can get a valid JWT for the 
 * intranet either by login in with a username/passpord (a 'local' strategy) 
 * or using OAuth2 GitHub login (we have call it 'github' strategy)
 * The authentication strategies are defined in /config/passport.js
 */
router.get('/', passport.authenticate('jwtCookie', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const userToken = jwt.decode(req.cookies.jwt);
        res.send(`
    <h1>Welcome to the intranet, ${userToken.name}!</h1>
    <p>${req.cookies.jwt}</p>
    <p>${JSON.stringify(userToken)}</p>
    <a href="/logout">Logout</a>`);
    }
);

/*
 * The GET endpoint for login just shows the login page and thus it is open to
 * anyone (not authenticated ). In the login page the user either opt to 
 * submit its username and password with a html form or to initiate a loging 
 * with github.
 * If the  formulary is sumbitted the user name are posted to the /login POST 
 * endpoint (see below)
 */
router.get('/login',
    (request, response) => {
        response.sendFile('/views/login.html', { root: path.join(__dirname, '..') });
    });

/* 
 * The POST endpoint for login. If the user opted to submit his/her username 
 * and password with the online formulary (this is commonly referred as local 
 * authentication), the username and password fields of the forumulary are 
 * POSTed  to this endpoint. Therefore we use here the 'local' authentication 
 * strategy to check if the username and passwords were valid. If they were, a
 * cookie with a valid JWT for the intranet is sent back to the browser and 
 * the browser is redirected to the intranet endpoint at /
 */
router.post('/login', passport.authenticate('local', { session: false, failureRedirect: '/login' }),
    function (req, res) {
        // If authentication succeeded, we will have
        sendCookieWithJwt('jwt', req.user, res)
        // redirect to user to the intranet
        res.redirect('/');
    }
);

/*
 * The logout endpoint. We have implemented a sessionless server, where all  
 * the session information is stored in a JWT that inside a cookie that the 
 * browser will automatically send with every request to the server. Logging 
 * out is just as easy as deleting that cookie (whose name is 'jwt').
 */
router.get('/logout', function (req, res) {
    res.clearCookie('jwt');  // clear the cookie with the session data (the JWT)
    res.redirect('/login');  // redirect the user to the login page
});

router.get('/login/github',
    passport.authenticate('github', { session: false })
);

router.get('/auth/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    function (req, res) {
        sendCookieWithJwt('jwt', req.user, res);
        res.send('<p>Login with GitHub succeeded. You can now proceed to the <a href="/">intranet</a></p>');
    }
);

function sendCookieWithJwt(cookieName, user, res) {
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
    res.cookie(cookieName, token, require('../config/tokenNCookies').cookieOptions);
}

module.exports = router;