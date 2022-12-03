const e = require('express')
const homeM = require('../models/home.m')

exports.getHome = async (req, res, next) => {
    const s=await homeM.insertDataFromJson()
    
    res.send('1')   
}