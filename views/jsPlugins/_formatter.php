<?php // @param array $plugin_params Параметры плагина. ?><?php if (false): ?><script type="text/javascript"><?php endif; ?><?php
// **************************************************************************************************************
// Модуль: formatter - автоматический формат содержимого текстовых полей (в соответствии с шаблоном)
// **************************************************************************************************************
use alhimik1986\yii2_js_view_module\components\JSPlugins;
use alhimik1986\yii2_js_view_module\components\CJavaScript as CJavaScript;

alhimik1986\yii2_js_view_module\assets\FormatterAsset::register(Yii::$app->view);
?>

<?php
/*
	Пример использования:
	
	new Formatter(document.getElementById('credit-input'), {
	  'pattern': '{{9999}}-{{9999}}-{{9999}}-{{9999}}'
	});

	$('#credit-input').formatter({
	  'pattern': '{{9999}}-{{9999}}-{{9999}}-{{9999}}'
	});
*/
?>

<?php
foreach($plugin_params as $key=>$value) {
	JSPlugins::setIfNotIsset($plugin_params[$key], 'selector', '.date-formatter');
	JSPlugins::setIfNotIsset($plugin_params[$key], 'options', array('pattern' => '{{D9}}.{{M9}}.{{9999}}'));
}
?>

// Добавляю форматы D и M, чтобы можно было вводить дату в формате день-месяц-год ('pattern'=>'{{D9}}.{{M9}}.{{9999}}')
// Получается, что в паттерне: "D" - от 0 до 3, "M" - от 0 до 1, "9" - от 0 до 9 (идет по умолчанию, я ее не задавал).
(function($){
	$.fn.formatter.addInptType('D', /[0-3]/);
	$.fn.formatter.addInptType('M', /[0-1]/);
})(jQuery);

<?php foreach($plugin_params as $key=>$value): ?>
(function($){
	$(document).ready(function(){
		var selector = '<?php echo $plugin_params[$key]['selector']; ?>';
		var options = <?php echo CJavaScript::encode($plugin_params[$key]['options']); ?>;
		
		$(document).on('click', selector+':not(.hasDateFormatter)', function(){
			$(this).addClass('hasDateFormatter').formatter(options);
		}).on('focus', selector+':not(.hasDateFormatter)', function(){
			$(this).addClass('hasDateFormatter').formatter(options);
		});
	});
})(jQuery);
<?php endForeach; ?>