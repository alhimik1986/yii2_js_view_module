/**
 * ajax-форма для Yii.
 * @author Сидорович Николай <sidorovich21101986@mail.ru>
 * @link http://alhimik1986.tw1.ru
 * @copyright Copyright &copy; 2013
 * @license MIT
 * @depends jquery 1.7+ http://jquery.com/
 * @depends jquery.noty http://ned.im/noty/ (необязательно, но без нее не будут отображаться сообщения)
 * @depends jquery.event.drag 2.x http://threedubmedia.com (необязательно, без нее форму будет нельзя перемещать)
 */
var ajaxForm = function(){};          // Главная функция
var ajaxFormMessage = function(){};   // Вывод сообщения (в стиле wordpress) в заданный селектор и сообщение noty
var ajaxFormResizable = function(){}; // Функция, которая позволяет элементу менять размеры

(function($){
	// Главная функция.
	ajaxForm = function(options) {
		
		var settings; // Текущие настройки формы
		
		// Параметры по умолчанию.
		this.defaults = {
			csrf: {},  // Значение csrf для Yii framework, например, scrf: {YII_CSRF_TOKEN: d156a17a08c8bdaa5220da87a493da0abd07dbc6}.
			loadingElem: function(settings){return null;}, // jQuery-объект элемента, на котором показывать значок загрузки данных (если указан параметр dataTable, то loadingElem указывать не нужно)
			loadingStyle: function(settings){return 
				'position:absolute;margin-top:2px;margin-left:3px; width:16px; height:16px; background-image: url("/images/ajax-loader.gif"); background-repeat: no-repeat;';
			},
			
			// Собственно, форма (используется для плагина jquery.event.drag)
			form: {
				selector: '.ajax-form',         // Селектор обертки формы (включающую голову, тело и подвал формы)
				header:   '.ajax-form-title',   // Селектор элемента, при перемещении которого перемещается вся форма
				resizable:'.resizable',         // Селектор элемента для изменения размеров формы
				$: null                         // jQuery-объект формы, которая отправляет данные
			},
			// Кнопки закрытия формы
			close: {
				selector: '.ajax-form-close, .ajax-form-button-cancel', // Селектор, при клике на который закрывается форма
				on:       'click'             // Событие, при котором закрывается форма
			},
			
			// Инициализация формы, которая уже есть на странице
			initForm: {
				selector  : '.ajax-form'       // Селектор формы, имеющейся на странице на странице
			},
			
			// Кнопки появления формы
			create: {
				selector  : '.ajax-form-button-create',// Селектор, при клике на который появляется форма
				on        : 'click',           // Событие, при котором появляется форма
				delegator : document,          // Делегатор, который при клике ищет selector: $(delegator).on(on, selector, function(){});
				ajax: function(settings){return false;},// Функция, которая выполняется перед запросом и должна 
					                           // возвращать параметры для $.ajax(params) в виде ассоциативного массива, 
				                               // которые потом смешиваются с данными по умолчанию, которые приведены ниже;
				                               // если возвращаемое значение = false, то отправка производиться не будет.
				url       : '',                // url-адрес страницы, откуда запрашивается форма (в AJAX-запросе)
				type      : 'get',             // Тип запроса (в AJAX-запросе)
				data      : {},                // Отправляемые данные (в AJAX-запросе)
				dataType  : 'json',            // Тип получаемых ответных данных (в AJAX-запросе)
				success   : function(data,settings){}, // Функция, которая выполняется, если запрос успешен (с проверкой наличия data.success)
				                                       // В этой функции обязательно нужно вернуть jQuery-объект полученной формы для ее последующей обработки (для функции afterSuccess)
				afterSuccess: function(settings,$elem){},// Функция, которая выполняется после функции success (служит для последующей обработки появившейся формы, например, сделать форму перемещаемой, применить jquery.chosen для выпадающиего списка внутри формы и т.д.)
				notValid  : function(data,settings){}, // Функция, которая выполняется, если отправляемые данные не валидны.
				error     : function(xhr, settings){}, // Функция, которая выполняется, если в результате запроса произошла ошибка
				errorSelector: '#error',       // Место, куда выводить текст ошибки
				
				//top       : 40,                // Расстояние формы от верха окна
				//left      : 150,               // Расстояние от формы до левого края
				top       : 'auto',            // Расстояние формы от верха окна (по умолчанию центруется по вертикали)
				left      : 'auto',            // Расстояние от формы до левого края (по умолчанию центруется по горизонтали)
				minPosY   : 50,                // Минимальный отступ(в пикселях) формы от верхнего края окна
				$         : null,              // jQuery-объект элемента, который вызвал событие
				e         : null,              // Параметр события при клике (нужен для внутренних целей, как глобальная переменная)
				xhr       : null,              // Значение, возвращаемое функцией $.ajax()
				timeout   : 50000              // Таймаут ajax-запроса
			},
			// Кнопка отправки данных с формы
			submit: {
				selector  : '.ajax-form-button-submit',
				on        : 'click',
				ajax: function(settings){return false;},// Функция, которая выполняется перед запросом и должна 
					                           // возвращать параметры для $.ajax(params) в виде ассоциативного массива, 
				                               // которые потом смешиваются с данными по умолчанию, которые приведены ниже;
				                               // если возвращаемое значение = false, то отправка производиться не будет.
				url       : '',                // url-адрес страницы, откуда запрашивается форма (в AJAX-запросе)
				type      : 'post',            // Тип запроса (в AJAX-запросе)
				data      : {},                // Отправляемые данные (в AJAX-запросе)
				dataType  : 'json',            // Тип получаемых ответных данных (в AJAX-запросе)
				success   : function(data,settings){}, // Функция, которая выполняется, если запрос успешен (с проверкой наличия data.success)
				                                       // В этой функции обязательно нужно вернуть jQuery-объект полученной формы для ее последующей обработки (для функции afterSuccess)
				afterSuccess: function(settings,$elem){},// Функция, которая выполняется после функции success (служит для последующей обработки появившейся формы, например, сделать форму перемещаемой, применить jquery.chosen для выпадающиего списка внутри формы и т.д.)
				notValid  : function(data,settings){}, // Функция, которая выполняется, если отправляемые данные не валидны.
				error     : function(xhr){},   // Функция, которая выполняется, если в результате запроса произошла ошибка
				errorSelector: '#error',       // Место, куда выводить текст ошибки
				
				$         : null,              // jQuery-объект элемента, который вызвал событие
				e         : null,
				xhr       : null,              // Значение, возвращаемое функцией $.ajax()
				timeout   : 50000              // Таймаут ajax-запроса
			},
			// Действия после удачной отправки данных с формы (выполняется, если submit.success что-нибудь возвращает; хотя бы пустой массив)
			// Нужна, например, если после отправки формы нужно обновить поле таблицы ajax-запросом.
			afterSubmit: {
				init      : function(){},
				ajax: function(settings){return false;},// Функция, которая выполняется перед запросом и должна 
					                           // возвращать параметры для $.ajax(params) в виде ассоциативного массива, 
				                               // которые потом смешиваются с данными по умолчанию, которые приведены ниже;
				                               // если возвращаемое значение = false, то отправка производиться не будет.
				url       : '',                // url-адрес страницы, откуда запрашивается форма (в AJAX-запросе)
				type      : 'get',             // Тип запроса (в AJAX-запросе)
				data      : {},                // Отправляемые данные (в AJAX-запросе)
				dataType  : 'json',            // Тип получаемых ответных данных (в AJAX-запросе)
				success   : function(data,settings){}, // Функция, которая выполняется, если запрос успешен (с проверкой наличия data.success)
				                                       // В этой функции обязательно нужно вернуть jQuery-объект полученной формы для ее последующей обработки (для функции afterSuccess)
				afterSuccess: function(settings,$elem){},// Функция, которая выполняется после функции success (служит для последующей обработки появившейся формы, например, сделать форму перемещаемой, применить jquery.chosen для выпадающиего списка внутри формы и т.д.)
				notValid  : function(data,settings){}, // Функция, которая выполняется, если отправляемые данные не валидны.
				error     : function(xhr){},   // Функция, которая выполняется, если в результате запроса произошла ошибка
				errorSelector: '#error',       // Место, куда выводить текст ошибки
				e         : null,
				xhr       : null,              // Значение, возвращаемое функцией $.ajax()
				timeout   : 50000              // Таймаут ajax-запроса
			},
			// Проверяет наличие переменной
			isset: function(data) { return (typeof(data) !== 'undefined' && data !== null); },
			_currentSetting: '', // Текущая настройка (вспомогательный элемент для функции _error())
			_loadingRequests: [], // Счетчик запросов (для внутренних нужд функции showLoading()
			
			// Специфическая вспомогательная функция для плагина dataTables.js. Нужна для заполнения таблицы данными при загрузке страницы.
			// Если указать парметр ajax, то данные будут запрашиваться ajax-запросом и перезапишут параметр dataTableData (данные для заполнения таблицы).
			dataTableOptions: {},             // настройки плагина dataTables
			updateTooltip: function(){},      // Функция, которая обновляет данные во всплывающих подсказках
			dataTable: {
				init: function(settings) {},
				selector: '',                 // css-селектор таблицы, к которой применить плагин dataTables
				$: null,                      // jQuery-объект DataTables
				dataTableData: {},            // данные для заполнения таблицы
				dataTable: function(settings){}, // внутренняя функция, которая применяет плагин dataTables
				
				// для формирования ajax-запроса данных для заполнения таблицы
				ajax: function(settings){return false;},// Функция, которая выполняется перед запросом и должна 
					                           // возвращать параметры для $.ajax(params) в виде ассоциативного массива, 
				                               // которые потом смешиваются с данными по умолчанию, которые приведены ниже;
				                               // если возвращаемое значение = false, то отправка производиться не будет.
				url       : '',                // url-адрес страницы, откуда запрашивается форма (в AJAX-запросе)
				type      : 'get',             // Тип запроса (в AJAX-запросе)
				data      : {},                // Отправляемые данные (в AJAX-запросе)
				dataType  : 'json',            // Тип получаемых ответных данных (в AJAX-запросе)
				success   : function(data,settings){}, // Функция, которая выполняется, если запрос успешен (с проверкой наличия data.success)
				                                       // В этой функции обязательно нужно вернуть jQuery-объект полученной формы для ее последующей обработки (для функции afterSuccess)
				afterSuccess: function(settings,$elem){},// Функция, которая выполняется после функции success (служит для последующей обработки появившейся формы, например, сделать форму перемещаемой, применить jquery.chosen для выпадающиего списка внутри формы и т.д.)
				notValid  : function(data,settings){}, // Функция, которая выполняется, если отправляемые данные не валидны.
				error     : function(xhr){},   // Функция, которая выполняется, если в результате запроса произошла ошибка
				errorSelector: '#error',       // Место, куда выводить текст ошибки
				xhr       : null,              // Значение, возвращаемое функцией $.ajax()
				timeout   : 50000,             // Таймаут ajax-запроса
				
				// Вспомогательные функции, которые будут использоваться внутри ajaxForm.create, ajaxForm.submit и т.д.
				updateRow: function(data, $tr, settings){},
				updateAll: function(data, settings){}
			}
		};
		
		
		
		// *********************************************************************************************************
		// **************** Вунтренние вспомогательные функции *****************************************************
		// *********************************************************************************************************
		
		// Проверяет наличие сообщений в полученных данных и, если они есть, то выводит их
		var _messages = function(data, setting) {
			var messages, message, type;
			if ( settings.isset(data) && settings.isset(data.messages) ) {
				messages = data.messages;
				for (key in messages) {
					for (type in messages[key]) {
						settings.message(setting.errorSelector, type, messages[key][type]);
					}
				}
			}
		};
		
		// Функция, которая выполняется, если в результате запроса произошла ошибка
		var _error = function(xhr, exception) {
			settings.showLoading(false);
			settings.unblockButtons(settings);
			
			// Очищаю предыдущие сообщения об ошибках
			_clearPreviousErrorMessages($(settings.form.selector));
			
			if (exception === 'timeout') {
				settings.message(settings._currentSetting.errorSelector, 'error', 'Сервер не отвечает или находится не в сети. Если ошибка будет продолжаться, то обратитесь к администратору сайта.');
			} else if (xhr.status === 12007) {
				settings.message(settings._currentSetting.errorSelector, 'error', 'Проверьте подключение к локальной сети.');
			} else {
				settings.message(settings._currentSetting.errorSelector, 'error', xhr.responseText);
			}
			settings._currentSetting.error(xhr, settings);
		};
		
		// Функция, очищает предыдущие сообщения об ошибках
		var _clearPreviousErrorMessages = function(form) {
			var tag;
			tag = form.find('.help-block');    if (tag.length != 0) tag.html('').hide();
			tag = form.find('.has-error');     if (tag.length != 0) tag.removeClass('has-error');
			tag = form.find('.errorMessage');  if (tag.length != 0) tag.hide();
			tag = form.find('.label-error');   if (tag.length != 0) tag.removeClass('label-error');
			tag = form.find('.input-error');   if (tag.length != 0) tag.removeClass('input-error');
			tag = form.find('.input-error');   if (tag.length != 0) tag.next('.chzn-container').removeClass('input-error');
		};
		
		// Если данные не валидны
		var _notValid = function(data, setting) {
			var model, model_id, attribute, name, form = $(settings.form.selector);
			
			// Очищаю предыдущие сообщения об ошибках
			_clearPreviousErrorMessages(form);
			
			for (model in data) {
				for (attribute in data[model]) {
					for (key in data[model][attribute]) {
						model_id = model.charAt(0).toLowerCase() + model.substr(1); // lcfirst(model)
						name = model_id+'-'+attribute;
						if (key == 0) { // Вывожу под текстовым полем только первую ошибку
							form.find('#'+name).next('.help-block').show().html(data[model][attribute][key]).show();;
							form.find('label[for="'+name+'"]').addClass('label-error');
							form.find('#'+name).addClass('input-error');
							form.find('#'+name).next('.chzn-container').addClass('input-error');
							form.find('#'+name).parents('.field-'+name).addClass('has-error');
						}
						// Сообщения выводятся все подряд.
						// Если некуда вывести ошибку валидации, то вывожу ее обычным сообщением
						if ( form.find('#'+name).next('.help-block').length == 0 ) settings.message(setting.errorSelector, 'error', data[model][attribute][key]);
						break;
					}
				}
			}
			
			settings.showLoading(false);
			settings.unblockButtons(settings);
		};
		
		// Если запрос успешен
		var _success = function(data) {
			settings.showLoading(false);
			settings.unblockButtons(settings);
			
			var setting = settings._currentSetting;
			
			if ( settings.isset(data) &&  settings.isset(data.status) && data.status == 'success' ) {
				settings.form.$ = setting.success(data.content, settings);
				setting._afterSuccess(setting);
				setTimeout(function(){
					setting.afterSuccess(settings, settings.form.$);
				}, 1);
			} else if ( settings.isset(data) && settings.isset(data.status) && data.status == 'error' ) {
				setting._notValid(data.content, setting);
				setting.notValid(data.content, settings);
			} else {
				settings.message(setting.errorSelector, 'error', data);
			}
			settings._messages(data, setting); // Проверяю наличие сообщений и вывожу их при наличии
		};
		
		// Если запрос успешен (для submit)
		var _success_submit = function(data) {
			settings.showLoading(false);
			settings.unblockButtons(settings);
			
			var setting = settings.submit;
			
			if ( settings.isset(data) && settings.isset(data.status) && data.status == 'success') {
				setting.success(data.content, settings);
				setting._afterSuccess(setting);
				setting.afterSuccess(settings);
				// Выполняю "Действия после удачной отправки формы" (afterSubmit), если в settings указан хоть один параметр этой функции
				if ( settings.isset(settings.options.afterSubmit)) {
					settings.afterSubmit._send(settings.afterSubmit);
				}
			} else if (settings.isset(data) && settings.isset(data.status) && data.status == 'error') {
				setting._notValid(data.content, setting);
				setting.notValid(data.content, settings);
			} else {
				settings.message(setting.errorSelector, 'error', data);
			}
			settings._messages(data, setting); // Проверяю наличие сообщений и вывожу их при наличии
		};
		
		// Появление формы, если запрос успешен. 
		var success = function(data, settings) {
			// Удаляем предыдующую форму, если мы не закроем предыдущую форму и откроем другую, то предыдущие нужно удалять, чтобы они не загромождали друг друга
			$(settings.form.selector).remove();
			settings.showLoading(false);
			settings.unblockButtons(settings);
			// В этой функции обязательно нужно вернуть jQuery-объект полученной формы для ее последующей обработки
			return $(data).appendTo('body');
		};
		
		// Системная пост-обработка формы (делаю форму перемещаемой)
		var _afterSuccess = function(setting) {
			var form = settings.form.$;
			if ( ! form)
				return;
			
			// Обработка формы, чтобы форма была по центру и могла перемещаться мышкой
			setting._handleForm(setting);
			
			// Привязываю событие для кнопки "Отравка данных с формы"
			//form.find(settings.submit.selector).on(settings.submit.on, function(e) {
			form.on(settings.submit.on, settings.submit.selector, function(e) {
				settings.submit.$ = $(this);
				settings.submit.e = e;
				settings.submit._send(settings.submit);
				return false;
			});
			
			// Привязываю событие для кнопки "Закрытие формы"
			form.find(settings.close.selector).on(settings.close.on, function(e) {
				$(this).parents(settings.form.selector).remove();
			});
		};
		
		// Обработка формы, чтобы форма была по центру и могла перемещаться мышкой
		var _centerFormAndDraggable = function(setting) {
			//var form = settings.form.$;
			//var e = setting.e, posX = e.pageX, posY = e.pageY, minTop = setting.minTop, maxLeft = setting.maxLeft, posY = minTop, posX = maxLeft;
			//if ((e.pageY - $(window).scrollTop()) > minTop) posY = $(window).scrollTop() + minTop;
			//if ((e.pageX - $(window).scrollLeft()) > maxLeft) posX = $(window).scrollLeft() + maxLeft;
			var form = settings.form.$;
			
			var e = setting.e,
				posX = (setting.left == 'auto') ? $(window).scrollLeft() + Math.round(($(window).width()  - form.width())  / 2) : setting.left,
				posY = (setting.top  == 'auto') ? $(window).scrollTop()  + Math.round(($(window).height() - form.height()) / 5) : setting.top;
			posY = (posY < setting.minPosY) ? setting.minPosY : posY;
			
			// Задаю форме начальное положение
			form.css({
				position: 'absolute',
				top: posY,
				left: posX
			});
			// Если jquery.event.drag загружен, то делаю форму перемещаемой
			var processing = false;
			if ($.fn.drag) {
				form.drag(function(ev, dd){
					var $this = $(this);
					if (processing) return false;
					setTimeout(function(){
						processing = true;
						$this.css({
							top: dd.offsetY,
							left: dd.offsetX
						});
						processing = false;
					}, 10);
				}, { handle: settings.form.header });
			}
			
			// Даю форме изменять размеры
			ajaxFormResizable(form, form.find('.ajax-form-body'), form.find('.ajax-form-footer'), $(settings.form.resizable));
		};
		
		// Отправка запроса
		var _send = function(setting) {
			var ajaxOptions = setting.ajax(settings);
			if (ajaxOptions === false) return;
			if (jQuery(settings.submit.selector).hasClass('blocked')) return;
			if ( ! settings.isset(ajaxOptions) || ! settings.isset(ajaxOptions['ajax'])) setting.data = {};
			$.extend(true, setting, ajaxOptions);
			if (setting.type == 'post') $.extend(true, setting.data, settings.csrf);
			
			settings._currentSetting = setting;
			
			settings.showLoading(true);
			settings.blockButtons(settings);
			
			setting.xhr = $.ajax({
				type:     setting.type,
				url:      setting.url,
				dataType: setting.dataType,
				data:     setting.data,
				success:  setting._success,
				error:    setting._error,
				timeout:  setting.timeout,
				cache:    false  // т.к. IE кэширует ajax-запросы
			});
		};
		
		
		
		// **************************************************************************************************************
		// Функция: ajaxFormMessage() - вывод сообщения (в стиле wordpress) в заданный селектор и сообщение noty
		// **************************************************************************************************************
		
		this.defaults.message = ajaxFormMessage;
		// Проверяет наличие сообщений в полученных данных и, если они есть, то выводит их
		this.defaults._messages = _messages;
		
		
		
		// *********************************************************************************************************
		// **************** Инициализация уже загруженной формы ****************************************************
		// *********************************************************************************************************
		
		this.defaults.initForm._init = function() {
			if ( ! settings.isset(settings.options.initForm) ) return;
			
			settings.form.selector = settings.initForm.selector;
			settings.form.$ = $(settings.initForm.selector).is('form') ? $(settings.initForm.selector) : $(settings.initForm.selector).find('form');
			var form = settings.form.$;
			
			// Привязываю событие для кнопки "Отравка данных с формы"
			//$(settings.form.selector).find(settings.submit.selector).on(settings.submit.on, function(e) {
			$(settings.form.selector).on(settings.submit.on, settings.submit.selector, function(e) {
				settings.submit.$ = $(this);
				settings.submit.e = e;
				settings.submit._send(settings.submit);
				return false;
			});
		};
		
		
		
		// *********************************************************************************************************
		// **************** Появление формы ************************************************************************
		// *********************************************************************************************************
		
		this.defaults.create._error        = _error;
		this.defaults.create._notValid     = _notValid;
		this.defaults.create._success      = _success;
		this.defaults.create.success       = success;
		this.defaults.create._afterSuccess = _afterSuccess;
		this.defaults.create._handleForm   = _centerFormAndDraggable;
		this.defaults.create._send         = _send;
		
		// Появление формы
		this.defaults.create._init = function(settings) {
			$(settings.create.delegator).on(settings.create.on, settings.create.selector, function(e) {
				settings.create.$ = $(this);
				settings.create.e = e;
				settings.create._send(settings.create);
				return false;
			});
		};
		
		
		
		// *********************************************************************************************************
		// **************** Отправка данных с формы *************************************************************************
		// *********************************************************************************************************
		
		this.defaults.submit._error        = _error;
		this.defaults.submit._notValid     = _notValid;
		this.defaults.submit._success      = _success_submit;
		this.defaults.submit._afterSuccess = function(){};
		this.defaults.submit._handleForm   = function(){};
		this.defaults.submit._send         = _send;
		
		
		
		// *********************************************************************************************************
		// **************** Действия после удачной отправки данных с формы *****************************************
		// *********************************************************************************************************
		
		this.defaults.afterSubmit._error        = _error;
		this.defaults.afterSubmit._notValid     = _notValid;
		this.defaults.afterSubmit._success      = _success;
		this.defaults.afterSubmit._afterSuccess = function(){};
		this.defaults.afterSubmit._handleForm        = function(){};
		this.defaults.afterSubmit._send         = _send;
		
		
		
		// *********************************************************************************************************
		// **************** Специфическая вспомогательная функция для плагина dataTables.js ************************
		// *********************************************************************************************************
		
		this.defaults.dataTable._error        = _error;
		this.defaults.dataTable._notValid     = function(){};
		this.defaults.dataTable._success      = _success;
		this.defaults.dataTable._afterSuccess = function(){};
		this.defaults.dataTable._handleForm      = function(){};
		this.defaults.dataTable._send         = _send;
		
		this.defaults.dataTable.success = function(data, settings) {
			try {
				settings.dataTable.dataTableData = $.parseJSON(data);
			} catch (e) {
				settings.dataTable.dataTableData = {};
				notyMessage('error', 'Не удалось обработать принятые данные.');
			}
			settings.dataTable.updateAll(settings.dataTable.dataTableData, settings); // Применяю плагин dataTables
		};
		
		// Действия при загрузке страницы (заполняю таблицу данными)
		this.defaults.dataTable._init = function(settings) {
			if ( ! settings.isset(settings.options.dataTable)) return;
			
			settings.dataTable.dataTable(settings);       // Применяю плагин DataTables
			settings.dataTable._send(settings.dataTable); // Обновляю всю таблицу (заполняю данными)
			settings.dataTable.init(settings);
		};
		
		var fnRowCallback = function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {
			if ( ! settings.isset(aData.attributes)) return nRow;
			
			var $nRow = $(nRow); var oldClass1 = '', oldClass2 = ''; var key, k;
			
			for (key in aData.attributes) {
				// Удаляю аттрибут class в строке таблицы, кроме классов "odd" и "even"
				if ($.trim(key) == 'class') {
					oldClass1 = $nRow.hasClass('odd') ? 'odd': '';
					oldClass2 = $nRow.hasClass('even') ? 'even': '';
					$nRow.removeAttr('class');
					if (oldClass1.length != 0) $nRow.addClass(oldClass1);
					if (oldClass2.length != 0) $nRow.addClass(oldClass2);
				}
				
				// аттрибуты для td (если есть)
				if ( Object.prototype.toString.call( aData.attributes[key] ) === '[object Object]') {
					for (k in aData.attributes[key]) {
						if ($.trim(k) == 'class') {
							$nRow.find('td:eq('+key+')').addClass(aData.attributes[key][k]);
						} else {
							$nRow.find('td:eq('+key+')').attr(k, aData.attributes[key][k]);
						}
					}
				} else {
					// аттрибуты для tr
					if ($.trim(key) == 'class') {
						$nRow.addClass(aData.attributes[key]);
					} else {
						$nRow.attr(key, aData.attributes[key]);
					}
				}
			}
			return nRow;
		};
		
		// Функция, которая применяет плагин dataTables
		this.defaults.dataTable.dataTable = function(settings) {
			var dataTableOptions = settings.dataTable.dataTableOptions;
			dataTableOptions['aaData'] = settings.dataTable.dataTableData;
			dataTableOptions['fnRowCallback'] = fnRowCallback;
			
			// Уничтожаю предыдущий экземпляр таблицы, если он есть
			if (settings.dataTable.$ != null && typeof(settings.dataTable.$.fnDestroy) != 'undefined') settings.dataTable.$.fnDestroy();
			
			var $dataTables = $(settings.dataTable.selector).dataTable(dataTableOptions);
			if (typeof(settings.dataTable.updateTooltip) === 'function') settings.dataTable.updateTooltip($dataTables);
			$(settings.dataTable.selector).fixedTableHeader();
			$('.dataTables_filter input:first').focus();
			
			// Очищаю переменную для бережения памяти
			settings.dataTable.dataTableData = '';
			
			// Сохраняю jQuery-объект плагина
			settings.dataTable.$ = $dataTables;
			
			// Инициализирую всплывающие подсказки при каждом обновлении таблицы.
			$dataTables.on('draw', function(){
				if (typeof(settings.dataTable.updateTooltip) === 'function') settings.dataTable.updateTooltip($dataTables);
			});
		};
		
		/**
		 * Обновить строку таблицы.
		 * @param object aData Данные таблицы в том же формате, что и для DataTables, НО аттрибуты строки таблицы содержатся в ключе "attributes".
		 * @param jQuery $nRow jQuery-объект строки таблицы ($tr).
		 * @param object settings Настройки текущего объекта ajax-формы.
		 */
		this.defaults.dataTable.updateRow = function(aData, $nRow, settings) {
			//console.log(aData);
			var key, td_key, attr_key, k;
			aData = aData[0];
			
			if (settings.isset(aData.attributes)) {
				for (key in aData.attributes) {
					// Удаляю аттрибут class в строке таблицы, кроме классов "odd" и "even"
					if ($.trim(key) == 'class') {
						oldClass1 = $nRow.hasClass('odd') ? 'odd': '';
						oldClass2 = $nRow.hasClass('even') ? 'even': '';
						$nRow.removeAttr('class');
						if (oldClass1.length != 0) $nRow.addClass(oldClass1);
						if (oldClass2.length != 0) $nRow.addClass(oldClass2);
					}
					// аттрибуты для tr
					if ($.trim(key) == 'class') {
						$nRow.addClass(aData.attributes[key]);
					} else {
						$nRow.attr(key, aData.attributes[key]);
					}
				}
			}
			// для каждого td
			if (settings.isset(aData[0]['content'])) {
				var result = [];
				for (td_key in aData) {
					if (td_key == 'attributes')
						continue;
					
					if (settings.isset(aData[td_key]['attributes'])) {
						for(attr_key in aData[td_key]['attributes']) {
							$nRow.find('td:eq('+td_key+')').attr(attr_key, aData[td_key].attributes[attr_key]);
						}
					}
					
					result[td_key] = aData[td_key]['content'];
				}
				aData = result;
			}
			//var attributes = aData['attributes'];
			
			/*settings.dataTable.$.fnUpdate(aData, $nRow[0]);
			settings.dataTable.$.fnDraw();*/
			
			// Обновляю строку так, чтобы не сбрасывался пейджер (не уходил на первую страницу)
			settings.dataTable.$.fnUpdate(aData, $nRow[0], iColumn=undefined, bRedraw=false);
		};
		
		/**
		 * Обновить всю таблицу.
		 * @param object oData Данные таблицы в том же формате, что и для DataTables, НО аттрибуты строки таблицы содержатся в каждом oData[0]['attributes'], oData[1]['attributes'] и т.д.
		 * @param object settings Настройки текущего объекта ajax-формы, в которой должны содержаться настройки (settings.dataTable.dataTableOptions) плагина DataTables.
		 */
		this.defaults.dataTable.updateAll = function(oData, settings) {
			var dataTableOptions = settings.dataTable.dataTableOptions;
			settings.dataTable.$.fnClearTable();
			
			dataTableOptions['aaData'] = oData;
			dataTableOptions['fnRowCallback'] = fnRowCallback;
			
			settings.dataTable.$.fnAddData(oData);
			
			// Очищаю поле для бережения памяти
			settings.dataTable.dataTableData = '';
		};
		
		// *********************************************************************************************************
		// ******************************** Прочие вспомогательные функции *****************************************
		// *********************************************************************************************************
		/**
		 * Показать скрыть значок загрузки.
		 * @param boolean show Показать-скрыть значок загрузки.
		 * @param mixed $elem jQuery-объект или селектор в виде строки, рядом с которым разместить значок загрузки.
		 */
		this.defaults.showLoading = function(show, $elem) {
			if ( ! settings.isset(show)) show = true;
			if ( ! settings.isset($elem)) $elem = settings.dataTable.$;
			if ( ! settings.isset($elem)) $elem = settings.loadingElem(settings);
			if (typeof $elem == 'string' || $elem instanceof String) $elem = jQuery($elem);
			if (settings.isset($elem) && $elem.length > 0) {
				if (show) {
					if ($elem.parent().find('.ajax-loading').length == 0) {
						$elem.before('<div class="ajax-loading" style="'+settings.loadingStyle(settings)+'"></div>');
					}
					settings._loadingRequests.push(true); // Увеличиваю счетчик отправленных запросов на 1.
				} else {
					settings._loadingRequests.shift(); // Уменьшаю счетчик отправленных запросов на 1.
					// Если число запросов равно числу ответов, то убираю значок загрузки
					if (settings._loadingRequests.length == 0) {
						$elem.parent().find('.ajax-loading').remove();
					}
				}
			}
		};
		
		/**
		 * Блокирует кнопки. Нужно, чтобы нельзя было выполнять другую операцию, пока не закончится предыдущая.
		 * @param object settings Настройки текущего объекта ajax-формы, в которой должны содержаться настройки (settings.dataTable.dataTableOptions) плагина DataTables.
		 */
		this.defaults.blockButtons = function(settings) {
			jQuery(settings.create.selector).addClass('blocked');
			
			if (settings.submit.$) {
				settings.submit.$.parents('form').find(settings.submit.selector).addClass('blocked');
			} else {
				jQuery(settings.submit.selector).addClass('blocked');
			}
			
			if (typeof(settings.close.$) != 'undefined' && settings.close.$ !== null) {
				settings.close.$.parents('form').find(settings.close.selector).addClass('blocked');
			} else {
				jQuery(settings.close.selector).addClass('blocked');
			}
		};
		
		/**
		 * Блокирует кнопки. Нужно, чтобы нельзя было выполнять другую операцию, пока не закончится предыдущая.
		 * @param object settings Настройки текущего объекта ajax-формы, в которой должны содержаться настройки (settings.dataTable.dataTableOptions) плагина DataTables.
		 */
		this.defaults.unblockButtons = function(settings) {
			jQuery(settings.create.selector).removeClass('blocked');
			
			if (settings.submit.$) {
				settings.submit.$.parents('form').find(settings.submit.selector).removeClass('blocked');
			} else {
				jQuery(settings.submit.selector).removeClass('blocked');
			}
			
			if (typeof(settings.close.$) != 'undefined' && settings.close.$ !== null) {
				settings.close.$.parents('form').find(settings.close.selector).removeClass('blocked');
			} else {
				jQuery(settings.close.selector).removeClass('blocked');
			}
		};
		
		
		
		// *********************************************************************************************************
		// **************** Уничтожение всех обработчиков событий **************************************************
		// **************** Пример: var f = new ajaxForm(); f.destroy(); ******************************************
		// *********************************************************************************************************
		this.defaults.destroy = function() {
			var $form = settings.form.$;
			$(document).off(settings.create.on, settings.create.selector);
			$(document).off(settings.close.on, settings.form.selector + ' ' + settings.close.selector);
			$(document).off(settings.submit.on, settings.form.selector + ' ' + settings.submit.selector);
			settings.form.$ && settings.form.$.off(settings.submit.on, settings.submit.selector);
			ajaxFormResizable($form, $form.find('.ajax-form-body'), $form.find('.ajax-form-footer'), $(settings.form.resizable), true);
		};
		
		
		
		// *********************************************************************************************************
		// **************** Запуск *********************************************************************************
		// *********************************************************************************************************
		
		if ( ! $.isPlainObject(options)) {
			options = {};
		}
		
		// Смешиваю полученные настройки (options) с настройками по умолчанию (defaults).
		$.extend(true, this.defaults, options);
		settings = this.defaults; // Получаю текущие настройки формы
		$.extend(true, this, this.defaults);
		
		settings.options = options;
		
		this.initForm._init(settings);  // Запуск "Инициализация уже загруженной формы"
		this.create._init(settings);    // Запуск "Появление формы"
		this.dataTable._init(settings); // Запуск "dataTable"
	};
})(jQuery)


