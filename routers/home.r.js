const app=require('express')
const router=app.Router()
const homeC=require("../controller/home.c")

router.get('/',homeC.getHome)

module.exports=router