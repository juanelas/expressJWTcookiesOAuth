module.exports = {
  jwtSecret: 'myServerSecret',
  jwtIss: 'https://localhost:8443',
  jwtAud: 'https://localhost:8443',
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: true
  }
}