// **************************************************************************************************************
//Функция: notyMessage - выводит всплывающие сообщения с заданным типом и текстом. jquery.noty
// **************************************************************************************************************
var notyMessage = function(type, text) {
	if (typeof(noty) !== 'function') return;
	var n = noty({
			text: text,
			type: type,
			timeout:3000,
		dismissQueue: false,
			layout: 'top',
			theme: 'defaultTheme'
	});
	return n;
};


// **************************************************************************************************************
// Функция: ajaxFormMessage() - вывод сообщения (в стиле wordpress) в заданный селектор и сообщение noty
// @param string selector - css-селектор, куда выводить сообщение
// @param string type     - тип сообщения (success, error, info, warning)
// @param string text     - текст сообщения
// **************************************************************************************************************
ajaxFormMessage = function(selector, type, text) {
	var data = '\
<table class="ajax-form-message-'+type+'">\
	<tr>\
		<td colspan="3" class="ajax-form-message-text">\
			<div class="ajax-form-message-icon-'+type+'"></div>\
			<div class="ajax-form-message-close" onclick="jQuery(this).parents(\'.ajax-form-message-'+type+'\').animate({opacity:0}, 500, function(){jQuery(this).remove();});" style="cursor:pointer; font-size:20px; padding:5px; position:absolute; right:0;">&times;</div>\
			<div class="ajax-form-message-text-body">' + text + '</div>\
		</td>\
	</tr>\
</table>';
	jQuery(selector).html(data);
	notyMessage(type, text);
};


