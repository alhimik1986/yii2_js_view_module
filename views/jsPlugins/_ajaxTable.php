<?php // @param array $plugin_params Параметры плагина. ?><?php if (false): ?><script type="text/javascript"><?php endif; ?><?php
// **************************************************************************************************************
// Модуль: ajaxTable - вспомогательные скипты для ajax-таблицы.
// **************************************************************************************************************

use alhimik1986\yii2_js_view_module\components\JSPlugins;
use alhimik1986\yii2_js_view_module\components\CJavaScript as CJavaScript;

alhimik1986\yii2_js_view_module\assets\AjaxFormAsset::register(Yii::$app->view);
?>

<?php foreach($plugin_params as $_plugin_key=>$_plugins): ?>
<?php
JSPlugins::setIfNotIsset($_plugins, 'tbl_selector', '#ajax-table');
JSPlugins::setIfNotIsset($_plugins, 'search_url', \yii\helpers\Url::to(['search']));
JSPlugins::setIfNotIsset($_plugins, 'search_request_type', 'post');
JSPlugins::setIfNotIsset($_plugins, 'search_on_change_selector', '.search-on-change');
JSPlugins::setIfNotIsset($_plugins, 'search_on_change_dateSelector', '.from-date, .to-date');
JSPlugins::setIfNotIsset($_plugins, 'loading_img', '');
JSPlugins::setIfNotIsset($_plugins, 'error_selector', '#errors');
JSPlugins::setIfNotIsset($_plugins, 'ajaxDataCallBack', 'js:function(data){return data;}');
JSPlugins::setIfNotIsset($_plugins, 'afterSuccessCallBack', 'js:function(data){}');

$tbl_selector = $_plugins['tbl_selector'];
$search_url = $_plugins['search_url'];
$search_request_type = $_plugins['search_request_type'];
$search_on_change_selector = $_plugins['search_on_change_selector'];
$search_on_change_dateSelector = $_plugins['search_on_change_dateSelector'];
$loading_img = $_plugins['loading_img'];
$error_selector = $_plugins['error_selector'];
$ajaxDataCallBack = CJavaScript::encode($_plugins['ajaxDataCallBack']);
$afterSuccessCallBack = CJavaScript::encode($_plugins['afterSuccessCallBack']);
?>
<?php include $path.'_ajaxTable_searchOnChange.php'; ?>
<?php include $path.'_ajaxTable_hotKeys.php'; ?>

