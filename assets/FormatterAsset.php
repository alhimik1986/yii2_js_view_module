<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace alhimik1986\yii2_js_view_module\assets;

use yii\web\AssetBundle;

class FormatterAsset extends AssetBundle
{
	public function init()
	{
		parent::init();
		$this->depends = self::$defaultDepends;
	}
	public static $defaultDepends = ['yii\web\JqueryAsset'];

	public $sourcePath = '@bower/formatter.js/dist';
	public $js = [
		'jquery.formatter.min.js',
	];
}