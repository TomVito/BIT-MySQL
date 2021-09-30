const express = require('express');
const app = express();
const mysql = require('mysql');

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

app.get('/', (req, res) => {
    res.send('Test');
});

app.listen(3000);