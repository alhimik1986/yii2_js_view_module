<?php // @param array $plugin_params Список плагинов, которые необходимо отобразить. ?><?php if (false): ?><script type="text/javascript"><?php endif; ?><?php
// **************************************************************************************************************
// Модуль: ajaxTable_searchOnChange - поиск при изменении (вспомогательные скрипты).
// **************************************************************************************************************
?>

(function($){$(document).ready(function(){
	var soc_selector = '<?php echo $search_on_change_selector; ?>';
	var tbl_selector = '<?php echo $tbl_selector; ?>';
	var date_selector = '<?php echo $search_on_change_dateSelector; ?>';
	
	// задежка между отправками данных
	var search_timeout = 300; search_timer = function(){}; var search_on_change_dom;
	var search_on_change = function(dom) {
		search_on_change_dom = dom;
		if (search_timer) {
			clearTimeout(search_timer);
		}
		search_timer = setTimeout(function(){
			search_on_change_dom.parents('form').find(tbl_selector).trigger('search');
		}, search_timeout);
	};
	
	// Поиск при изменении любого из искомых параметров и нажатии клавиши в текстовых полях
	$(tbl_selector).parents('form').find('input[type="text"]'+soc_selector).on('keyup', function(e){
		if ( e.keyCode != 116 ) // если не F5 (кнопка обновления страницы браузера)
			search_on_change($(this));
	});
	$(tbl_selector).parents('form').find(soc_selector+':not(input[type="text"])').on('change', function(e){
		search_on_change($(this));
	});
	$(tbl_selector+' thead th[data-sort]').on('click', function(){
		search_on_change($(this));
	});
	
	// Очищаю текстовые поля при нажтии Esc
	$(tbl_selector).parents('form').find('input[type="text"]'+soc_selector).on('keyup', function(e){
		if (e.which == 27)  $(this).val('');
	});
	
	// Пейджер таблиц
	$(tbl_selector).on('click', '.ajax-table-pager .pagination a', function(){
		$(this).parents(tbl_selector).trigger('next');
		return false;
	});
	
	// Поиск при изменении даты в текстовом поле
	$(date_selector).on('change', function(e){
		$(tbl_selector).trigger('search');
	});
});})(jQuery);