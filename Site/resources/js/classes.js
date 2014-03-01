"use strict";

/*================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================*/
/* Home Page Template Class */
(function($)
{
	$.fn.Home = function(options, deeplink, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		var slider = _this_.find('.slider');
		var slideshowSpeed = o.home.slider.slideshowSpeed;
		var animationSpeed = o.home.slider.animationSpeed;
		var pauseOnHover = false;

		var slider_next = '.page-controls a.next';
		var slider_prev = '.page-controls a.previous';

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){},

			hold: false
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		this.setup = function()
		{
			slider.flexslider({
				animation: o.home.slider.animation,
				easing: o.home.slider.easing,
				slideshowSpeed: slideshowSpeed,
				animationSpeed: animationSpeed,
				direction: "horizontal",
				controlNav: true,
				directionNav: false,
				selector: ".slides > li",
				animationLoop: true,
				smoothHeight: false,
				useCSS: false,
				prevText: "",
				nextText: "",
				initDelay: 0,
				pauseOnAction: true,
				pauseOnHover: pauseOnHover,
				start: function(slider)
				{
					var captions = slider.find(".slides li").eq(slider.currentSlide).find('.caption');
					captions.hide();
					if(captions.length > 0 )
					{
						var init_pos = captions.eq(slider.currentSlide).position().left;
							rollInCaptions(captions, slider);
							
					}
					
					sliderTimer.current(slider.currentSlide);
					sliderTimer.start();

					slider.find('.flex-direction-nav a, .flex-control-nav.flex-control-paging a').on('click', function()
					{
						sliderTimer.lock();
					});
					if(!window.HTMLCanvasElement)
					{
						slider.find('.flex-control-nav.flex-control-paging li').css({
							'background-image': 'url(resources/images/style/slider-timer.png)'
						});
					}
				},
				after: function(slider)
				{
					var captions = slider.find(".slides li").eq(slider.currentSlide).find('.caption');
					if(captions.length > 0 )
					{
						rollInCaptions(captions, slider);
					}
					sliderTimer.current(slider.currentSlide);
					sliderTimer.start();
				},
				before: function(slider)
				{
					sliderTimer.finish();
					var captions = slider.find(".slides li").eq(slider.animatingTo).find('.caption');
					captions.hide();
				}
			});

		}

		_this_.on('click', slider_next, function(e)
		{
			e.preventDefault();
			slider.flexslider("next");
		});

		_this_.on('click', slider_prev, function(e)
		{
			e.preventDefault();
			slider.flexslider("prev");
		});

		var sliderTimer = {
			i: 0,
			anim: {value: 0},
			canvas: null,
			ctx: null,
			interval: null,
			control: $(),
			locked: false,
			lock: function()
			{
				sliderTimer.locked = true;
			},
			current: function(current)
			{
				sliderTimer.control = slider.find('.flex-control-nav.flex-control-paging li').eq(current);
			},
			start: function()
			{
				if(window.HTMLCanvasElement)
				{
					$(sliderTimer.anim).stop(false, true);
					sliderTimer.canvas.hide();
					sliderTimer.control.append(sliderTimer.canvas);
					sliderTimer.anim.value = 0;
				}else{
					sliderTimer.anim.value = 0;
					slider.find('.flex-control-nav.flex-control-paging li').css({
						'background-position': '0px center'
					});
				}

				sliderTimer.play();
			},
			pause: function()
			{
				if(window.HTMLCanvasElement)
				{
					$(sliderTimer.anim).stop(false, false);
					//console.log('stop timer');
				}
				else
				{
					$(sliderTimer.anim).stop(false, false);
					//console.log('stop timer');
				}
			},
			resume: function()
			{
				sliderTimer.play();
				//console.log('resume timer');
			},
			play: function()
			{
				if(sliderTimer.locked)
				{
					return;
				}

				if(window.HTMLCanvasElement)
				{
					sliderTimer.canvas.show();
					
					$(sliderTimer.anim).animate({
						value: 360
					},{
						queue: false,
						duration: (slideshowSpeed - animationSpeed),
						easing: 'linear',
						step: function(now, fx)
						{
							drawCircle(sliderTimer.ctx, sliderTimer.canvas, now);
						},
						complete: function()
						{
							sliderTimer.canvas.fadeOut(animationSpeed/2);
						}
					});
				}
				else
				{
					$(sliderTimer.anim).animate({
						value: 51
					},{
						queue: false,
						duration: (slideshowSpeed - animationSpeed),
						easing: 'linear',
						step: function(now, fx)
						{
							sliderTimer.control.css({
								'background-position': (0 - Math.ceil(now) * 22) + 'px center'
							})
						},
						complete: function()
						{
							sliderTimer.control.css({
								'background-position': '0px center'
							});
						}
					});
				}
				
			},
			finish: function()
			{
				if(sliderTimer.locked)
				{
					return;
				}
			}
		}


		if(window.HTMLCanvasElement)
		{
			var canvas = $('<canvas width="23px" height="23px">').addClass('slider-timer');
			var ctx = canvas[0].getContext("2d");
			sliderTimer.canvas = canvas;
			sliderTimer.ctx = ctx;
			drawCircle(ctx, canvas, 0);
		}

		function drawCircle(ctx, canvas, degree)
		{
			ctx.clearRect(0, 0, 24, 24);
			//draw a circle
			ctx.beginPath();
			ctx.arc(11.5, 11.5, 9.5, Math.PI * 1.5, (Math.PI * 1.5) + (degree * (Math.PI / 180)), false);
			ctx.moveTo(0, 0);
			ctx.closePath();
			ctx.strokeStyle = "#8aa03c";
			ctx.lineWidth = 2;
			ctx.stroke();
		}
		if(pauseOnHover)
		{
			slider.hover(sliderTimer.pause, sliderTimer.resume);
		}


		function rollInCaptions(captions, slider)
		{
			captions.each(function(i)
			{
				var caption = $(this);
				var dir = $(this).attr('data-direction');

				$(this).show();

				var position_x = parseInt( $(this).attr('data-offset-left') );
				var position_y = parseInt( $(this).attr('data-offset-top') );

				//console.log(position_y, position_x);

				$(this).css({
					top: position_y,
					left: dir == undefined || dir == 'right' ? slider.width() + 20 : 0 - (slider.width() + 20)
				}).delay(200 * i).animate({
					left: position_x
				},{
					duration: o.page_switch_speed,
					easing: o.page_switch_easing
				});
				
			});
		}

		if(!this.hold)
		{
			this.setup();
		}
		

		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);

/*================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================*/
/* Contacts Page Template Class */
(function($)
{
	$.fn.Contacts = function(options, deeplink, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		/* contact form variables */
		var form = '.contact-form';
		var fields = 'input:not(input[type="submit"]), textarea, select';

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		/* Contact form functionality */
		function _form()
		{
			_this_.find(form).submit(function(e)
			{
				e.preventDefault();
				var form = $(this);
				var url = form.attr('action');
				var data = form.find(fields).serialize();

				

				form.find('[type="submit"]').attr('disabled', 'disabled');

				$.ajax({
					type: "POST",
					url: url,
					data: data,
					error: function(jqXHR, textStatus, errorThrown)
					{

					},
					success: function(data, textStatus, jqXHR)
					{
						//console.log(data);

						var tooltip = $('<div>');
						var _data = $.parseJSON( data );
						if(_data.error && _data.error != 'global')
						{
							form.find(fields).css({
								'border-color': ''
							});

							$('.field-error').fadeOut('fast', function()
							{
								$(this).remove();
							});

							var error_field = form.find('[name="'+ _data.error +'"]');
							error_field.css({
								'border-color': '#ff5050'
							});
							
							tooltip.attr('class', 'field-error message-box error');
							tooltip.html(_data.message);
							tooltip.hide().appendTo(form).fadeIn('fast');
							tooltip.css({
								top: form.find('[type="submit"]').position().top,
								left: form.find('[type="submit"]').position().left + form.find('[type="submit"]').outerWidth(true) + 10
							});
							form.find('[type="submit"]').removeAttr('disabled');
							
						}
						else if(_data.error && _data.error == 'global')
						{
							form.find(fields).css({
								'border-color': ''
							});

							$('.field-error').fadeOut('fast', function()
							{
								$(this).remove();
							});
							
							tooltip.attr('class', 'field-error message-box error');
							tooltip.html(_data.message);
							tooltip.hide().appendTo(form).fadeIn('fast');
							tooltip.css({
								top: form.find('[type="submit"]').position().top,
								left: form.find('[type="submit"]').position().left + form.find('[type="submit"]').outerWidth(true) + 10
							});

							tooltip.delay(10000).fadeOut('slow', function()
							{
								$(this).remove();
								form.find('[type="submit"]').removeAttr('disabled');
							});
						}
						else
						{
							$('.field-error').fadeOut('fast', function()
							{
								$(this).remove();
							});

							form.find(fields).css({
								'border-color': ''
							});
							tooltip.attr('class', 'form-success message-box success');
							tooltip.html(_data.message);
							tooltip.hide().appendTo(form).fadeIn('fast');
							tooltip.css({
								top: form.find('[type="submit"]').position().top,
								left: form.find('[type="submit"]').position().left + form.find('[type="submit"]').outerWidth(true) + 10
							});

							form.find(fields).val('');

							tooltip.delay(4000).fadeOut('slow', function()
							{
								$(this).remove();
								form.find('[type="submit"]').removeAttr('disabled');
							});
						}
						//console.log(data);
					}
				})

			});
			
		}

		_form();
		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);

/*================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================*/
/* Results Page Template Class */
(function($)
{
	$.fn.Results = function(options, deeplink, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		var map = '.google-map';

		var map_opener = 'a.to-map';
		var label_open = '.map-open';
		var label_closed = '.map-closed';

		var is_map_open = false;
		var is_map_loaded = false;

		var close_map = $('<a href="#">').addClass('close-map');
		
		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		this.loadMap = function(mobile)
		{

			_this_.map_container = $( $('<div>').append(_this_.find(map).clone()).html() );

			var Map = _this_.find(map);
			var lat_long = new google.maps.LatLng(
					parseFloat(Map.attr('data-latitude')), 
					parseFloat(Map.attr('data-longitude'))
				);

			var mapOptions = {
				center: lat_long,
				zoom: parseInt(Map.attr('data-zoom')),
				mapTypeId: google.maps.MapTypeId[
					Map.attr('data-type') && Map.attr('data-type') != '' ? Map.attr('data-type') : 'ROADMAP'
				]
			};
			var gMap = new google.maps.Map(Map[0], mapOptions);

//			if(Map.attr('data-pointer-title') != undefined)
//			{
//				var marker = new google.maps.Marker({
//					position: lat_long,
//					map: gMap,
//					title: Map.attr('data-pointer-title')
//				});
//			}     
			$.ajax({
				type: "POST", 
				//url: "http://localhost/WebServiceTest/MissionChestnutWebService.svc/GetTrees",
				url: "http://kesteni.bg/MissionChestnutWebService/MissionChestnutWebService.svc/GetTrees",
                                dataType: "json",
				contentType: "application/json; charset=utf-8",  
				data: '{ }', 
				success: function (result) {
                                    for (var i = 0; i < result.Trees.length; i++) {
                                        var treeLocation = new google.maps.LatLng(
                                            parseFloat(result.Trees[i].Latitude), 
                                            parseFloat(result.Trees[i].Longitude)
                                        );
                                        var marker = new google.maps.Marker({
                                            position: treeLocation,
                                            map: gMap,
                                            icon: 'resources/images/map/blue-dot.png'
                                        });
                                    }
				},
				error: function() {
                                    //alert('Error loading trees!');
				}
			});
                        
			_this_.find(map_opener).addClass('loading-opener');

			google.maps.event.addListener(gMap, 'idle', function()
			{
				is_map_loaded = true;
				_this_.find(map_opener).removeClass('loading-opener');
				_this_.openMap();
			});
		}

		this.openMap = function()
		{
			//console.log(_this_.find(map));
			_this_.find(map).css({
				visibility: 'visible'
			}).animate({
				left: 0,
				opacity: 1
			},{
				queue: false,
				duration: o.page_switch_speed,
				specialEasing: {
					left: o.page_switch_easing,
					opacity: 'easeOutQuad'
				},
				complete: function()
				{
					is_map_open = true;
					_this_.prepend(close_map);

					close_map.animate({
						opacity: 1
					}, {
						queue: false,
						duration: o.page_switch_speed,
						easing: o.page_switch_easing
					});


				}
			});
		}

		this.closeMap = function()
		{
			close_map.animate({
				opacity: 0
			}, {
				queue: false,
				duration: o.page_switch_speed / 2,
				easing: o.page_switch_easing,
				complete: function()
				{
					close_map.remove();
				}
			});

			_this_.find(map).animate({
				left: -50,
				opacity: 0
			},{
				queue: false,
				duration: o.page_switch_speed,
				specialEasing: {
					left: o.page_switch_easing,
					opacity: 'easeOutExpo'
				},
				complete: function()
				{
					_this_.find(map).css({
						visibility: 'hidden'
					}).remove();

					_this_.append(_this_.map_container);

					is_map_loaded = false;
					is_map_open = false;
				}
			});
		}

		_this_.on('click', map_opener, function(e)
		{
			//e.preventDefault();
			if(is_mobile)
			{
				var Map = _this_.find(map);
				var lat = parseFloat(Map.attr('data-latitude'));
				var lon = parseFloat(Map.attr('data-longitude'));
				var zoom = parseInt(Map.attr('data-zoom'));

				var url = 'https://maps.google.com/maps?q='+lat+','+lon+'&hl=en&ll='+lat+','+lon+'&z='+ zoom +'';

				$(this).attr('href', url).attr('target', '_blank');

				return true;
			}
			else
			{

				if(!is_map_open)
				{
					if(!is_map_loaded)
					{
						_this_.loadMap();
					}else{
						_this_.openMap();
					}
				}else{
					_this_.closeMap();
				}
				return false;
			}
			
		});

		_this_.on('click', '.close-map', function(e)
		{
			e.preventDefault();
			_this_.closeMap();
		});

		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);

/*================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================*/
/* Standart Page Template Class */
(function($)
{
	$.fn.Standart = function(options, deeplink, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);

/* Box Loader Class */
(function($) 
{
	$.fn.BoxLoader = function(options, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		var loader_links = 'a.box-loader-link';
		var loader_data_container = '.box-loader-data';
		var box_loader_activate = 'a.box-loader-activate'
		var active_on_load = '.bl-activeate-on-child-link';
		var active_class_to_add = 'active';
		var nav_title = '.box-loader-nav-title';

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		this.setup = function()
		{
			var activator = _this_.find(box_loader_activate);
			if(activator.length > 0)
			{
				//console.log(activator);
				if(activator.length > 1)
				{
					var _href = $(activator[0]).attr('href');
					_this_.loadData(_href, activator[0]);
				}else{
					var _href = $(activator).attr('href');
					_this_.loadData(_href, activator);
				}
			}
		}

		this.loadData = function(__href, __element)
		{
			if(__href && __href != '' && __href != '#')
			{
				var _url = __href.split('#')[0];
				var _data_container = '#' + __href.split('#')[1];

				if(_this_.find(active_on_load).length > 0)
				{
					_this_.find(active_on_load)
						.removeClass(active_class_to_add)
						.has(__element).addClass(active_class_to_add);
				}else{
					_this_.find(loader_links).removeClass(active_class_to_add);
					__element.addClass(active_class_to_add);
				}
				

				var _obj = {
					section: _this_, 
					url: _url,
					page_container: _this_.find(loader_data_container),
					data_container: _data_container ? _data_container : 'body',
					data_container_self: true,
					advanced_height: true,
					direction: 'next', 
					success: function(data)
					{
						//console.log('loaded');
						imgCanvas();                 
					},
					complete: function()
					{
						//console.log('complete');
					},
					error: function(code)
					{
						//console.log(code);
					}
				};

				var text = _this_.find(loader_links).filter('a[href="'+ __href +'"]');
				if (text.length > 0)
				{
					_this_.find(nav_title).html(text.html());
				}

				switchPage(_obj);
			}
		}

		_this_.on('click', loader_links, function(e)
		{
			e.preventDefault();
			var _href = $(this).attr('href');

			_this_.loadData(_href, $(this));
		});

		this.setup();

		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);

/* Ajax Loader */
var retries = 0;
var AjaxQueue = new Array();

function loadData(__object)
{
	if(__object.url && typeof(__object.url) == 'string')
	{
		if(firstLoad)
		{
			AjaxQueue.push( toAjax(__object) );
		}
		else
		{
			toAjax(__object);
		}
	}
}

var toAjax = function(__object)
{
	//console.log('sending to ajax', AjaxQueue);

	$('.mobile-preloader').show();

	return $.ajax({
		type: "GET",
		url: __object.url,
		dataType: 'text',
		context: document.body,
		cache: true,
		error: function(jqXHR, textStatus, errorThrown)
		{
			retries++;
			//console.log('Error lodaing data')
			if(retries < 3)
			{
				loadData(__object);
			}
			else
			{
				retries = 0;
				if(__object.error)
				{
					__object.error(textStatus);
				}
			}
			
		},
		statusCode: {
			404: function()
			{
				if(__object.section)
				{
					__object.section.on404('Could Not Load Data');
				}
			},
			412: function()
			{
				if(retries < 3)
				{
					loadData(__object);
				}
				else
				{
					retries = 0;
					if(__object.error)
					{
						__object.error(textStatus);
					}
				}
			}
		},
		beforeSend: function(jqXHR, textStatus)
		{
			jqXHR.setRequestHeader('Cache-Control', 'max-age=604800');
			if(__object.before)
			{
				__object.before();
			}
		},
		success: function(data, textStatus, jqXHR)
		{
			if(__object.success)
			{
				try
				{
					var doc = document.implementation.createHTMLDocument('');
					doc.documentElement.innerHTML = data;
				}
				catch(error)
				{
					var pattern = "<body[^>]*>([^<]*(?:(?!<\/?body)<[^<]*)*)<\/body\s*>";
					var re = new RegExp(pattern, 'i');
					var resault = re.exec(data);

					//console.log(resault[0]);
					if(resault)
					{
						var docIE = $(resault);
						docIE.find('head, script, style, meta, title, link').remove();
						var doc = docIE[0];
					}else{
						//console.error('The loaded document can not be parsed.');
					}
						
						
				}

				//console.log(doc);

				__object.success(doc);
			}
			retries = 0;
			$('.mobile-preloader').hide();
		}
	});
}

/* Animations */
function switchPage(__data)
{
	$('.mobile-preloader').show();
	__data.page_container.css({
		height: __data.advanced_height ? __data.section.height() - (__data.section.height() - __data.page_container.height()) : __data.section.height()
	}).animate({
		left: __data.direction == 'prev' ? !is_mobile ? 25 : 0 : !is_mobile ? -25 : 0,
		opacity: 0
	},{
		queue: false,
		duration: !is_mobile ? o.page_switch_speed : 1,
		specialEasing: {
			left: o.page_switch_easing,
			opacity: 'easeOutExpo'
		},
		complete: function()
		{
			$('.mobile-preloader').hide();
			if(__data.url)
			{
				if(!__data.do_not_append)
				{
					__data.page_container.empty();
				}
				loadData({
					section: __data.section,
					url: __data.url,
					success: function(data)
					{

						var new_content_data = !__data.data_container_self ? $(data).find(__data.data_container).children() : $(data).find(__data.data_container);
						
						//console.log(new_content_data);
						if(!__data.do_not_append)
						{
							__data.page_container.append(new_content_data)
						}

						var has_slider = __data.section.find('.project-media.slider').length > 0 ? true : false;
						
						var imgs = new_content_data.find('img').length;

						if(imgs > 0)
						{
							var im = 0;

							if(__data.section.loading)
							{
								__data.section.loading();
							}

							new_content_data.find('img').on('load', function()
							{
								im++;
								//console.log(imgs, im)
								if(imgs == im)
								{
									if(__data.section.loaded)
									{
										__data.section.loaded();
									}

									//console.log(new_content_data.find(hover_images).length)
									setTimeout(function()
									{
										continuePageSwitch(__data);
									}, 200);
									
								}
							});
							
						}
						else
						{
							continuePageSwitch(__data);
						}

						if(__data.success)
						{
							if(__data.url == "mission-elements.html" && __data.data_container != "#mission-main"){
								deeplink.set(["mission"]);
								scrollto( $('#mission') );
							}

							if(__data.url == "chronology-elements.html" && __data.data_container != "#chronology-main"){
								deeplink.set(["chronology"]);
								scrollto( $('#chronology') );
							}

							//setup the timeliner when navigating to chronology-main section
							if(__data.data_container == "#chronology-main")
							{
								var timeliner = __data.section.find('#timelineContainer').length > 0 ? true :false;
								if(timeliner)
								{
									$.timeliner({startOpen: ['#25EX']});
								}
							}
							__data.success($(data));	
						}
						
					},
					error: function(code)
					{
						switchBack(__data);
						if(__data.error)
						{
							__data.error(code);	
						}
					}

				});
			}
			else
			{
				__data.page_container.css({
					left: __data.direction == 'prev' ? !is_mobile ? -50 : 0 : !is_mobile ? 50 : 0,
					opacity: 0,
					height: 'auto'
				}).animate({
					left: 0,
					opacity: 1
				},{
					queue: false,
					duration: o.page_switch_speed,
					specialEasing: {
						left: o.page_switch_easing,
						opacity: 'easeOutQuad'
					}
				});

				if(__data.callback)
				{
					__data.callback();	
				}
			}
			
		}
	});
}

function continuePageSwitch(__data)
{
	__data.page_container.css({
		left: __data.direction == 'prev' ? !is_mobile ? -50 : 0 : !is_mobile ? 50 : 0,
		opacity: 0,
		height: 'auto'
	}).animate({
		left: 0,
		opacity: 1
	},{
		queue: false,
		duration: !is_mobile ? o.page_switch_speed : 1,
		specialEasing: {
			left: o.page_switch_easing,
			opacity: 'easeOutQuad'
		},
		complete: function()
		{
			if(__data.complete)
			{
				__data.complete();
			}
		}
	});
}

function switchBack(__data, __stop)
{
	__data.page_container.animate({
		left: !is_mobile ? 25 : 0,
		opacity: !is_mobile ? 0 : 1
	},{
		queue: false,
		duration: !is_mobile ? o.page_switch_speed : 1,
		specialEasing: {
			left: o.page_switch_easing,
			opacity: 'easeOutExpo'
		},
		complete: function()
		{
			__data.page_container.empty();

			if(__data.section.stored)
			{
				__data.section.stored.appendTo(__data.page_container);
				__data.section.setup();
			}
			//console.log('<----', __stop);

			if(!__stop)
			{
				__data.page_container.css({
					left: !is_mobile ? -50 : 0,
					opacity: !is_mobile ? 0 : 1,
					height: 'auto'
				}).animate({
					left: 0,
					opacity: 1
				},{
					queue: false,
					duration: !is_mobile ? o.page_switch_speed : 1,
					specialEasing: {
						left: o.page_switch_easing,
						opacity: 'easeOutQuad'
					}
				});
			}

			if(__data.callback)
			{
				__data.callback();
			}
		}
	});
}

function switchAnimate(__section, __complete)
{
	var holder = __section.find('.section-holder');

	holder.animate({
		opacity: 0,
		left: -25
	},{
		queue: false,
		duration: !is_mobile ? o.page_switch_speed : 0,
		specialEasing: {
			left: o.page_switch_easing,
			opacity: o.page_switch_easing
		},
		complete: function()
		{
			if(__complete)
			{
				__complete();
			}
			holder.css({
				opacity: 0,
				left: 50
			}).animate({
				opacity: 1,
				left: 0
			},{
				queue: false,
				duration: !is_mobile ? o.page_switch_speed : 0,
				specialEasing: {
					left: o.page_switch_easing,
					opacity: 'easeOutQuad'
				},
				complete: function()
				{
					
				}
			});

		}
	});
}

/* HISTORY CLASS */
(function($)
{
	$.Deeplink = function()
	{
		var deeplink = this;
		deeplink.ignor_hash = false;
		deeplink.state = new Array();
		deeplink.is_HTML5 = window.history && window.history.pushState ? true : false
		function getState()
		{
			var hash = window.location.hash;
			var state = hash != "" && hash.substring(0,2) == "#/" ? hash.split('/') : hash;
			return state;
		}
		function setState(hash)
		{
			if(window.location.hash !=  '#' + hash)
			{
				window.location.hash = hash;
			}else{
				//deeplink.changed( deeplink.state );
			}
			//console.log(window.location.hash, hash);
			return true;
		}
		function replaceState(state)
		{
			var new_location = window.location.toString().split('#');
			//console.log(new_location);
			window.location.replace( new_location[0] + '#/' +state.join('/') );
			return true;
		}
		this.set = function(state)
		{
			var hash = '/' + state.join('/');
			setState(hash);
		}
		this.replace = function(state)
		{
			replaceState(state);
		}
		this.get = function()
		{
			return getState();
		}
		this.changed = function(){}
		this.ignor = function()
		{
			deeplink.ignor_hash = true;
		}
		this.unignor = function()
		{
			deeplink.ignor_hash = false;
		}
		$(window).on('hashchange', function() 
		{
			if(!deeplink.ignor_hash)
			{
				deeplink.state = getState();
				deeplink.changed( deeplink.state );
			}
			deeplink.unignor();
			//console.log('Hash Changed!', getState());
		});
		return this;
	}
})(jQuery);