// **************************************************************************************************************
// Функция: ajaxFormResizable - позволяет элементу менять размеры
// @param jQuery  $elemWidth - jquery-объект элемента, у которого нужно менять ширину
// @param jQuery  $elemHeight - jquery-объект элемента, у которого нужно менять высоту
// @param integer $elemHightCorrection - элемент, от высоты которого зависит коорректировка по высоте (корректирует смещение при изменении высоты)
// @param jQuery  handle  - jquery-объект элемента, из-за которого меняется размер
// @param boolean destroy - если true - то удаляю события, связанные с изменением размеров
// # http://stackoverflow.com/questions/4673348/emulating-frame-resize-behavior-with-divs-using-jquery-without-using-jquery-ui
// **************************************************************************************************************
ajaxFormResizable = function($elemWidth, $elemHeight, $elemHightCorrection, handle, destroy) {
	if (typeof(destroy) != 'undefined' && destroy == true) {
		handle.off('mousedown', mousedown);
		jQuery(document).off('mouseup', mouseup);
		return;
	}
	var p = {}, processing = false, lastE = false;
	
	
	var mousemove = function(e) {
		if ( ! processing) {
			processing = true;
			setTimeout(function(){
				mousemoveHandle();
			}, /MSIE (\d+\.\d+);/.test(navigator.userAgent) ? 30 : 1);
		}
		lastE = e;
	};
	
	var mousemoveHandle = function(){
		$elemWidth.css({
			width:  Math.max(370,  $elemWidth.scrollLeft() - $elemWidth.offset().left + lastE.pageX + 5) + 'px'
		});
		$elemHeight.css({
			height: Math.max(100, $elemHeight.scrollTop() - $elemHeight.offset().top - ($elemHightCorrection.height() + 12) + lastE.pageY) + 'px'
		});
		processing = false;
	};
	
	var mousedown = function(e) {
		jQuery(document).on('mousemove', mousemove);
		if (typeof(e.originalEvent.preventDefault) == "function") e.originalEvent.preventDefault();
	};
	var mouseup = function() {
		jQuery(document).off('mousemove', mousemove);
	};
	setTimeout(function(){
		p = {minWidth: $elemWidth.width(), minHeight: $elemHeight.height()};
	}, 1000);
	handle.on('mousedown', mousedown);
	jQuery(document).on('mouseup', mouseup);
	
	// Запрещаю выделение при изменении размера
	handle
		.attr('unselectable', 'on')
		.css('user-select', 'none')
		.on('selectstart', false);
	
};


