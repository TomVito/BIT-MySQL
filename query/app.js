const express = require('express');
const app = express();
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myblog'
    });

db.connect(err => {
    if(err) {
            console.log('Cannot connect to MySQL database');
            return;
    }
    console.log('Connection to MySQL database is successful');
    });

// db.query(`CREATE TABLE IF NOT EXISTS entries(
//         id int(9) NOT NULL AUTO_INCREMENT,
//         name varchar(256),
//         content text,
//         PRIMARY KEY (id)
//         ) AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8`, (err, res) => {
//     if(err) {
//         console.log(err);
//     }
//     console.log(res);
// });

// db.query(`INSERT INTO entries(name, content) VALUES ('Kepsnys', 'Jautienos išpjovos kepsyns')`);

//db.query(`UPDATE entries SET name = 'Updateintas Sandra' WHERE id = 2`)

//db.query(`UPDATE entries SET name = 'Updateintas Cepelinai su spirgučiais' WHERE id = 4`)

//db.query(`DELETE FROM entries WHERE id > 3`);

// db.query(`SELECT * FROM entries`, (err, res) => {
//     if(err) {
//         console.log(err);
//     }
//     console.log(res);
// });