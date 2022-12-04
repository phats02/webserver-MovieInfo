const e = require('express')
const homeM = require('../models/home.m')

exports.getHome = async (req, res, next) => {
    const topRating = await homeM.getTopRating(8, 0)
    // console.log(topRating)
    res.render('home', {
        title: 'Home',
        account: req.session.user,
        topRating: topRating
    })
}
exports.login = async (req, res, next) => {
    if (req.method == 'GET') {
        res.render('login', {
            title: 'Login',
        })
    }
    else if (req.method == 'POST') {
        homeM.checkSignIn(req.body).then((result) => {
            if (result == 1) {
                req.session.user = req.body.username
                return res.redirect('/')
            }
            else {
                res.render('login', {
                    title: 'Log in',
                    error: "username or password incorrect"
                })
            }
        })
    }
}
exports.signup = async (req, res, next) => {
    if (req.method == 'GET') {
        res.render('signup', {
            title: 'Signup'
        })
    }
    else if (req.method == 'POST') {
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
    if (req.session.user){
    const movies=await homeM.getFavouriteList(req.session.user)
    res.render('profile', {
        title: 'Profile',
        account: req.session.user,
        movies:movies
    })
}
else{
    res.redirect('/login')
}
}
exports.logout = (req, res, next) => {
    req.session.user = null
    res.redirect('/login')
}
exports.getMovie = async (req, res, next) => {
    const id = req.params.id;
    const movie = await homeM.getMovie(id)
    const casts = await homeM.getActor(id)
    if (movie.length == 1) {
        res.render('movie', {
            title: movie[0].Title,
            movie: movie[0],
            casts: casts,
            account: req.session.user,
        })
    }
    else {
        res.render('movie', {
            title: "Error",
            account: req.session.user,
        })
    }
}
exports.getProfileActor = async (req, res, next) => {
    const id = req.params.id;
    const actor = await homeM.getProfileActor(id)
    const movies = await homeM.getMoveOfActor(id)
    if (actor.length == 1) {
        res.render('actor', {
            actor: actor[0],
            movies: movies,
            title: actor[0].Name,
            account: req.session.user,
        })
    }
    else {
        res.render('actor', {
            title: "Error",
            account: req.session.user,
        })
    }
}
exports.searchMovie=async(req,res,method)=>{
    const keyword=req.body.keyword
    // console.log(keyword)
    const movies=await homeM.seachMove(keyword)
    // console.log(movies)
    res.render('search', {
        title: `Search "${keyword}"`,
        movies: movies,
        keyword: keyword,
        account: req.session.user,
    })
}
exports.addFavourite=async(req,res,method)=>{
    const status= await homeM.addFavourite(req.body)
    if (status==1){
        res.send({status:'success'})
    }
    else{
        res.send({status:'fail'})
    }
}
exports.getFavourite=async(req,res,method)=>{
    const rs=await homeM.getFavourite(req.body.user)
    res.send(rs)
}
exports.delFavourite=async(req,res,method)=>{
    const status= await homeM.delFavourite(req.body)
    if (status==1){
        res.send({status:'success'})
    }
    else{
        res.send({status:'fail'})
    }
}