Data = {
	is_local : true,
	tutorials: null,
	slides: null,
}
API = {
	url_base : Data.is_local ? 'http://127.0.0.1:8000' : 'http://perfix.ideamakr.com',
	setup_ajax : function(){
	    function getCookie(name) {
		    var cookieValue = null;
		    if (document.cookie && document.cookie != '') {
			    var cookies = document.cookie.split(';');
			    for (var i = 0; i < cookies.length; i++) {
				    var cookie = jQuery.trim(cookies[i]);
				    // Does this cookie string begin with the name we want?
				    if (cookie.substring(0, name.length + 1) == (name + '=')) {
					    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					    break;
				    }
			    }
		    }
		    return cookieValue;
	    }
	    var csrftoken = getCookie('csrftoken');
	    function csrfSafeMethod(method) {
		    // these HTTP methods do not require CSRF protection
		    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	    }
	    $.ajaxSetup({
		    beforeSend: function(xhr, settings) {
			    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				    xhr.setRequestHeader("X-CSRFToken", csrftoken);
			    }
		    }
	    });
    },
	login : function(){ 
		$.ajax({
          	url: API.url_base + '/rest-auth/login/', 
          	type: 'POST',
          	datatype:'json',
          	data: {
            	username: $('#username').val(),
            	password: $('#password').val(),
            	email: $('#email').val(),
          	}, 
          	success: function(d, s, h) {
            	localStorage['token'] = d['data']['key'];
            	Template.hide_login();
            	
          	},
        });	
	},
	get_tutorials : function(){
		$.ajax({
          	url: API.url_base + '/api/get_tutorials/', 
          	type: 'GET',
          	datatype:'json',
          	success: function(d) {

          		localStorage['tutorials'] = JSON.stringify(d.data.tutorials);
          		localStorage['slides'] = JSON.stringify(d.data.slides);
          		Template.list_tutorials(localStorage['tutorials'])
          	},
        });	
	},
	
}
Template = {
	render : function(){
		Template.clicks();
		Template.onloads();
		API.setup_ajax();
	}, 
	onloads : function(){
		if(localStorage['token']){
			Template.hide_login();
		}

		if(!localStorage['tutorials']){
			API.get_tutorials();
		}else{
			Template.list_tutorials(localStorage['tutorials'])
		}
	},
	list_tutorials: function(data){
		$('#savedtuts').html('');
		$(data).each(function(i, item){
			$('#savedtuts').append(
				$('<div/>', {
					class: 'saved-tut-item',
					text: item.title,
				})
			)
		});
	},
	hide_login : function(){
		$('#username').hide();
		$('#email').hide();
    	$('#password').hide();
    	$('#login').hide();
    	$('#message').text('You are logged in.');
    	$('#loadui').show();
	},
	clicks : function(){

		$('#login').click(function(e){
			API.login()
		})

		$('#loadui').click(function(e){
			chrome.tabs.query({currentWindow:true, active: true }, function (tabs){
				chrome.tabs.sendMessage(tabs[0].id, ['load-ui', localStorage['token']])
			})
		})
	},
}
$(document).ready(function(e){
	Template.render()
});