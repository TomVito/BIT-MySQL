const express = require('express');
const app = express.Router();
const path = require('path');
const db = require('../db/connection');
const validator = require('validator');

app.get('/add-book', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    db.query('SELECT id, name, surname FROM authors', (err, authors) => {
        if(err) {
            res.render('template/books/add-book', {message: 'Failed to get authors from database'});
        } else {
            res.render('template/books/add-book', {authors});
        }
    });
});

app.post('/add-book', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }
    
    let title               = req.body.title;
    let pages               = req.body.pages;
    let isbn                = req.body.isbn;
    let short_description   = req.body.short_description;
    let author_id           = req.body.author_id;

    db.query(`SELECT * FROM books WHERE title = '${title}'`, (err, resp) => {

        if(resp.length == 0) {
            
            db.query(`INSERT INTO books (title, pages, isbn, short_description, author_id) 
                    VALUES ( '${title}' , '${pages}', '${isbn}' , '${short_description}' , '${author_id}')`
            , err => {
                if(err) {
                    console.log(err);
                    return;
                }
                res.redirect('/list-books/?m=Book successfully added&s=success');
            });
        }
    });
});

app.get('/list-books', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let author_id = (req.query.author_id != -1) ? req.query.author_id : '';
    let messages = req.query.m;
    let status = req.query.s;
    let query_a     = (author_id) ? 'WHERE books.author_id = ' + author_id : '';

    db.query(`SELECT * FROM authors`, (err, authors) => {

        if(!err) {

            if(author_id) {

                authors.forEach(function(val, index) {

                if(author_id == val['id'])
                    authors[index]['selected'] = true;
                
                });

            }

            db.query(`SELECT books.id, books.title, books.pages, books.isbn, 
            books.short_description, books.author_id, authors.name AS name, authors.surname 
            AS surname FROM books LEFT JOIN authors ON books.author_id = authors.id ${query_a} ORDER BY title ASC`, (err, books) => {
                if(!err) {

                res.render('template/books/list-books', {books, authors, messages, status});

                } else {
    
                    res.redirect('list-books/?m=Something went wrong&s=danger');

                }
        });

        } else {
    
            res.redirect('/list-books/?m=Something went wrong&s=danger');

        } 
    });
});

app.get('/edit-book/:id', (req, res) =>{

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id = req.params.id;
    let messages = req.query.m;
    let status = req.query.s;

    db.query(`SELECT * FROM books WHERE id = '${id}'`, (err, books) => {
        
        if(!err) {
            
            db.query(`SELECT id, name, surname FROM authors`, (err, authors) => {

                books = books[0];
                
                authors.forEach(function(val, index) {

                    if(books['author_id'] == val['id'])
                    authors[index]['selected'] = true;
                });

                if(err) {
                    res.render('template/books/add-book', {books, messages: 'Cannot get books from database', status: 'danger'});
                } else {
                    res.render('template/books/edit-book', {books, authors, messages, status});
                }
                
            });

        } else {

            res.redirect('/list-books/?m=No such book&s=danger');

        }

    });

});

app.post('/edit-book/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id                  = req.params.id;
    let title               = req.body.title;
    let pages               = req.body.pages;
    let isbn                = req.body.isbn;
    let short_description   = req.body.short_description;
    let author_id           = req.body.author;

    db.query(`UPDATE books SET title = '${title}', pages = '${pages}', isbn = '${isbn}', short_description = '${short_description}', author_id = '${author_id}' WHERE id = '${id}'`, (err, resp) => {
        if(!err) {
            res.redirect('/list-books');
        }
    });
});

app.get('/delete-book/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }
    
    let id = req.params.id;

    db.query(`DELETE FROM books WHERE id = '${id}'`, (err, resp) => {
        if(!err) {
            res.redirect('/list-books/?m=Book successfully deleted&s=success');
        } else {
            res.redirect('/list-books/?m=Cannot delete book&s=danger');
        }
    });
});

module.exports = app;