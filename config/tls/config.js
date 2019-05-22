const path = require('path');

module.exports = {
    certificate: path.join(__dirname, 'cert.pem'),
    privateKey: path.join(__dirname, './privkey.pem')
};