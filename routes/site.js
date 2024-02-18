const express = require('express')
const router = express.Router()
const siteController = require('../controllers/SiteController')
const { authenMiddleware } = require('../middlewares/AuthenHandler')

router.get('/checkToken',siteController.checkAccessToken)
// 122
module.exports = router