<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace alhimik1986\yii2_js_view_module\assets;

use yii\web\AssetBundle;

class AjaxFormAsset extends AssetBundle
{
	public function init()
	{
		parent::init();
		
		$this->sourcePath  = realpath( __DIR__ .'/js/ajaxForm');
		
		$this->js = [
			'ajax-form.js',
		];
		
		$this->depends = self::$defaultDepends;
	}
	
	public static $defaultDepends = ['yii\web\JqueryAsset'];
}
