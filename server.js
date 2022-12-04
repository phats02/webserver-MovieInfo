const express = require('express')
const exphbs = require('express-handlebars')
const routersHome = require("./routers/home.r")
var session = require('cookie-session')

const app = express()
const port = 20157

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'container.hbs',
    layoutsDir: 'views/_layouts',
    partialsDir: 'views/_partials',
}));
app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'best secret key',
    resave: true,
    cookie: { secure: false },
    saveUninitialized: true
}))
var hbs = exphbs.create({});
hbs.handlebars.registerHelper('for', function (from, to, incr, block) {
    var accum = '';
    for (var i = from; i <= to; i += incr)
        accum += block.fn(i);
    return accum;
});
app.use('/', routersHome)
app.use((err, req, res, next) => {
    const status = err.status | 500
    res.status(status).send(err.message)
})

app.listen(port, () => console.log(`Running app in port ${port}`))