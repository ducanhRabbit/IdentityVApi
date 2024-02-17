const charRouter = require('./character')
const siteRouter = require('./site')
const userRouter = require('./user')
const inspirationRouter = require('./inspiration')
const commentRouter = require('./comment')
const route = (app)=>{
    app.use('/api/inspiration',inspirationRouter)
    app.use('/api/comment',commentRouter)
    app.use('/api/character', charRouter)
    app.use('/api/user',userRouter)
    app.use('/',siteRouter)
}

module.exports = route