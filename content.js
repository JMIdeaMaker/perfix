CUtil = {
	get_element_by_xpath : function(path){
		return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	},
	get_path_to : function(element) {
	    if (element.id!=='')
	        return 'id("'+element.id+'")';
	    if (element===document.body)
	        return element.tagName;

	    var ix= 0;
	    var siblings= element.parentNode.childNodes;
	    for (var i= 0; i<siblings.length; i++) {
	        var sibling= siblings[i];
	        if (sibling===element)
	            return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
	        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
	            ix++;
	    }
	},
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

CTemplate = {
	render: function(){
		CTemplate.clicks();
		CTemplate.load_scripts();
	},
	load_scripts : function(){
		CUtil.load_css(chrome.extension.getURL('lib/css/bootstrap.css'))
		CUtil.load_css('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css')
		CUtil.load_css(chrome.extension.getURL('style.css'))

		CUtil.load_js('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js')
		CUtil.load_js('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js')
		CUtil.load_js(chrome.extension.getURL('lib/js/bootstrap_bundle.js'))
	},
	overwrite_importants : function(){
		$(document.styleSheets).each(function(i, item){
			try{
				$(item.cssRules).each(function(j, jtem){
					if (jtem.cssText.indexOf('!important') > -1){
						jtem.style.cssText = jtem.cssText.replace('!important', '');
					}
				})
			} catch (error) {
				console.log(error);
			}
		})
	},
	clicks: function(){
		
	},
	show_slide : function(slide){
		var $element = CUtil.get_element_by_xpath(slide[0])
		$element = $($element) // jQuerify

		$element.get(0).scrollIntoView();

		var element_class = $element.attr('class');
		$element.css({'box-shadow' : '10px 10px 51px -5px rgba(0,0,0,0.75)',
					  '-moz-box-shadow' : '10px 10px 51px -5px rgba(0,0,0,0.75)',
	                  '-webkit-box-shadow': '10px 10px 51px -5px rgba(0,0,0,0.75)'
	                })

		$element.popover({
			html: true,
			content: '<div class="fancypopover poppy"> ' + 
					 slide[1] + 
					'<a href="#" class="next-button btn btn-success btn-sm"> Next </a>' +
					'</div>'
		})
		$element.popover('show');
		//CTemplate.overwrite_importants();

		$element.addClass('poppy');

		$('.next-button').click(function(e){
			if(CData.current_tut_slides.length > CData.st_index){
				CData.st_index += 1;
				CData.start_or_cont_tutorial(CData.current_tut_slides);
			}	
		})
		
		
	},
	unshow_slide: function(slide){
		var $element = CUtil.get_element_by_xpath(slide[0]);
		$element = $($element)
		$element.css({'box-shadow' : '0px 0px 0px 0px rgba(0,0,0,0.75)',
					  '-moz-box-shadow' : '0px 0px 0px 0px rgba(0,0,0,0.75)',
	                  '-webkit-box-shadow': '0px 0px 0px 0px rgba(0,0,0,0.75)'
	                })
		$element.popover("hide");
		$element.removeClass("poppy");
	}
}

CData = {
	st_index : 0,
	current_tut_slides: null,
	is_picking_element: false,
	start_or_cont_tutorial: function(tut_slides){

		if (CData.st_index == 0){
			$('body').append(
				$('<div/>', {
					class: 'blanket',
				})
			)

			$('.blanket').css({height: $('body').height()})
		}else if (CData.st_index > 0){
			CTemplate.unshow_slide(tut_slides[CData.st_index - 1])
		}
		CTemplate.show_slide(tut_slides[CData.st_index]);
	},
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
	switch (request[0]){
		case 'load-demo-tut':

			CData.current_tut_slides = request[1];
			CData.start_or_cont_tutorial(request[1]);

			CTemplate.clicks();
			
			break;
		case 'load-tut':
			console.log('unf');
			break;

		case 'pick-element':
			CData.is_picking_element = true;
			$('body').on('mouseover', function(e){
				if(CData.is_picking_element){
					$element = $(e.target);
					$element.addClass('hoverborder');
				}
			}).on('mouseout', function(e){
				if(CData.is_picking_element){
					$element = $(e.target);
					$element.removeClass('hoverborder');
				}
			}).keydown(function(e){
				if(e.which == 13){
					alert('test');
					if(CData.is_picking_element){
						$element = $(e.target);
						CData.is_picking_element = false;
						sendResponse(CUtil.get_path_to($element))
					}
				}
			})

			
			break;
		case 'load-ui':

			var $pageui = $('<div/>', {
				id: 'pageui'
			})

			$('body').append($pageui);

			var ui = chrome.extension.getURL("ui.html");
			$('#pageui').load(ui);
			
			break;

		case 'load-tutorials':
			alert('yoyoma')

			break;
	}
		 
})

$(document).ready(function(e){
	CTemplate.render();

})