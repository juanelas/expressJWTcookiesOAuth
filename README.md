# expressJWTcookiesOAuth

Just an example of express+passport. 

All the session information is stored in a __JWT__ on the client side (__sessionless passport__). In order to minimize the code, as the client is a browser, we will use __cookies__ for token storage (on the client) and exchange (between client and server). JWT and cookies configuration options are stored in `config/tokenNCookies`. Please not that the server secret for 'signing' (HMACing) the token is stored in that file, so be careful if you are syncing your code in a public/private repository.

User login can be performed with two strategies:
 1. __Standard username/password__. The server stores bcrypt-ed passwords that are checked against the user-provided one. For the sake of simplicity, no DB is used and two users are hardcoded in `config/users.js`. You can create new bcrypt-ed passwords using the provided `tools/bcrypt.js` script. Salt value is randomly chosen and the number of rounds defaults to `13` but can be set to any value as a second argument; e.g. for password `hello123`:
 ```bash
$ node bcrypt.js hello123
$2b$13$x2B9adECo7EkKuDbujJe1unW3icISCctreasFOJFiLyyWUdDOO9zu
$ node bcrypt.js hello123 16
$2b$16$ZiY1yscail4V72CYP1IK3uaC3owprKpLftbHCutDvCVxKSlYVe6qW
 ```
 2. __GitHub using the OAuth 2.0 API__. Login with a GitHub account. You must register first an application with GitHub. If you have not already done so, a new application can be created at developer applications within GitHub's settings panel. Your application will be issued a client ID and client secret, which need to be provided to the strategy. You will also need to configure a callback URL which matches the route in your application. In this example there is already a route for the callback URL listening on `/auth/github/callback`. Once you have all the required data, you have to create a file `config/IdP/github.js` with the following contents:
 ```javascript
 module.exports = {
    clientID: '<yourClientId>',
    clientSecret: '<yourClientSecret>',
    callbackURL: 'http(s)://<yourDomain>:<yourPort>/auth/github/callback'
};
 ```