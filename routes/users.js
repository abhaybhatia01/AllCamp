const express= require('express')
const router= express.Router()
const passport = require('passport')
const catchAsync= require('../utilities/catchAsync')
const User = require('../models/user')
const { reviewSchema } = require('../schemas')
const  users = require('../controllers/users')


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local',{failureFlash:true,keepSessionInfo: true,failureMessage: true,failureRedirect:'/login'}),users.login)

router.get('/logout', users.logout )

module.exports= router;