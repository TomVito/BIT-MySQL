let deleteCompany = document.querySelectorAll('.btn-delete-author');

deleteCompany.forEach(node => node.addEventListener("click", function(e) {

    e.preventDefault();

    if(confirm('Delete author?')) 
        window.location = node.getAttribute('href');
}));

let deleteClient = document.querySelectorAll('.btn-delete-book');

deleteClient.forEach(node => node.addEventListener("click", function(e) {

    e.preventDefault();

    if(confirm('Delete book?')) 
        window.location = node.getAttribute('href');
}));