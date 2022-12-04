const app=require('express')
const router=app.Router()
const homeC=require("../controller/home.c")

router.get('/',homeC.getHome)
router.get('/login',homeC.login)
router.post('/login',homeC.login)
router.get('/signup',homeC.signup)
router.post('/signup',homeC.signup)
router.get('/profile',homeC.profile)
router.post('/logout',homeC.logout)
router.get('/movie/:id',homeC.getMovie)
router.get('/actor/:id',homeC.getProfileActor)
router.post('/search',homeC.searchMovie)
router.post('/addFavourite',homeC.addFavourite)
router.post('/getFavourite',homeC.getFavourite)
router.post('/delFavourite',homeC.delFavourite)

module.exports=router