function emailTemplateProvider(idtoken) {
    const emailMapper = {
        registration: 
`<div style='border:1px solid gray;width:50%;margin:0 auto;color:black;box-shadow: 5px 10px #888888;'>

<center>    
    <h1>Verify your email address</h1>
    <p>
        Please confirm that you want to use it as account email address.Once its done ,you will be able to start account.
    </p>
    <a style= " background-color:#007bff; 
            color:white;
            padding:10px 130px;
            margin-bottom:30px;
            text-align:center;
            text-decoration:none; 
            display:inline-block;" 
            href ='http://localhost:4200/verify/${idtoken}'>
            <b> Verify My Email</b>
    </a>
<center>
</div>`
    };

    return emailMapper;
}

module.exports = emailTemplateProvider