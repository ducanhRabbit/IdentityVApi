const jwt = require('jsonwebtoken')

const generateRefreshToken = (id)=>{
    return jwt.sign({id},process.env.REFRESH_SERCRET_KEY,{ expiresIn: '1d' })
}

module.exports = generateRefreshToken