module.exports = {
    jwtSecret : 'myServerSecret',
    jwtIss : 'https://localhost',
    jwtAud : 'https://localhost',
    cookieOptions : {
        httpOnly: true,
        secure: false,
        sameSite: true
    }
};