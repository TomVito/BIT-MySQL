const express = require('express');
const app = express.Router();
const path = require('path');
const db = require('../db/connection');
const validator = require('validator');
const multer  = require('multer');
const md5 = require('md5');
const fs = require('fs');
const per_page    = 5;

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function(req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
})
const upload = multer({ 
    fileFilter: function(req, file, callback) {
        if(file.mimetype != 'image/jpeg' && file.mimetype != 'image/png')
            return callback(new Error('Neteisingas nuotraukos formatas'));

        callback(null, true);
    },
    storage: storage
});

app.get('/list-authors', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }
                
        db.query(`SELECT authors.id, authors.name, authors.surname FROM authors`, (err, authors) => {
    
            if(!err) {
    
                res.render('template/authors/list-authors', {authors});
    
                } else {
    
                res.redirect('list-authors/?m=Something went wrong&s=danger');
    
            }
        });
    
});

app.get('/add-author', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    db.query('SELECT id, name, surname FROM authors', (err, authors) => {
        if(err) {
            res.render('template/authors/add-author', {message: 'Failed to get company from database'});
        } else {
            res.render('template/authors/add-author', {authors});
        }
    });
});

app.post('/add-author', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let name          = req.body.name;
    let surname       = req.body.surname;

    db.query(`SELECT * FROM authors WHERE name = '${name}'`, (err, resp) => {

        if(resp.length == 0) {
            
            db.query(`INSERT INTO authors (name, surname) 
                    VALUES ( '${name}' , '${surname}')`
            , err => {
                if(err) {
                    console.log(err);
                    return;
                }
                res.redirect('/list-authors/?m=Client successfully added&s=success');
            });
        }
    });
});

app.get('/edit-author/:id', (req, res) =>{

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id          = req.params.id;
    let messages    = req.query.m;
    let status      = req.query.s;

    db.query(`SELECT * FROM authors WHERE id = '${id}'`, (err, authors) => {
        if(!err) {
            
            db.query(`SELECT id, name FROM authors`, (err, authors) => {

                if(err) {
                    res.render('template/authors/add-author', {authors, messages: 'Cannot get authors from database', status: 'danger'});
                } else {
                    res.render('template/clients/edit-author', {authors, messages, status});
                }
                
            });

        } else {

            res.redirect('/list-authors/?m=No such client&s=danger');

        }

    });

});

app.post('/edit-client/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id                  = req.params.id;
    let clientName          = req.body.name;
    let clientSurname       = req.body.surname;
    let clientPhone         = req.body.phone;
    let clientEmail         = req.body.email;
    let clientPhoto         = (req.file) ? req.file.filename : '';
    let clientComments      = req.body.comments;
    let clientCompany_id    = req.body.company;

    db.query(`UPDATE customers SET name = '${clientName}', surname = '${clientSurname}', phone = '${clientPhone}', email = '${clientEmail}', photo = '${clientPhoto}', comments = '${clientComments}', company_id = '${clientCompany_id}' WHERE id = '${id}'`, (err, resp) => {
        if(!err) {
            res.redirect('/list-clients');
        }
    });
});

app.get('/delete-client/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id = req.params.id;

    db.query(`SELECT photo FROM customers WHERE id = '${id}'`, (err, customer) => {
        
        if(!err) {

        if(customer[0]['photo']) {
            fs.unlink(__dirname + '../../uploads/' + customer[0]['photo'], err => {
                if(err){
                    res.redirect('/list-clients/?m=Failed to delete photo&s=danger')
                }
            });
        }

        db.query(`DELETE FROM customers WHERE id = '${id}'`, (err, resp) => {
            if(!err) {
                res.redirect('/list-clients/?m=Company successfully deleted&s=success');
            } else {
                res.redirect('/list-clients/?m=Cannot delete entry&s=danger');
            }
        });
        }
    })
});

app.get('/register-user', (req, res) => {
    res.render('template/clients/register-user');
});

app.post('/register-user', upload.single('photo'),  (req, res) => {
    let userName    = req.body.name;
    let userEmail   = req.body.email;
    let userPass    = md5(req.body.password);

    if(!validator.isAlpha(userName, 'en-US', {ignore: ' .ąĄčČęĘėĖįĮšŠųŲūŪ'})
    || !validator.isLength(userName, {min: 3, max: 50})) {
    res.redirect('/list-clients/?m=Enter name&s=danger'); 
    return;
    }

    if(!validator.isEmail(userEmail)) {
    res.redirect('/list-clients/?m=Enter email&s=danger');
    return;
    }

    // if(!validator.isStrongPassword(userPass)) {
    //     res.redirect('/list-clients/?m=Password is too weak&s=danger');
    // return;
    // }

    db.query(`SELECT * FROM users WHERE name = '${userName}'`, (err, resp) => {
        
        if(resp.length == 0) {
            
            db.query(`INSERT INTO users (name, email, password) 
                    VALUES ('${userName}' , '${userEmail}' , '${userPass}')`
            , err => {
                if(err) {
                    console.log(err);
                    return;
                }
                res.redirect('/list-clients/?m=Registration successful&s=success');
            });
        }
    });
});

module.exports = app;