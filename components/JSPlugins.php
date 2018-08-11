<?php

/**
 * Класс для подключения уже настроенных javascript-плагинов. Он удобен тем, что с минимумом кода можно подключить только нужные плагины.
 *
 * @author Сидорович Николай <sidorovich21101986@mail.ru>
 * @link https://github.com/alhimik1986
 * @copyright Copyright &copy; 2016
 */

namespace alhimik1986\yii2_js_view_module\components;
use Yii;

class JSPlugins
{
	protected static $plugins = [];
	public static function setIfNotIsset(&$plugin, $key, $defaultValue)
	{
		$plugin[$key] = isset($plugin[$key]) ? $plugin[$key] : $defaultValue;
	}
	public static $includePlugins = [];

	/**
	 * Подключить заданные javascript плагины.
	 * 
	 * @param array $plugins - ассоциативный массив, у которого в ключе задано название плагина, в значении - параметры плагина
	 * @return string Код javascript, содержащий js-плагины.
	 *
	 * Таким образом можно подключить следующие плагины с задаными параметрами (образец, просто копируйте эти строки и удаляйте ненужное):
	 *
	Yii::$app->view->registerJs(alhimik1986\yii2_js_view_module\components\JSPlugins::includePlugins([
		'formatter' => [[
			'selector' => '.date-formatter',
			'options' => [
				'pattern' => '{{D9}}.{{M9}}.{{9999}}',
			],
		]],
		'dataTables' => [                            // Подключить модуль DataTables (поиск и сортировка в таблице)
			'selector' => '#datatables',             // - css-селектор таблицы, к которой применить плагин
			'options'  => [
				'aLengthMenu' => [              // Варианты числа строк на странице
					[7, 10, 25, 50, 100, -1], 
					[7, 10, 25, 50, 100, 'Все'],
				],
				'iDisplayLength' => -1,                      // - Число строк в странице по умолчанию (Все)
				'tooltip' => [                               // - Всплывающие подсказки в таблице
					'selector' => 'tr',                          // - css-селектор внутри таблицы, к которому применить плагин
					'options'  => [                              // - параметры по умолчанию, вместо которых можно задать свои
						'delay' => 0,                            // - задержка исчезновения подсказки после того, как убрать курсор с элемента
						'track' => 'true',                       // - подсказка возле курсора
						'fade'  => 250,                          // - время исчезновения подсказки
					],
				],
			],
			'fixedTableHeader' => true,                      // Прилипание шапки таблицы к верху экрана (по умолчанию: включен)
			'onload' => true,                                // - Запустить при загрузке страницы
		],
		'fixedTableHeader' => [                     // Прилипание шапки таблицы
			[
				'selector' => '#fixed-table-header', 
			],
		[,
		'datepick' => [                         // - Подключить календарь jquery.Datepick от сайта http://keith-wood.name/datepick.html
			[
				'selector' => '.from-date',              // - css-селектор текстового поля, к которому применить плагин
				'options' => [                           // - Опции, которые нужно применить для этого селектора
					'dateFormat'  => 'dd-mm-yyyy',           // - формат даты
					'defaultDate' => '',                     // - дата по умолчанию
					'minDate'     => '',                     // - минимальная разрешенная дата
					'maxDate'     => '',                     // - максимальная разрешенная дата
					'onSelect'    => '',                     // - javascript-функция при выборе даты
				],
			],
			[
				'selector' => '.to-date',              // - css-селектор текстового поля, к которому применить плагин
				'options' => [                         // - Опции, которые нужно применить для этого селектора
					'dateFormat'  => 'dd-mm-yyyy',           // - формат даты
					'defaultDate' => '',                     // - дата по умолчанию
					'minDate'     => '',                     // - минимальная разрешенная дата
					'maxDate'     => '',                     // - максимальная разрешенная дата
					'onSelect'    => '',                     // - javascript-функция при выборе даты
				],
			],
		],
		'timeentry' => [                         // - Подключить плагин, который позволяет вводить время в текстовое поле
			[
				'selector' => '.from-time',               // - css-селектор текстового поля, к которому применить плагин
				'options'=> [                             // - Опции, которые нужно применить для этого селектора
					'defaultTime'  => '09:00',               // - время по умолчанию
					'timeSteps'    => [-1, -1, 0],           // - шаг прокрутки, соответственно, часов, минут, секунд
					'show24Hours'  => true,                  // - 24-часовой формат времени
					'spinnerImage' => '',                    // - рисунок прокрутки (скрыт по умолчанию)
					'scrollOnFocus'=> true,                  // - прокручивать время колесом мыши только на текстовом поле, на котором установлен курсор
				],
			],
			[
				'selector' => '.to-time',               // - css-селектор текстового поля, к которому применить плагин
				'options'=> [                           // - Опции, которые нужно применить для этого селектора
					'defaultTime'  => '18:00',               // - время по умолчанию
					'timeSteps'    => [-1, -1, 0],           // - шаг прокрутки, соответственно, часов, минут, секунд
					'show24Hours'  => true,                  // - 24-часовой формат времени
					'spinnerImage' => '',                    // - рисунок прокрутки (скрыт по умолчанию)
					'scrollOnFocus'=> true,                  // - прокручивать время колесом мыши только на текстовом поле, на котором установлен курсор
				],
			],
		],
		'ajaxTable' => [                                        // Подключить вспомогательные скрипты для поиска в ajax-таблице
			[
				'tbl_selector' => '#ajax-table',                             // Селектор ajax-таблицы для поиска
				'search_url' => \yii\helpers\Url::to(['search']),            // url-адрес, куда отправлять искомые данные
				'search_request_type' => 'post',                             // Тип запроса при поиске в таблице
				'search_on_change_selector' => '.search-on-change',          // Селектор элементов, при изменении или нажатии клавиш которых осуществлять поиск
				'search_on_change_dateSelector' => '.from-date, .to-date',   // Селектор элементов, при изменении которых осуществлять поиск
				'tooltip_selector' => '',                                    // Селектор для всплывающей подсказки при обновлении ajax-таблицы
				'loading_img' => '',                                         // url-адрес индикатора загрузки
				'error_selector' = '#errors',                                // Место, куда будут выводиться нестандартные ошибки валидации
				'ajaxDataCallBack' => 'js:function(data){return data;}',     // Пост-обработка данных для поиска перед отправкой ajax-запроса (например, чтобы втиснуть в поиск диапазон дат from_date и to_date)
				'afterSuccessCallBack' => 'js:function(data){}',             // Дополнительные операции при успешном запросе (в поиске)
			],
		],
	]));
	 * 
	 */

	public static function includePlugins($plugins)
	{
		$baseUrl = Yii::$app->getUrlManager()->getBaseUrl();
		$result = '';

		// Рендерю настраиваемые js-плагины + применяю кэширование
		if ($plugins) {
			ob_start();
			include realpath(__DIR__ . '/../views').'/jsPlugins.php';
			$result = ob_get_clean();
		}

		return $result;
	}
}