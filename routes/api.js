'use strict';

const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const fortune = require('fortune-teller');

const router = express.Router();

/**
 * CORS
 */
const cors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
};

router.use(cors);

router.post('/login',
    function (req, res, next) {
        passport.authenticate('local', function (error, user) {
            if (error) {
                res.status(401).json(error); //unauthorized
            } else {
                const token = _createJwt(user);
                res.json({ jwt: token });
            }
        })(req, res, next);
    }
);

router.get('/login/github',
    passport.authenticate('githubAPI', { session: false })
);

router.get('/auth/github/callback', passport.authenticate('githubAPI', { session: false }),
    function (req, res) {
        const token = _createJwt(req.user);
        res.send(`<script>
            window.opener.postMessage({ "tokenJwt": "${token}" }, "http://localhost:3000/auth/github/callback");
            window.close();
        </script>`);
    }
);

router.get('/fortune', passport.authenticate('jwtBearer', { session: false }),
    (req, res) => {
        res.json({ msg: fortune.fortune() });
    }
);

function _createJwt(user) {
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
    return jwt.sign(jwtClaims, require('../config/tokenNCookies').jwtSecret);
}

module.exports = router;