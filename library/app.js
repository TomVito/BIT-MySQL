const express = require('express');
const hbs = require('express-handlebars');
const app = express();
const path = require('path');
const db = require('./db/connection')
const booksController = require('./controllers/books');
const authorsController = require('./controllers/authors');
const session = require('express-session');
const md5 = require('md5');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use( function(req, res, next){
    app.locals.auth = (req.session.auth) ? true : false;
    next();
});

app.use(express.urlencoded({
    extended: false
}));

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/template',
    helpers: require('./config/handlebars-helpers')
}));

app.set('views', path.join(__dirname, '/views/'));

app.set('view engine', 'hbs');

app.use('/static', express.static('static'));
app.use('/uploads', express.static('uploads'));
app.use('/static/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/static/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

app.use('/', booksController);
app.use('/', authorsController);

app.get('/', (req, res) => { 
    if(req.session.auth) {
        res.render('template/index');
    }
    else {
        res.render('template/login');
    }
});

app.post('/login', (req, res) => {
    let user = req.body.email;
    let pass = md5(req.body.password);

    if(user && pass) {
        
        db.query(`SELECT * FROM users WHERE email = '${user}' AND password = '${pass}'`, (err, user) =>{
            if(!err && user.length > 0) {

                req.session.auth = true;
                req.session.user = user;

                let hour = 3600000;
                req.session.cookie.expires = new Date(Date.now() + hour);
                req.session.cookie.maxAge = hour;
                
                req.session.save();

            }
        });
    }

    res.redirect('/');

});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen('3000');