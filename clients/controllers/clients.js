const express = require('express');
const app = express.Router();
const path = require('path');
const db = require('../db/connection');
const validator = require('validator');
const multer  = require('multer');
const { fstat } = require('fs');

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

app.get('/list-clients', (req, res) => {

    let id = req.query.id;
    let messages = req.query.m;
    let status = req.query.s;
    let company_id = req.query.company_id;
    let where = (company_id) ? 'WHERE customers.company_id = ' + company_id : '';

    db.query(`SELECT * FROM companies`, (err, companies) => {

        if(!err) {

            if(company_id) {

                companies.forEach(function(val, index) {

                if(company_id == val['id'])
                    companies[index]['selected'] = true;
                
                });

            }

            db.query(`SELECT customers.id, customers.name, customers.surname, 
            customers.phone, customers.email, customers.photo, 
            customers.company_id, companies.name AS company
            FROM customers LEFT JOIN companies 
            ON customers.company_id = companies.id ${where} ORDER BY customers.id ASC`, (err, customers) => {

                if(!err) {

                    res.render('template/clients/list-clients', {customers, companies, messages, status});

                } else {

                    res.redirect('list-clients/?m=Something went wrong&s=danger');

                }
        }); 

        } else {

            res.redirect('/list-clients/?m=Something went wrong&s=danger');

        }
    });
});

app.get('/add-client', (req, res) => {

    db.query('SELECT id, name FROM companies', (err, resp) => {
        if(err) {
            res.render('template/clients/add-client', {message: 'Failed to get company from database'});
        } else {
            res.render('template/clients/add-client', {companies: resp});
        }
    });
});

app.post('/add-client', upload.single('photo'), (req, res) => {

    let clientName          = req.body.name;
    let clientSurname       = req.body.surname;
    let clientPhone         = req.body.phone;
    let clientEmail         = req.body.email;
    let clientPhoto         = (req.file) ? req.file.filename : '';
    let clientComments      = req.body.comments;
    let clientCompany_id    = req.body.company;

    if(!validator.isAlpha(clientName, 'en-US', {ignore: ' .ąĄčČęĘėĖįĮšŠųŲūŪ'})
    || !validator.isLength(clientName, {min: 3, max: 50})) {
    res.redirect('/list-clients/?m=Įveskite kliento vardą&s=danger'); 
    return;
    }

    if(!validator.isAlpha(clientSurname, 'en-US', {ignore: ' .ąĄčČęĘėĖįĮšŠųŲūŪ'})
    || !validator.isLength(clientSurname, {min: 3, max: 50})) {
    res.redirect('/list-clients/?m=Enter client surname&s=danger'); 
    return;
    }

    if(!validator.isMobilePhone(clientPhone, 'lt-LT')) {
    res.redirect('/list-clients/?m=Enter client phone number&s=danger'); 
    return;
    }

    if(!validator.isEmail(clientEmail)) {
    res.redirect('/list-clients/?m=Enter client email&s=danger'); 
    return;
    }

    if(!validator.isInt(clientCompany_id)) {
    res.redirect('/list-clients/?m=Choose company&s=danger'); 
    return;
    }

    if(clientComments) {
        clientComments = escape(clientComments);
    }

    db.query(`SELECT * FROM customers WHERE name = '${clientName}'`, (err, resp) => {

        if(resp.length == 0) {
            
            db.query(`INSERT INTO customers (name, surname, phone, email, photo, comments, company_id) 
                    VALUES ( '${clientName}' , '${clientSurname}' , '${clientPhone}' , '${clientEmail}' , '${clientPhoto}' , '${clientComments}' , '${clientCompany_id}')`
            , err => {
                if(err) {
                    console.log(err);
                    return;
                }
                res.redirect('/list-clients/?m=Client successfully added&s=success');
            });
        }
    });
});

app.get('/edit-client/:id', (req, res) =>{
    let id = req.params.id;
    let messages = req.query.m;
    let status = req.query.s;

    db.query(`SELECT * FROM customers WHERE id = '${id}'`, (err, customers) => {
        if(!err) {
            
            db.query(`SELECT id, name FROM companies`, (err, companies) => {

                customers = customers[0];

                companies.forEach(function(val, index) {

                    if(customers['company_id'] == val['id'])
                        companies[index]['selected'] = true;
                });

                if(err) {
                    res.render('template/clients/add-client', {customers, messages: 'Cannot get companies from database', status: 'danger'});
                } else {
                    res.render('template/clients/edit-client', {customers, companies, messages, status});
                }
                
            });

        } else {

            res.redirect('/list-clients/?m=No such client&s=danger');

        }

    });

});

app.post('/edit-client/:id', (req, res) => {

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

module.exports = app;