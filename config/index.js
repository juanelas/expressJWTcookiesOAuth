module.exports = {
    baseUrl: 'https://localhost:8443',
    api: {
        allowedOrigins: 'http://localhost:3000'  // API react
    },
    jwt: {
        secret: 'myServerSecret'
    },
    cookieOptions: {
        httpOnly: true,
        secure: true,
        sameSite: true
    }
};