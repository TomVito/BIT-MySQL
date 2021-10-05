let deleteCompany = document.querySelectorAll('.btn-delete-company');

deleteCompany.forEach(node => node.addEventListener("click", function(e) {

    e.preventDefault();

    if(confirm('Delete company?')) 
        window.location = node.getAttribute('href');
}));

let deleteClient = document.querySelectorAll('.btn-delete-client');

deleteClient.forEach(node => node.addEventListener("click", function(e) {

    e.preventDefault();

    if(confirm('Delete client?')) 
        window.location = node.getAttribute('href');
}));