// ***********************************************************************************************************************************
// ******************* ЗАГРУЖАЮ СЮДА СТОРОННИЕ БИБЛИОТЕКИ, ЧТОБЫ ВСЕ ПОМЕСТИЛОСЬ В ОДИН ФАЙЛ *****************************************
// ***********************************************************************************************************************************

/**
 * noty - jQuery Notification Plugin v2.0.3
 * Contributors: https://github.com/needim/noty/graphs/contributors
 *
 * Examples and Documentation - http://needim.github.com/noty/
 *
 * Licensed under the MIT licenses:
 * http://www.opensource.org/licenses/mit-license.php
 *
 **/
// noty/jquery.noty.js
function noty(a){var b=0,c={animateOpen:"animation.open",animateClose:"animation.close",easing:"animation.easing",speed:"animation.speed",onShow:"callback.onShow",onShown:"callback.afterShow",onClose:"callback.onClose",onClosed:"callback.afterClose"};return jQuery.each(a,function(d,e){if(c[d]){b++;var f=c[d].split(".");a[f[0]]||(a[f[0]]={}),a[f[0]][f[1]]=e?e:function(){},delete a[d]}}),a.closeWith||(a.closeWith=jQuery.noty.defaults.closeWith),a.hasOwnProperty("closeButton")&&(b++,a.closeButton&&a.closeWith.push("button"),delete a.closeButton),a.hasOwnProperty("closeOnSelfClick")&&(b++,a.closeOnSelfClick&&a.closeWith.push("click"),delete a.closeOnSelfClick),a.hasOwnProperty("closeOnSelfOver")&&(b++,a.closeOnSelfOver&&a.closeWith.push("hover"),delete a.closeOnSelfOver),a.hasOwnProperty("custom")&&(b++,"null"!=a.custom.container&&(a.custom=a.custom.container)),a.hasOwnProperty("cssPrefix")&&(b++,delete a.cssPrefix),"noty_theme_default"==a.theme&&(b++,a.theme="defaultTheme"),a.hasOwnProperty("dismissQueue")||(a.dismissQueue=jQuery.noty.defaults.dismissQueue),a.buttons&&jQuery.each(a.buttons,function(a,c){c.click&&(b++,c.onClick=c.click,delete c.click),c.type&&(b++,c.addClass=c.type,delete c.type)}),b&&"undefined"!=typeof console&&console.warn&&console.warn("You are using noty v2 with v1.x.x options. @deprecated until v2.2.0 - Please update your options."),jQuery.notyRenderer.init(a)}"function"!=typeof Object.create&&(Object.create=function(a){function b(){}return b.prototype=a,new b}),function(a){var b={init:function(b){return this.options=a.extend({},a.noty.defaults,b),this.options.layout=this.options.custom?a.noty.layouts.inline:a.noty.layouts[this.options.layout],this.options.theme=a.noty.themes[this.options.theme],delete b.layout,delete b.theme,this.options=a.extend({},this.options,this.options.layout.options),this.options.id="noty_"+(new Date).getTime()*Math.floor(1e6*Math.random()),this.options=a.extend({},this.options,b),this._build(),this},_build:function(){var b=a('<div class="noty_bar"></div>').attr("id",this.options.id);if(b.append(this.options.template).find(".noty_text").html(this.options.text),this.$bar=null!==this.options.layout.parent.object?a(this.options.layout.parent.object).css(this.options.layout.parent.css).append(b):b,this.options.buttons){this.options.closeWith=[],this.options.timeout=!1;var c=a("<div/>").addClass("noty_buttons");null!==this.options.layout.parent.object?this.$bar.find(".noty_bar").append(c):this.$bar.append(c);var d=this;a.each(this.options.buttons,function(b,c){var e=a("<button/>").addClass(c.addClass?c.addClass:"gray").html(c.text).appendTo(d.$bar.find(".noty_buttons")).bind("click",function(){a.isFunction(c.onClick)&&c.onClick.call(e,d)})})}this.$message=this.$bar.find(".noty_message"),this.$closeButton=this.$bar.find(".noty_close"),this.$buttons=this.$bar.find(".noty_buttons"),a.noty.store[this.options.id]=this},show:function(){var b=this;return a(b.options.layout.container.selector).append(b.$bar),b.options.theme.style.apply(b),"function"===a.type(b.options.layout.css)?this.options.layout.css.apply(b.$bar):b.$bar.css(this.options.layout.css||{}),b.$bar.addClass(b.options.layout.addClass),b.options.layout.container.style.apply(a(b.options.layout.container.selector)),b.options.theme.callback.onShow.apply(this),a.inArray("click",b.options.closeWith)>-1&&b.$bar.css("cursor","pointer").one("click",function(){b.close()}),a.inArray("hover",b.options.closeWith)>-1&&b.$bar.one("mouseenter",function(){b.close()}),a.inArray("button",b.options.closeWith)>-1&&b.$closeButton.one("click",function(){b.close()}),a.inArray("button",b.options.closeWith)==-1&&b.$closeButton.remove(),b.options.callback.onShow&&b.options.callback.onShow.apply(b),b.$bar.animate(b.options.animation.open,b.options.animation.speed,b.options.animation.easing,function(){b.options.callback.afterShow&&b.options.callback.afterShow.apply(b),b.shown=!0}),b.options.timeout&&b.$bar.delay(b.options.timeout).promise().done(function(){b.close()}),this},close:function(){if(!this.closed){var b=this;if(!this.shown){var c=[];return a.each(a.noty.queue,function(a,d){d.options.id!=b.options.id&&c.push(d)}),void(a.noty.queue=c)}b.$bar.addClass("i-am-closing-now"),b.options.callback.onClose&&b.options.callback.onClose.apply(b),b.$bar.clearQueue().stop().animate(b.options.animation.close,b.options.animation.speed,b.options.animation.easing,function(){b.options.callback.afterClose&&b.options.callback.afterClose.apply(b)}).promise().done(function(){b.options.modal&&(a.notyRenderer.setModalCount(-1),0==a.notyRenderer.getModalCount()&&a(".noty_modal").fadeOut("fast",function(){a(this).remove()})),a.notyRenderer.setLayoutCountFor(b,-1),0==a.notyRenderer.getLayoutCountFor(b)&&a(b.options.layout.container.selector).remove(),"undefined"!=typeof b.$bar&&null!==b.$bar&&(b.$bar.remove(),b.$bar=null,b.closed=!0),delete a.noty.store[b.options.id],b.options.theme.callback.onClose.apply(b),b.options.dismissQueue||(a.noty.ontap=!0,a.notyRenderer.render())})}},setText:function(a){return this.closed||(this.options.text=a,this.$bar.find(".noty_text").html(a)),this},setType:function(a){return this.closed||(this.options.type=a,this.options.theme.style.apply(this),this.options.theme.callback.onShow.apply(this)),this},setTimeout:function(a){if(!this.closed){var b=this;this.options.timeout=a,b.$bar.delay(b.options.timeout).promise().done(function(){b.close()})}return this},closed:!1,shown:!1};a.notyRenderer={},a.notyRenderer.init=function(c){var d=Object.create(b).init(c);return d.options.force?a.noty.queue.unshift(d):a.noty.queue.push(d),a.notyRenderer.render(),"object"==a.noty.returns?d:d.options.id},a.notyRenderer.render=function(){var b=a.noty.queue[0];"object"===a.type(b)?b.options.dismissQueue?a.notyRenderer.show(a.noty.queue.shift()):a.noty.ontap&&(a.notyRenderer.show(a.noty.queue.shift()),a.noty.ontap=!1):a.noty.ontap=!0},a.notyRenderer.show=function(b){b.options.modal&&(a.notyRenderer.createModalFor(b),a.notyRenderer.setModalCount(1)),0==a(b.options.layout.container.selector).length?b.options.custom?b.options.custom.append(a(b.options.layout.container.object).addClass("i-am-new")):a("body").append(a(b.options.layout.container.object).addClass("i-am-new")):a(b.options.layout.container.selector).removeClass("i-am-new"),a.notyRenderer.setLayoutCountFor(b,1),b.show()},a.notyRenderer.createModalFor=function(b){0==a(".noty_modal").length&&a("<div/>").addClass("noty_modal").data("noty_modal_count",0).css(b.options.theme.modal.css).prependTo(a("body")).fadeIn("fast")},a.notyRenderer.getLayoutCountFor=function(b){return a(b.options.layout.container.selector).data("noty_layout_count")||0},a.notyRenderer.setLayoutCountFor=function(b,c){return a(b.options.layout.container.selector).data("noty_layout_count",a.notyRenderer.getLayoutCountFor(b)+c)},a.notyRenderer.getModalCount=function(){return a(".noty_modal").data("noty_modal_count")||0},a.notyRenderer.setModalCount=function(b){return a(".noty_modal").data("noty_modal_count",a.notyRenderer.getModalCount()+b)},a.fn.noty=function(b){return b.custom=a(this),a.notyRenderer.init(b)},a.noty={},a.noty.queue=[],a.noty.ontap=!0,a.noty.layouts={},a.noty.themes={},a.noty.returns="object",a.noty.store={},a.noty.get=function(b){return!!a.noty.store.hasOwnProperty(b)&&a.noty.store[b]},a.noty.close=function(b){return!!a.noty.get(b)&&a.noty.get(b).close()},a.noty.setText=function(b,c){return!!a.noty.get(b)&&a.noty.get(b).setText(c)},a.noty.setType=function(b,c){return!!a.noty.get(b)&&a.noty.get(b).setType(c)},a.noty.clearQueue=function(){a.noty.queue=[]},a.noty.closeAll=function(){a.noty.clearQueue(),a.each(a.noty.store,function(a,b){b.close()})};var c=window.alert;a.noty.consumeAlert=function(b){window.alert=function(c){b?b.text=c:b={text:c},a.notyRenderer.init(b)}},a.noty.stopConsumeAlert=function(){window.alert=c},a.noty.defaults={layout:"top",theme:"defaultTheme",type:"alert",text:"",dismissQueue:!0,template:'<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',animation:{open:{height:"toggle"},close:{height:"toggle"},easing:"swing",speed:500},timeout:!1,force:!1,modal:!1,closeWith:["click"],callback:{onShow:function(){},afterShow:function(){},onClose:function(){},afterClose:function(){}},buttons:!1},a(window).resize(function(){a.each(a.noty.layouts,function(b,c){c.container.style.apply(a(c.container.selector))})})}(jQuery);
// noty/themes/default.js
!function(a){a.noty.themes.defaultTheme={name:"defaultTheme",helpers:{borderFix:function(){if(this.options.dismissQueue){var b=this.options.layout.container.selector+" "+this.options.layout.parent.selector;switch(this.options.layout.name){case"top":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).last().css({borderRadius:"0px 0px 5px 5px"});break;case"topCenter":case"topLeft":case"topRight":case"bottomCenter":case"bottomLeft":case"bottomRight":case"center":case"centerLeft":case"centerRight":case"inline":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).first().css({"border-top-left-radius":"5px","border-top-right-radius":"5px"}),a(b).last().css({"border-bottom-left-radius":"5px","border-bottom-right-radius":"5px"});break;case"bottom":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).first().css({borderRadius:"5px 5px 0px 0px"})}}}},modal:{css:{position:"fixed",width:"100%",height:"100%",backgroundColor:"#000",zIndex:1e4,opacity:.6,display:"none",left:0,top:0}},style:function(){switch(this.$bar.css({overflow:"hidden",background:"url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAoCAYAAAAPOoFWAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAPZJREFUeNq81tsOgjAMANB2ov7/7ypaN7IlIwi9rGuT8QSc9EIDAsAznxvY4pXPKr05RUE5MEVB+TyWfCEl9LZApYopCmo9C4FKSMtYoI8Bwv79aQJU4l6hXXCZrQbokJEksxHo9KMOgc6w1atHXM8K9DVC7FQnJ0i8iK3QooGgbnyKgMDygBWyYFZoqx4qS27KqLZJjA1D0jK6QJcYEQEiWv9PGkTsbqxQ8oT+ZtZB6AkdsJnQDnMoHXHLGKOgDYuCWmYhEERCI5gaamW0bnHdA3k2ltlIN+2qKRyCND0bhqSYCyTB3CAOc4WusBEIpkeBuPgJMAAX8Hs1NfqHRgAAAABJRU5ErkJggg==') repeat-x scroll left top #fff"}),this.$message.css({fontSize:"13px",lineHeight:"16px",textAlign:"center",padding:"8px 10px 9px",width:"auto",position:"relative"}),this.$closeButton.css({position:"absolute",top:4,right:4,width:10,height:10,background:"url(data:image/png;base64,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)",display:"none",cursor:"pointer"}),this.$buttons.css({padding:5,textAlign:"right",borderTop:"1px solid #ccc",backgroundColor:"#fff"}),this.$buttons.find("button").css({marginLeft:5}),this.$buttons.find("button:first").css({marginLeft:0}),this.$bar.bind({mouseenter:function(){a(this).find(".noty_close").fadeIn()},mouseleave:function(){a(this).find(".noty_close").fadeOut()}}),this.options.layout.name){case"top":this.$bar.css({borderRadius:"0px 0px 5px 5px",borderBottom:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"});break;case"topCenter":case"center":case"bottomCenter":case"inline":this.$bar.css({borderRadius:"5px",border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"center"});break;case"topLeft":case"topRight":case"bottomLeft":case"bottomRight":case"centerLeft":case"centerRight":this.$bar.css({borderRadius:"5px",border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"left"});break;case"bottom":this.$bar.css({borderRadius:"5px 5px 0px 0px",borderTop:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",boxShadow:"0 -2px 4px rgba(0, 0, 0, 0.1)"});break;default:this.$bar.css({border:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"})}switch(this.options.type){case"alert":case"notification":this.$bar.css({backgroundColor:"#FFF",borderColor:"#CCC",color:"#444"});break;case"warning":this.$bar.css({backgroundColor:"#FFEAA8",borderColor:"#FFC237",color:"#826200"}),this.$buttons.css({borderTop:"1px solid #FFC237"});break;case"error":this.$bar.css({backgroundColor:"red",borderColor:"darkred",color:"#FFF"}),this.$message.css({fontWeight:"bold"}),this.$buttons.css({borderTop:"1px solid darkred"});break;case"information":this.$bar.css({backgroundColor:"#57B7E2",borderColor:"#0B90C4",color:"#FFF"}),this.$buttons.css({borderTop:"1px solid #0B90C4"});break;case"success":this.$bar.css({backgroundColor:"lightgreen",borderColor:"#50C24E",color:"darkgreen"}),this.$buttons.css({borderTop:"1px solid #50C24E"});break;default:this.$bar.css({backgroundColor:"#FFF",borderColor:"#CCC",color:"#444"})}},callback:{onShow:function(){a.noty.themes.defaultTheme.helpers.borderFix.apply(this)},onClose:function(){a.noty.themes.defaultTheme.helpers.borderFix.apply(this)}}}}(jQuery);
// noty/layouts/top.js
!function(a){a.noty.layouts.top={name:"top",options:{},container:{object:'<ul id="noty_top_layout_container" />',selector:"ul#noty_top_layout_container",style:function(){a(this).css({top:0,left:"5%",position:"fixed",width:"90%",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:9999999})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none"},addClass:""}}(jQuery);


/*! 
 * jquery.event.drag - v 2.2
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2008-06-04 
// Updated: 2012-05-21
// REQUIRES: jquery 1.7.x

;(function( $ ){

// add the jquery instance method
$.fn.drag = function( str, arg, opts ){
	// figure out the event type
	var type = typeof str == "string" ? str : "",
	// figure out the event handler...
	fn = $.isFunction( str ) ? str : $.isFunction( arg ) ? arg : null;
	// fix the event type
	if ( type.indexOf("drag") !== 0 ) 
		type = "drag"+ type;
	// were options passed
	opts = ( str == fn ? arg : opts ) || {};
	// trigger or bind event handler
	return fn ? this.bind( type, opts, fn ) : this.trigger( type );
};

// local refs (increase compression)
var $event = $.event, 
$special = $event.special,
// configure the drag special event 
drag = $special.drag = {
	
	// these are the default settings
	defaults: {
		which: 1, // mouse button pressed to start drag sequence
		distance: 0, // distance dragged before dragstart
		not: ':input', // selector to suppress dragging on target elements
		handle: null, // selector to match handle target elements
		relative: false, // true to use "position", false to use "offset"
		drop: true, // false to suppress drop events, true or selector to allow
		click: false // false to suppress click events after dragend (no proxy)
	},
	
	// the key name for stored drag data
	datakey: "dragdata",
	
	// prevent bubbling for better performance
	noBubble: true,
	
	// count bound related events
	add: function( obj ){ 
		// read the interaction data
		var data = $.data( this, drag.datakey ),
		// read any passed options 
		opts = obj.data || {};
		// count another realted event
		data.related += 1;
		// extend data options bound with this event
		// don't iterate "opts" in case it is a node 
		$.each( drag.defaults, function( key, def ){
			if ( opts[ key ] !== undefined )
				data[ key ] = opts[ key ];
		});
	},
	
	// forget unbound related events
	remove: function(){
		$.data( this, drag.datakey ).related -= 1;
	},
	
	// configure interaction, capture settings
	setup: function(){
		// check for related events
		if ( $.data( this, drag.datakey ) ) 
			return;
		// initialize the drag data with copied defaults
		var data = $.extend({ related:0 }, drag.defaults );
		// store the interaction data
		$.data( this, drag.datakey, data );
		// bind the mousedown event, which starts drag interactions
		$event.add( this, "touchstart mousedown", drag.init, data );
		// prevent image dragging in IE...
		if ( this.attachEvent ) 
			this.attachEvent("ondragstart", drag.dontstart ); 
	},
	
	// destroy configured interaction
	teardown: function(){
		var data = $.data( this, drag.datakey ) || {};
		// check for related events
		if ( data.related ) 
			return;
		// remove the stored data
		$.removeData( this, drag.datakey );
		// remove the mousedown event
		$event.remove( this, "touchstart mousedown", drag.init );
		// enable text selection
		drag.textselect( true ); 
		// un-prevent image dragging in IE...
		if ( this.detachEvent ) 
			this.detachEvent("ondragstart", drag.dontstart ); 
	},
		
	// initialize the interaction
	init: function( event ){ 
		// sorry, only one touch at a time
		if ( drag.touched ) 
			return;
		// the drag/drop interaction data
		var dd = event.data, results;
		// check the which directive
		if ( event.which != 0 && dd.which > 0 && event.which != dd.which ) 
			return; 
		// check for suppressed selector
		if ( $( event.target ).is( dd.not ) ) 
			return;
		// check for handle selector
		if ( dd.handle && !$( event.target ).closest( dd.handle, event.currentTarget ).length ) 
			return;

		drag.touched = event.type == 'touchstart' ? this : null;
		dd.propagates = 1;
		dd.mousedown = this;
		dd.interactions = [ drag.interaction( this, dd ) ];
		dd.target = event.target;
		dd.pageX = event.pageX;
		dd.pageY = event.pageY;
		dd.dragging = null;
		// handle draginit event... 
		results = drag.hijack( event, "draginit", dd );
		// early cancel
		if ( !dd.propagates )
			return;
		// flatten the result set
		results = drag.flatten( results );
		// insert new interaction elements
		if ( results && results.length ){
			dd.interactions = [];
			$.each( results, function(){
				dd.interactions.push( drag.interaction( this, dd ) );
			});
		}
		// remember how many interactions are propagating
		dd.propagates = dd.interactions.length;
		// locate and init the drop targets
		if ( dd.drop !== false && $special.drop ) 
			$special.drop.handler( event, dd );
		// disable text selection
		drag.textselect( false ); 
		// bind additional events...
		if ( drag.touched )
			$event.add( drag.touched, "touchmove touchend", drag.handler, dd );
		else 
			$event.add( document, "mousemove mouseup", drag.handler, dd );
		// helps prevent text selection or scrolling
		if ( !drag.touched || dd.live )
			return false;
	},	
	
	// returns an interaction object
	interaction: function( elem, dd ){
		var offset = $( elem )[ dd.relative ? "position" : "offset" ]() || { top:0, left:0 };
		return {
			drag: elem, 
			callback: new drag.callback(), 
			droppable: [],
			offset: offset
		};
	},
	
	// handle drag-releatd DOM events
	handler: function( event ){ 
		// read the data before hijacking anything
		var dd = event.data;	
		// handle various events
		switch ( event.type ){
			// mousemove, check distance, start dragging
			case !dd.dragging && 'touchmove': 
				event.preventDefault();
			case !dd.dragging && 'mousemove':
				//  drag tolerance, xІ + yІ = distanceІ
				if ( Math.pow(  event.pageX-dd.pageX, 2 ) + Math.pow(  event.pageY-dd.pageY, 2 ) < Math.pow( dd.distance, 2 ) ) 
					break; // distance tolerance not reached
				event.target = dd.target; // force target from "mousedown" event (fix distance issue)
				drag.hijack( event, "dragstart", dd ); // trigger "dragstart"
				if ( dd.propagates ) // "dragstart" not rejected
					dd.dragging = true; // activate interaction
			// mousemove, dragging
			case 'touchmove':
				event.preventDefault();
			case 'mousemove':
				if ( dd.dragging ){
					// trigger "drag"		
					drag.hijack( event, "drag", dd );
					if ( dd.propagates ){
						// manage drop events
						if ( dd.drop !== false && $special.drop )
							$special.drop.handler( event, dd ); // "dropstart", "dropend"							
						break; // "drag" not rejected, stop		
					}
					event.type = "mouseup"; // helps "drop" handler behave
				}
			// mouseup, stop dragging
			case 'touchend': 
			case 'mouseup': 
			default:
				if ( drag.touched )
					$event.remove( drag.touched, "touchmove touchend", drag.handler ); // remove touch events
				else 
					$event.remove( document, "mousemove mouseup", drag.handler ); // remove page events	
				if ( dd.dragging ){
					if ( dd.drop !== false && $special.drop )
						$special.drop.handler( event, dd ); // "drop"
					drag.hijack( event, "dragend", dd ); // trigger "dragend"	
				}
				drag.textselect( true ); // enable text selection
				// if suppressing click events...
				if ( dd.click === false && dd.dragging )
					$.data( dd.mousedown, "suppress.click", new Date().getTime() + 5 );
				dd.dragging = drag.touched = false; // deactivate element	
				break;
		}
	},
		
	// re-use event object for custom events
	hijack: function( event, type, dd, x, elem ){
		// not configured
		if ( !dd ) 
			return;
		// remember the original event and type
		var orig = { event:event.originalEvent, type:event.type },
		// is the event drag related or drog related?
		mode = type.indexOf("drop") ? "drag" : "drop",
		// iteration vars
		result, i = x || 0, ia, $elems, callback,
		len = !isNaN( x ) ? x : dd.interactions.length;
		// modify the event type
		event.type = type;
		// remove the original event
		event.originalEvent = null;
		// initialize the results
		dd.results = [];
		// handle each interacted element
		do if ( ia = dd.interactions[ i ] ){
			// validate the interaction
			if ( type !== "dragend" && ia.cancelled )
				continue;
			// set the dragdrop properties on the event object
			callback = drag.properties( event, dd, ia );
			// prepare for more results
			ia.results = [];
			// handle each element
			$( elem || ia[ mode ] || dd.droppable ).each(function( p, subject ){
				// identify drag or drop targets individually
				callback.target = subject;
				// force propagtion of the custom event
				event.isPropagationStopped = function(){ return false; };
				// handle the event	
				result = subject ? $event.dispatch.call( subject, event, callback ) : null;
				// stop the drag interaction for this element
				if ( result === false ){
					if ( mode == "drag" ){
						ia.cancelled = true;
						dd.propagates -= 1;
					}
					if ( type == "drop" ){
						ia[ mode ][p] = null;
					}
				}
				// assign any dropinit elements
				else if ( type == "dropinit" )
					ia.droppable.push( drag.element( result ) || subject );
				// accept a returned proxy element 
				if ( type == "dragstart" )
					ia.proxy = $( drag.element( result ) || ia.drag )[0];
				// remember this result	
				ia.results.push( result );
				// forget the event result, for recycling
				delete event.result;
				// break on cancelled handler
				if ( type !== "dropinit" )
					return result;
			});	
			// flatten the results	
			dd.results[ i ] = drag.flatten( ia.results );	
			// accept a set of valid drop targets
			if ( type == "dropinit" )
				ia.droppable = drag.flatten( ia.droppable );
			// locate drop targets
			if ( type == "dragstart" && !ia.cancelled )
				callback.update(); 
		}
		while ( ++i < len )
		// restore the original event & type
		event.type = orig.type;
		event.originalEvent = orig.event;
		// return all handler results
		return drag.flatten( dd.results );
	},
		
	// extend the callback object with drag/drop properties...
	properties: function( event, dd, ia ){		
		var obj = ia.callback;
		// elements
		obj.drag = ia.drag;
		obj.proxy = ia.proxy || ia.drag;
		// starting mouse position
		obj.startX = dd.pageX;
		obj.startY = dd.pageY;
		// current distance dragged
		obj.deltaX = event.pageX - dd.pageX;
		obj.deltaY = event.pageY - dd.pageY;
		// original element position
		obj.originalX = ia.offset.left;
		obj.originalY = ia.offset.top;
		// adjusted element position
		obj.offsetX = obj.originalX + obj.deltaX; 
		obj.offsetY = obj.originalY + obj.deltaY;
		// assign the drop targets information
		obj.drop = drag.flatten( ( ia.drop || [] ).slice() );
		obj.available = drag.flatten( ( ia.droppable || [] ).slice() );
		return obj;	
	},
	
	// determine is the argument is an element or jquery instance
	element: function( arg ){
		if ( arg && ( arg.jquery || arg.nodeType == 1 ) )
			return arg;
	},
	
	// flatten nested jquery objects and arrays into a single dimension array
	flatten: function( arr ){
		return $.map( arr, function( member ){
			return member && member.jquery ? $.makeArray( member ) : 
				member && member.length ? drag.flatten( member ) : member;
		});
	},
	
	// toggles text selection attributes ON (true) or OFF (false)
	textselect: function( bool ){ 
		$( document )[ bool ? "unbind" : "bind" ]("selectstart", drag.dontstart )
			.css("MozUserSelect", bool ? "" : "none" );
		// .attr("unselectable", bool ? "off" : "on" )
		document.unselectable = bool ? "off" : "on"; 
	},
	
	// suppress "selectstart" and "ondragstart" events
	dontstart: function(){ 
		return false; 
	},
	
	// a callback instance contructor
	callback: function(){}
	
};

// callback methods
drag.callback.prototype = {
	update: function(){
		if ( $special.drop && this.available.length )
			$.each( this.available, function( i ){
				$special.drop.locate( this, i );
			});
	}
};

// patch $.event.$dispatch to allow suppressing clicks
var $dispatch = $event.dispatch;
$event.dispatch = function( event ){
	if ( $.data( this, "suppress."+ event.type ) - new Date().getTime() > 0 ){
		$.removeData( this, "suppress."+ event.type );
		return;
	}
	return $dispatch.apply( this, arguments );
};

// event fix hooks for touch events...
var touchHooks = 
$event.fixHooks.touchstart = 
$event.fixHooks.touchmove = 
$event.fixHooks.touchend =
$event.fixHooks.touchcancel = {
	props: "clientX clientY pageX pageY screenX screenY".split( " " ),
	filter: function( event, orig ) {
		if ( orig ){
			var touched = ( orig.touches && orig.touches[0] )
				|| ( orig.changedTouches && orig.changedTouches[0] )
				|| null; 
			// iOS webkit: touchstart, touchmove, touchend
			if ( touched ) 
				$.each( touchHooks.props, function( i, prop ){
					event[ prop ] = touched[ prop ];
				});
		}
		return event;
	}
};

// share the same special event configuration with related events...
$special.draginit = $special.dragstart = $special.dragend = drag;

})( jQuery );

/*! 
 * jquery.event.drag.live - v 2.2
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2010-06-07
// Updated: 2012-05-21
// REQUIRES: jquery 1.7.x, event.drag 2.2

;(function( $ ){
	
// local refs (increase compression)
var $event = $.event,
// ref the special event config
drag = $event.special.drag,
// old drag event add method
origadd = drag.add,
// old drag event teradown method
origteardown = drag.teardown;

// allow events to bubble for delegation
drag.noBubble = false;

// the namespace for internal live events
drag.livekey = "livedrag";

// new drop event add method
drag.add = function( obj ){ 
	// call the old method
	origadd.apply( this, arguments );
	// read the data
	var data = $.data( this, drag.datakey );
	// bind the live "draginit" delegator
	if ( !data.live && obj.selector ){
		data.live = true;
		$event.add( this, "draginit."+ drag.livekey, drag.delegate );
	}
};

// new drop event teardown method
drag.teardown = function(){ 
	// call the old method
	origteardown.apply( this, arguments );
	// read the data
	var data = $.data( this, drag.datakey ) || {};
	// bind the live "draginit" delegator
	if ( data.live ){
		// remove the "live" delegation
		$event.remove( this, "draginit."+ drag.livekey, drag.delegate );
		data.live = false;
	}
};

// identify potential delegate elements
drag.delegate = function( event ){
	// local refs
	var elems = [], target, 
	// element event structure
	events = $.data( this, "events" ) || {};
	// query live events
	$.each( events || [], function( key, arr ){
		// no event type matches
		if ( key.indexOf("drag") !== 0 )
			return;
		$.each( arr || [], function( i, obj ){
			// locate the element to delegate
			target = $( event.target ).closest( obj.selector, event.currentTarget )[0];
			// no element found
			if ( !target ) 
				return;
			// add an event handler
			$event.add( target, obj.origType+'.'+drag.livekey, obj.origHandler || obj.handler, obj.data );
			// remember new elements
			if ( $.inArray( target, elems ) < 0 )
				elems.push( target );		
		});
	});
	// if there are no elements, break
	if ( !elems.length ) 
		return false;
	// return the matched results, and clenup when complete		
	return $( elems ).bind("dragend."+ drag.livekey, function(){
		$event.remove( this, "."+ drag.livekey ); // cleanup delegation
	});
};
	
})( jQuery );