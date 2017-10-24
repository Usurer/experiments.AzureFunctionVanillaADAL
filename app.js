var clientId = '';      // fcd591bb-44a4-4234-a8d5-d85b3a322064
var tenant = '';        // yourdomain.onmicrosoft.com
var functionUrl = '';   // https:/yourapp.azurewebsites.net/api/HttpTriggerCSharp1

function popUpLoginCallback(errorDescription, token, error){
    window.location.href = 'http://localhost';
}

$(document).ready(function(){

    if(clientId.length !== 36 || tenant.length < 1) {
        alert('Please set proper clientId and tenant in js sources.');
    }
    
    var openAuthInPopup = true;
    var config = {
        clientId: clientId, 
        tenant: tenant, 
        popUp: openAuthInPopup, 
        callback: openAuthInPopup ? popUpLoginCallback : undefined
    }

    var ac = new AuthenticationContext(config);
    
    if(!openAuthInPopup) {
        handleAADCallback(ac); // If auth was opened in the same window - process the callback (will extract token from url hash part, AFAIK)
    }

    var user = ac.getCachedUser();
    var token = ac.getCachedToken(clientId);

    setControlsState(isLoggedIn(user, token));

    $('#login').click(function(){
        if(!isLoggedIn(user, token)) {
            ac.login();
        }
    });

    $('#logout').click(function(){
        ac.logOut();
    });
    
    $('#request').click(function(){            
        
        if(!isLoggedIn(user, token)) {
            alert('Not authorized');
            return;
        }

        $.ajax({
            method: "POST",
            url: functionUrl,
            headers: {
                'Authorization': 'Bearer ' +  token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ name: $('input').val() }),
            success: function(data){ 
                alert(data);
            },
            error: function(data){ 
                alert('Whoops, something went wrong.')
                console.info(data); 
            }
        });
    });
});

function handleAADCallback(ac){
    ac.handleWindowCallback();
}

function setControlsState(isLoggedIn) {
    if(!isLoggedIn) {
        $('#request').prop('disabled', 'true');
        $('#logout').prop('disabled', 'true').hide();
        $('#login').removeProp('disabled').show();
    } else {
        $('#request').removeProp('disabled');
        $('#logout').removeProp('disabled').show();
        $('#login').prop('disabled', 'true').hide();
    }
}

function isLoggedIn(user, token) {
    return user !== null && token !== null;
}