const e = require('express')
const homeM = require('../models/home.m')

exports.getHome = async (req, res, next) => {
    const page = req.query.page - 1
    const topRating = await homeM.getTopRating(8, (page) ? page * 8 : 0)
    // console.log(topRating)
    res.render('home', {
        title: 'Home',
        account: req.session.user,
        topRating: topRating
    })
}
exports.login = async (req, res, next) => {
    if (req.method == 'GET') {
        if (req.session.user) res.redirect('/')
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
        if (req.session.user) res.redirect('/')
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
    if (req.session.user) {
        const movies = await homeM.getFavouriteList(req.session.user)
        res.render('profile', {
            title: 'Profile',
            account: req.session.user,
            movies: movies
        })
    }
    else {
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
exports.searchMovie = async (req, res, next) => {
    if (req.method == 'POST') {
        const keyword = req.body.keyword
        res.redirect('/search/' + keyword)
    }
    else {
        const keyword = req.params.keyword;

        const page = req.query.page - 1
        // console.log(keyword)
        const movies = await homeM.seachMovie(keyword, 8, (page) ? page * 8 : 0)
        // console.log(movies)
        let totalMovie = await homeM.seachAllMovie(keyword)
        numberPage = Math.ceil(Object.keys(totalMovie).length / 8)
        res.render('search', {
            title: `Search "${keyword}"`,
            movies: movies,
            keyword: keyword,
            account: req.session.user,
            page: numberPage,
        })
    }
}
exports.addFavourite = async (req, res, next) => {
    const status = await homeM.addFavourite(req.body)
    if (status == 1) {
        res.send({ status: 'success' })
    }
    else {
        res.send({ status: 'fail' })
    }
}
exports.getFavourite = async (req, res, next) => {
    const rs = await homeM.getFavourite(req.body.user)
    res.send(rs)
}
exports.delFavourite = async (req, res, next) => {
    const status = await homeM.delFavourite(req.body)
    if (status == 1) {
        res.send({ status: 'success' })
    }
    else {
        res.send({ status: 'fail' })
    }
}
exports.getReview=async(req,res,next)=>{
    const reviews= await homeM.getReview(req.body.Movie,3,req.body.page*3)
    const size=await homeM.getSizeReview(req.body.Movie)
    reviews[0].size=Math.ceil(size.SIZE/3)
    return res.send(reviews)
}