const express = require('express');
const hbs = require('express-handlebars');
const app = express();
const mysql = require('mysql');
const path = require('path');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clients'
    });

db.connect(err => {
    if(err) {
            console.log('Cannot connect to MySQL database');
            return;
    }
    console.log('Connection to MySQL database is successful');
});

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

app.listen(3000);