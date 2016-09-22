<?php

namespace alhimik1986\yii2_js_view_module;
use Yii;
use yii\di\Container;

/**
 * yii2_js_view_module module definition class
 */
class Module extends \yii\base\Module
{
    /**
     * @inheritdoc
     */
    //public $controllerNamespace = 'alhimik1986\yii2_js_view_module\Module\controllers';

	//public $defaultRoute = 'setting';
	public static $l18n_base_path = null;
	protected static $isTranslationInited = false;

    public function init()
    {
        parent::init();
    }
	protected static function namespace_str()
	{
		return str_replace('\\', '/', __NAMESPACE__);
	}
	
    public static function registerTranslations()
    {
        Yii::$app->i18n->translations[self::namespace_str().'/*'] = [
            'class' => 'yii\i18n\PhpMessageSource',
            'sourceLanguage' => 'en-US',
            'basePath' => self::$l18n_base_path ? self::$l18n_base_path : __DIR__ .'/messages',
            'fileMap' => [
                self::namespace_str().'/app' => 'messages.php',
            ],
        ];
		self::$isTranslationInited = true;
    }

	/**
	 * Использование интернационализации (перевода) внутри модуля.
	 * Пример использования: use alhimik1986\yii2-settings-module\Module; Module::t('app', 'The data is not found!');
	 */
    public static function t($category, $message, $params = [], $language = null)
    {
		if ( ! self::$isTranslationInited)
			self::registerTranslations();
        return Yii::t(self::namespace_str() .'/'. $category, $message, $params, $language);
    }
}
