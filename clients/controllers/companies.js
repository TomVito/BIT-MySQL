const express = require('express');
const app = express.Router();
const path = require('path');
const db = require('../db/connection');
const validator = require('validator');

app.get('/add-company', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    res.render('template/company/add-company');
});

app.post('/add-company', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }
    
    let companyName     = req.body.name;
    let companyAddress  = req.body.address;

    if(!validator.isAlphanumeric(companyName, 'en-US', {ignore: ' .,ąĄčČęĘėĖįĮšŠųŲžŽ'}) || !validator.isLength(companyAddress, {min: 3, max: 50})) {
        res.redirect('/list-companies/?m=Wrong company name&s=danger');
        return;
    }

    if(!validator.isAlphanumeric(companyAddress, 'en-US', {ignore: ' .,ąĄčČęĘėĖįĮšŠųŲžŽ'}) || !validator.isLength(companyAddress, {min: 3, max: 100})) {
        res.redirect('/list-companies/?m=Wrong company address&s=danger');
        return;
    }

    db.query(`SELECT * FROM companies WHERE name = '${companyName}'`, (err, resp) => {

        if(err) {
            res.redirect('/list-companies/?m=Something went wrong&s=danger');
            return;
        }

        if(resp.length == 0) {
            
            db.query(`INSERT INTO companies (name, address) 
                    VALUES ( '${companyName}' , '${companyAddress}' )`
            , err => {
                if(err) {
                    console.log(err);
                    return;
                }
                res.redirect('/list-companies/?m=Company successfully added&s=success');
            });
        } else {
            res.redirect('/list-companies/?m=Company with that name already exists&s=warning');
        }
    });
});

app.get('/list-companies', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let messages = req.query.m;
    let status = req.query.s;

    db.query(`SELECT * FROM companies ORDER BY companies.id ASC`, (err, resp) => {
        if(!err) {
            res.render('template/company/list-companies', {companies : resp, messages, status});
        }
    });
});

app.get('/edit-company/:id', (req, res) =>{

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id = req.params.id;
    let messages = req.query.m;
    let status = req.query.s;

    db.query(`SELECT * FROM companies WHERE id = '${id}'`, (err, resp) => {
        if(!err) {
            res.render('template/company/edit-company', {edit : resp, messages, status});
        }
    });
});

app.post('/edit-company/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id = req.params.id;
    let companyName     = req.body.name;
    let companyAddress  = req.body.address;

    if(!validator.isAlphanumeric(companyName, 'en-US', {ignore: ' .ąĄčČęĘėĖįĮšŠųŲūŪ'}) 
        || !validator.isLength(companyName, {min: 3, max: 50})) {
        res.redirect('/edit-company/' + id +'/?m=Enter company name&s=danger'); 
        return;
    }

    if(!validator.isAlphanumeric(companyAddress, 'en-US', {ignore: ' .ąĄčČęĘėĖįĮšŠųŲūŪ'}) 
        || !validator.isLength(companyAddress, {min: 3, max: 100})) { 
        res.redirect('/edit-company/' + id +'/?m=Enter company address&s=danger'); 
        return;
    }

    db.query(`UPDATE companies SET name = '${companyName}', address = '${companyAddress}' WHERE id = '${id}'`, (err, resp) => {
        if(!err) {
            res.redirect('/list-companies');
        }
    });
});

app.get('/delete-company/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }
    
    let id = req.params.id;

    db.query(`DELETE FROM companies WHERE id = '${id}'`, (err, resp) => {
        if(!err) {
            res.redirect('/list-companies/?m=Company successfully deleted&s=success');
        } else {
            res.redirect('/list-companies/?m=Cannot delete entry&s=danger');
        }
    });
});

module.exports = app;