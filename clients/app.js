const express = require('express');
const hbs = require('express-handlebars');
const app = express();
const path = require('path');
const db = require('./db/connection')

app.use(express.urlencoded({
    extended: false
}));

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/template'
}));

app.set('views', path.join(__dirname, '/views/'));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('add-company');
});

app.get('/add-company', (req, res) => {
    res.render('add-company');
});

app.post('/add-company', (req, res) => {
    
    let companyName     = req.body.name;
    let companyAddress  = req.body.address;

    db.query(`SELECT * FROM companies WHERE name = '${companyName}'`, (err, resp) => {

        if(resp.length == 0) {
            
            db.query(`INSERT INTO companies (name, address) 
                    VALUES ( '${companyName}' , '${companyAddress}' )`
            , err => {
                if(err) {
                    console.log(err);
                    return;
                }
                res.redirect('/?m=Company successfully added');
            });
        } else {
            res.redirect('/?m=Company with that name already exists');
        }
    });
});

app.listen(3000);