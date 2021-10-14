const express = require('express');
const app = express.Router();
const path = require('path');
const db = require('../db/connection');
const validator = require('validator');
const md5 = require('md5');

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
                res.redirect('/list-authors/?m=Author successfully added&s=success');
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
            res.render('template/authors/edit-author', {authors, messages, status});
        }
    });
});

app.post('/edit-author/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id            = req.params.id;
    let name          = req.body.name;
    let surname       = req.body.surname;

    db.query(`UPDATE authors SET name = '${name}', surname = '${surname}' WHERE id = '${id}'`, (err, resp) => {
        if(!err) {
            res.redirect('/list-authors');
        }
    });
});

app.get('/delete-author/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id = req.params.id;

    db.query(`DELETE FROM authors WHERE id = '${id}'`, (err, resp) => {
        if(!err) {
            res.redirect('/list-authors/?m=Author successfully deleted&s=success');
        } else {
            res.redirect('/list-authors/?m=Cannot delete author&s=danger');
        }
    });
});

app.get('/register-user', (req, res) => {
    res.render('template/authors/register-user');
});

app.post('/register-user',  (req, res) => {
    let userName    = req.body.name;
    let userEmail   = req.body.email;
    let userPass    = md5(req.body.password);

    db.query(`SELECT * FROM users WHERE name = '${userName}'`, (err, resp) => {
        
        if(resp.length == 0) {
            
            db.query(`INSERT INTO users (name, email, password) 
                    VALUES ('${userName}' , '${userEmail}' , '${userPass}')`
            , err => {
                if(err) {
                    console.log(err);
                    return;
                }
                res.redirect('/?m=Registration successful&s=success');
            });
        }
    });
});

module.exports = app;