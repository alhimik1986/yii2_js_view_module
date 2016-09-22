<?php // @param array $plugin_params Список плагинов, которые необходимо отобразить. ?><?php if (false): ?><script type="text/javascript"><?php endif; ?><?php
// **************************************************************************************************************
// Модуль: ajaxTable_hotKeys - горячие клавиши.
// **************************************************************************************************************
?>
<?php use alhimik1986\yii2_js_view_module\Module; ?>
(function($){$(document).ready(function(){
	// Предотвращаю повторный запуск этого скрипта, т.к. его нужно запускать только один раз
	if (typeof(window.js_view.hot_keys_activated) !== 'undefined' && window.js_view.hot_keys_activated)
		return;
	
	// Добавление подписи к горячим клавишам
	var addTitle = function(selector, text) {
		$(selector).attr('title', text);
	};
	$(document).ajaxSuccess(function(){
		addTitle('.ajax-form-button-create:first', '<?php echo Module::t('app', 'Hot key: "Insert".'); ?>');
		addTitle('form .ajax-form-button-cancel', '<?php echo Module::t('app', 'Hot key: "Esc".'); ?>');
		addTitle('form .ajax-form-button-submit', '<?php echo Module::t('app', 'Hot key: "Ctrl+Enter" or "Shift+Enter".'); ?>');
		addTitle('form .ajax-form-button-delete', '<?php echo Module::t('app', 'Hot key: "Ctrl+Delete" or "Shift+Delete".'); ?>');
		addTitle('form label.delete, form :checkbox.delete', '<?php echo Module::t('app', 'Hot key: "Ctrl+Delete" or "Shift+Delete".'); ?>');
	});
	
	// Горячие клавиши
	$(document).on('keyup', 'form', function(e){
		if (e.keyCode == 27) { // Escape
			if ( ! $(e.target).parent().is('.chzn-search'))
				$(this).find('.ajax-form-button-cancel').click();
		} else if (e.keyCode == 13 && (e.ctrlKey || e.shiftKey)) { // Ctrl + Enter
			$(this).find('.ajax-form-button-submit:visible').click();
		} else if (e.keyCode == 46 && (e.ctrlKey || e.shiftKey)) { // Ctrl + Delete
			var $this = $(this);
			var $checkbox = $this.find('input[type="checkbox"].delete');
			var $del_button = $this.find('.ajax-form-button-delete');
			if ($checkbox.length > 0) { // Если есть пометка на удаление
				// Если стоит пометка на удаление, то удаляю безвозвратно
				if ($checkbox.prop('checked') && $del_button.length > 0) {
					$del_button.click();
				} else {
					// Ставлю пометку на удаление и жму "Сохранить"
					$checkbox.prop('checked', true);
					$this.find('.ajax-form-button-submit:visible').click();
				}
			} else {
				$del_button.click();
			}
		}
	});
	$('body:first').attr('tabindex', 1);
	$(document).on('keyup', 'body', function(e){
		if (e.keyCode == 45) { // Insert
			$('.ajax-form-button-create:first').click();
		}
	});
	
	window.js_view['hot_keys_activated'] = true;
});})(jQuery);