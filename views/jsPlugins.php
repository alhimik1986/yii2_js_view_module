<?php // @param array $plugins Список плагинов, которые необходимо отобразить. ?><?php if (false): // Для подсветки синтаксиса в notepad++ ?><script type="text/javascript"><?php endif; ?>
<?php
	/**
	 * Здесь происходит запуск плагинов из вьюшек, находящихся в папке application/views/jsPlugins.
	 * Имя плагина находится в ключе переменной $plugins и оно совпадает с именем вьюшки.
	 * Файл вьюшки именуется в формате: _имяПлагина.php
	 */
?>
<?php
	alhimik1986\yii2_js_view_module\Module::registerTranslations();
	
	$path = realpath( __DIR__ .'/jsPlugins'). DIRECTORY_SEPARATOR;
	// Сбор содержимого скриптов плагинов
	ob_start();
	foreach($plugins as $plugin_view=>$plugin_params)
		include $path.'_'.$plugin_view.'.php';
	$javascript_content = ob_get_contents();
	ob_end_clean();
?>

(function($){$(document).ready(function() {
	window.js_view = {}; // Глобальная переменная, хранящая данные java-скриптов
	window.js_view.launch = [];
	window.js_view.afterLaunch = [];
	
	<?php // Вывод содержимого скриптов плагинов из вьюшек ?>
	<?php echo $javascript_content; ?>
	
	// Отложенный запуск (запуск после запуска всех плагинов)
	setTimeout(function(){
		if (typeof(window.js_view.launch) != 'undefined') {
			for(var func in window.js_view.launch) {
				func = window.js_view.launch[func];
				func();
			}
		}
		if (typeof(window.js_view.afterLaunch) != 'undefined') {
			for(var al_func in window.js_view.afterLaunch) {
				al_func = window.js_view.afterLaunch[al_func];
				al_func();
			}
		}
	}, 1);
	
});})(jQuery);

<?php if (false): // Для подсветки синтаксиса в notepad++ ?>
</script>
<?php endif; ?>