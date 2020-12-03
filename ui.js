Util = {
	load_css : function(url){

		var link = $('<link/>', {
			type : 'text/css',
			rel : 'stylesheet',
			href : url
		})

		$('head').append(link)
	},
	load_js : function(url){

		var script = $('<script/>', {
			type: 'text/javascript',
			async: true,
			src: url
		})

		$('body').append(script)
	}
}

Data = {
	is_local: true,
	tut_keys: [],
	demo_fixture : {
		title : 'Tutorial Demo',
		slides : [
			[
				'/html/body/div/div[2]/div/div/div/section[2]/div/div/div/div/div/div/div/div/div/div/div/section[2]/div/div/div/div/div/section/div/div/div[1]/div/div/div/div/div/div/form/table/tbody/tr[1]/td[1]/input', 
				'First, enter your first and last name.'
			],
			[
				'/html/body/div/div[2]/div/div/div/section[2]/div/div/div/div/div/div/div/div/div/div/div/section[2]/div/div/div/div/div/section/div/div/div[1]/div/div/div/div/div/div/form/table/tbody/tr[1]/td[2]/input',
				'Then, enter your phone number.'
			],
			[
				'/html/body/div/div[2]/div/div/div/section[2]/div/div/div/div/div/div/div/div/div/div/div/section[2]/div/div/div/div/div/section/div/div/div[1]/div/div/div/div/div/div/form/table/tbody/tr[2]/td/input',
				'After that, enter your email address.'
			],
			[
				'/html/body/div/div[2]/div/div/div/section[2]/div/div/div/div/div/div/div/div/div/div/div/section[2]/div/div/div/div/div/section/div/div/div[1]/div/div/div/div/div/div/form/table/tbody/tr[3]/td/textarea',
				'Finally, enter the message you would like to send us.'
			],
			[
				'/html/body/div/div[2]/div/div/div/section[2]/div/div/div/div/div/div/div/div/div/div/div/section[2]/div/div/div/div/div/section/div/div/div[1]/div/div/div/div/div/div/form/table/tbody/tr[4]/td/input[1]',
				'After all of this, click the submit button to send your message. Then you are done!'
			]
		]
	},
	current_working_tut : null,
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
          	headers: {
          		'Authorization': 'Token ' + localStorage['token'],
          	},
          	success: function(d) {
          		Template.list_tutorials(d.data.tutorials);
          		localStorage['tutorials'] = JSON.stringify(d.data.tutorials);
          		localStorage['slides'] = JSON.stringify(d.data.slides);
          	},
        });	
	},
	create_tutorial : function(){
		$.ajax({
          	url: API.url_base + '/api/create_tutorial/', 
          	type: 'POST',
          	datatype:'json',
          	data: {
            	title: $('#title').val(),
            	page_url: window.location.href,
          	}, 
          	headers: {
          		'Authorization': 'Token ' + localStorage['token'],
          	},
          	success: function(d) {
            	Data.current_working_tut = d.id;
				Template.resets.reset_tut_create_form();
				$('#create-tut-2-tab').click();
          	},
        });	
	},
	create_slide : function(){
		$.ajax({
          	url: API.url_base + '/api/create_slide/', 
          	type: 'POST',
          	datatype:'json',
          	data: {
            	xpath: $('#xpath').val(),
            	text: $('#text').val(),
            	index: $('#index').val(),
            	tutorial_id: Data.current_working_tut
          	}, 
          	success: function(d) {
            	Template.list_slides()
          	},
        });	
	},
	delete_tutorial: function(){
		$.ajax({
          	url: API.url_base + '/api/delete_tutorial/', 
          	type: 'POST',
          	datatype:'json',
          	data: {
            	tutorial_id: Data.current_working_tut,
          	}, 
          	success: function(d) {
            	$('#create-tut-1-tab').click();
          	},
        });	
	},
	delete_slide: function(){
		$.ajax({
          	url: API.url_base + '/api/delete_slide/', 
          	type: 'POST',
          	datatype:'json',
          	data: {
            	tutorial_id: Data.current_working_tut,
            	index: $('#index').val()
          	}, 
          	success: function(d) {
            	Template.list_slides()
          	},
        });	
	},
}
Template = {
	render : function(){
		Template.load_scripts();
		Template.clicks();
		Template.onloads();
		API.setup_ajax();
	}, 
	load_scripts : function(){
		CUtil.load_css(chrome.extension.getURL('lib/css/bootstrap.css'))
		CUtil.load_css('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css')
		CUtil.load_css(chrome.extension.getURL('style.css'))

		CUtil.load_js('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js')
		CUtil.load_js('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js')
		CUtil.load_js(chrome.extension.getURL('lib/js/bootstrap_bundle.js'))
	},
	resets : {
		reset_tut_create_form : function(){
			$('#title').val('');
		},
		reset_add_slide_form: function(){
			$('#xpath').val('');
			$('#text').val('');
		},
	},
	onloads : function(){
		if(localStorage['token']){
			Template.hide_login();
			API.get_tutorials();
		}

		$('.popupmain').draggable();
	},
	hide_login : function(){
		$('#username').hide();
		$('#email').hide();
    	$('#password').hide();
    	$('#login').hide();
	},
	load_saved_tuts_LS : function(){
		$('#savedtuts').html('');
		$(Object.keys(localStorage)).each(function(i, item){
			if (item.indexOf('tutorial') > -1){
				Data.tut_keys.push(item)
			}
		})
		$(Data.tut_keys).each(function(i, item){
			$('#savedtuts').append(
				$('<div/>', {
					class: 'saved-tut-item',
					text: item,
				})
			)
		});
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
	list_slides: function(data){
		$('#tutslides').html('');
		$(data).each(function(i, item){
			console.log(item);
		});
	},
	clicks : function(){
		$('#load-demo-tut').click(function(e){
			chrome.tabs.query({currentWindow:true, active: true }, function (tabs){
				chrome.tabs.sendMessage(tabs[0].id, ['load-demo-tut', Data.demo_fixture.slides])
			})
		});

		$('#createtut').click(function(e){
			$('#create-tut-1-tab').click();	
		})

		$('#back-to-general-create').click(function(e){
			$('#general-create-tab').click();
		})

		$('#back-to-create-tut-1').click(function(e){
			$('#create-tut-1-tab').click();
		});

		$('#create-tut-1-next').click(function(e){
			API.create_tutorial();
		})

		$('#add-slide').click(function(e){
			$('#add-slide').hide();
			$('#add-slide-form').show();
		})

		$('#cancel-add-slide').click(function(e){
			$('#add-slide').show();
			$('#add-slide-form').hide();
			Template.resets.reset_add_slide_form();
		})

		$('#save-slide').click(function(e){
			$('#add-slide').show();
			$('#add-slide-form').hide();
			var text = $('#text');
			var xpath = $('#xpath');
			localStorage['tutorial-' + Data.current_working_tut] = JSON.stringify(
				JSON.parse(localStorage['tutorial-' + Data.current_working_tut])['slides'].push({
					text: text,
					xpath: xpath,
				})
			);
			$('#slide-reel').append(
				$('<div/>', {
					text: text.substr(0, 20) + '...',
					class: 'slide-reel-item',
				})
			)
			Template.reset_add_slide_form();
		})

		$('.saved-tut-key').click(function(e){
			var tut_key = $(this).text()
			chrome.tabs.query({currentWindow:true, active: true }, function (tabs){
				chrome.tabs.sendMessage(tabs[0].id, ['load-tut', tut_key])
			})
		})

		$('#login').click(function(e){
			API.login()
		})

		$('#pick-element').click(function(e){
			Template.pick_element();
		})
	},
	pick_element : function(){
		chrome.tabs.query({currentWindow:true, active: true }, function (tabs){
			chrome.tabs.sendMessage(tabs[0].id, ['pick-element', null, Template.load_xpath])
		})
	},
	load_xpath : function(response){
		$('#xpath').val(response);
	}
}
$(document).ready(function(e){
	Template.render()
});