(function($){$(document).ready(function(){
	//--------------------------------------------------------------
	// Сортировка
	//--------------------------------------------------------------
	var sorting = {};
	if (typeof(window.js_view.sorting) === 'undefined')
		window.js_view.sorting = {};
	window.js_view.sorting['<?php echo $_plugin_key; ?>'] = {};
	
	// Установить сортировку по возрастанию
	var set_asc = function($th, e){
		if ( ! e.ctrlKey && ! e.shiftKey) {
			$th.parent().find('th').removeClass('sorting_asc sorting_desc')
				.find('a').removeClass('asc desc');
		}
		$th.removeClass('sorting_desc').addClass('sorting_asc')
			.find('a').removeClass('desc').addClass('asc');
	};
	// Установить сортировку по убыванию
	var set_desc = function($th, e){
		if ( ! e.ctrlKey && ! e.shiftKey) {
			$th.parent().find('th').removeClass('sorting_asc sorting_desc')
				.find('a').removeClass('asc desc');
		}
		$th.removeClass('sorting_asc').addClass('sorting_desc')
			.find('a').removeClass('asc').addClass('desc');
	};
	// Убрать сортировку
	var set_default = function($th, e){
		if ( ! e.ctrlKey && ! e.shiftKey) {
			$th.parent().find('th').removeClass('sorting_asc sorting_desc')
				.find('a').removeClass('asc desc');
		}
		$th.removeClass('sorting_asc sorting_desc')
			.find('a').removeClass('asc desc');
	};
	
	// Действие при клике на шапку таблицы, возвращает порядок сортировки для данной таблицы
	var get_order = function($th, e){
		var order;
		if ($th.hasClass('sorting_asc')){
			set_desc($th, e);
			order = 'desc';
		} else if ($th.hasClass('sorting_desc')){
			set_default($th, e);
			order = '';
		} else {
			set_asc($th, e);
			order = 'asc';
		}
		return order;
	};
	
	// Устанавливает сортировку при клике по шапкам таблиц
	$('<?php echo $tbl_selector; ?> thead th[data-sort]').on('click', function(e){
		var $th = $(this);
		if ( ! e.ctrlKey && ! e.shiftKey)
			sorting = {};
		
		var order = get_order($th, e);
		if (order) {
			sorting[$th.attr('data-sort')] = order;
		} else  {
			delete sorting[$th.attr('data-sort')];
		}
		window.js_view.sorting['<?php echo $_plugin_key; ?>'] = sorting;
	});
	
	// Вставляет параметры сортировки в указанный jQuery-объект в виде скрытых текстровых полей (для экспорта в Excel)
	window.js_view.sort_data_to_hidden_fields = function($this, data) {
		$this.empty();
		var key, column;
		for (key in data) {
			column = key.replace(new RegExp(',', 'g'),  ' '+data[key]+','); // Чтобы вместо "{last_name}, {first_name}, {middle_name} desc" получилось "{last_name} desc, {first_name} desc, {middle_name} desc"
			$this.append('<input type="hidden" name="order['+column+']" value="'+data[key]+'">');
		}
	};
	//--------------------------------------------------------------
	
	
	
	//--------------------------------------------------------------
	// Поиск при изменении любого из параметров поиска
	//--------------------------------------------------------------
	new ajaxForm({
		csrf: {<?php echo Yii::$app->request->csrfParam . ":'" . Yii::$app->request->csrfToken."'"; ?>},
		loadingDom: function(settings){return '<?php echo $tbl_selector; ?>';},
		loadingStyle: function(settings){
			var result = 'position:absolute;margin-top:2px;margin-left:3px; width:16px; height:16px; background-repeat: no-repeat;';
			result += "<?php echo $loading_img ? 'background-image: url(\''.$loading_img.'\');' : ''; ?>";
			return result;
		},
		create: {
			selector: '<?php echo $tbl_selector; ?>',
			on: 'search next',
			errorSelector: '<?php echo $error_selector; ?>',
			ajax: function(settings) {
				var data = settings.create.dom.parents('form').serializeArray();
				// Добавляю параметры сортировки в отравляемые данные
				var key, column;
				for (key in sorting) {
					column = key.replace(new RegExp(',', 'g'),  ' '+sorting[key]+','); // Чтобы вместо "{last_name}, {first_name}, {middle_name} desc" получилось "{last_name} desc, {first_name} desc, {middle_name} desc"
					data.push({
						name: 'order['+column+']',
						value: sorting[key]
					});
				}
				
				// Пост-обработка данных для поиска перед отправкой ajax-запроса (например, чтобы втиснуть в поиск диапазон дат from_date и to_date)
				var ajaxDataCallBack = <?php echo $ajaxDataCallBack; ?>;
				data = ajaxDataCallBack(data);
				
				return {
					url: '<?php echo $search_url; ?>',
					data: data,
					type: '<?php echo $search_request_type; ?>'
				};
			},
			success: function(data, settings) {
				settings.create.dom.parents('form').find('<?php echo $tbl_selector; ?> tbody').html(data);
				// Перехожу на первую страницу пейджера, если на текущей странице нет результатов
				var $table = settings.create.dom;
				if ($table.find('tbody tr.tr-pager').length > 0 && $table.find('tbody tr:not(.tr-pager)').length == 0) {
					$table.find('tr.tr-pager').append('<div class="pager-links"><input type="hidden" id="page" name="page" value="1"></div>');
					$table.trigger('search');
				}
				
				// Дополнительные операции при успешном запросе (в поиске)
				var afterSuccessCallBack = <?php echo $afterSuccessCallBack; ?>;
				afterSuccessCallBack(data);
			},
			_afterSuccess: function(){}
		}
	});
	
	$('<?php echo $tbl_selector; ?>').trigger('search');
});})(jQuery);
<?php endForeach; ?>