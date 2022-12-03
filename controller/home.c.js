const e = require('express')
const homeM = require('../models/home.m')

exports.getHome = async (req, res, next) => {
    const topRating=await homeM.getTopRating(8,0)
    // console.log(topRating)
    res.render('home',{
        title:'Home',
        account:req.session.user,
        topRating:topRating
    })
}
exports.login = async (req, res, next) => {
    if (req.method=='GET'){
        res.render('login',{
            title:'Login'
        })
    }
    else if (req.method=='POST'){
        homeM.checkSignIn(req.body).then((result) => {
            if (result == 1) {
                req.session.user = req.body.username
                return res.redirect('/')
            }
            else {
                res.render('login', {
                    title: 'Log in',
                    error:"username or password incorrect"
                })
            }
        })
    }
}
exports.signup = async (req, res, next) => {
    if (req.method=='GET'){
        res.render('signup',{
            title:'Signup'
        })
    }
    else if(req.method=='POST'){
        homeM.createAccount(req.body).then((result) => {
            console.log(req.body)
            if (result == -1) {
                res.render('signup', {
                    title: 'Signup',
                    error: "username is exists"
                })
            }
            else {
                req.session.user = req.body.username
                return res.redirect('/')
            }
        })
    }
}
exports.profile = async (req, res, next) => {
    res.render('profile',{
        title:'Profile',
        account:req.session.user
    })
}
exports.logout = (req, res, next) => {
    req.session.user = null
    res.redirect('/login')
}
exports.getMovie=async (req,res,next)=>{
    const id = req.params.id;
    const movie=await homeM.getMovie(id)
    const casts=await homeM.getActor(id)
    if (movie.length==1){
        res.render('movie',{
            title:movie[0].Title,
            movie:movie[0],
            casts:casts
        })
    }
    else{
        res.render('movie',{
            title:"Error",
        })
    }
}