# API Reference

Содержит сравочный материал по всем доступным методам RAD.js v.2. 

## Table of Contents
* [core](#core)
	* [setOptions](#core_set-options)
	* [get](#core_get)
	* [getAll](#core_get_all)
	* [register](#core_register)
	* [unregister](#core_unregister)
* [utils](#utils)
	* [AnimationEnd](#utils_animation-end)
	* [binder](#utils_binder)
	* [DOM](#utils_dom)
		* [hasClass](#utils_dom_has-class)
		* [addClass](#utils_dom_add-class)
		* [removeClass](#utils_dom_remove-class)
	* [ITemplate](#utils_itemplate)
		* [compile](#utils_itemplate_compile)
		* [helpers](#utils_itemplate_helpers)
		* [options](#utils_itemplate_options)
		* [registerHelper](#utils_itemplate_register-helper)
		* [unregisterHelper](#utils_itemplate_unregister-helper)
	* [IncrementalDOM](#utils_incremental-dom)
	* [template](#template)
	* [TransitionEnd](#utils_transition-end)
		* [bind](#utils_transition-end_bind)
		* [unbind](#utils_transition-end_unbind)
		* [unbindAll](#utils_transition-end_unbind-all)
* [template](#template) 
* [dispatcher](#dispatcher)
	* [publish](#dispatcher_publish)
	* [subscribe](#dispatcher_subscribe)
	* [unsubscribe](#dispatcher_unsubscribe)
* [View](#view)
	* [constructor / initialize](#view_initialize) 
	* [template](#view_template)
	* [props](#view_props)
	* [setElement](#view_set-element)
	* [getID](#view_get-id)
	* [getTemplateData](#view_get-template-data)
	* [bindRender](#view_bind-render)
	* [render](#view_render)
	* [destroy](#view_destroy)
	* [onReceiveMsg](#view_on-receive-msg)
	* [onBeforeRender](#view_on-before-render)
	* [onRender](#view_on-render)
	* [onAttach](#view_on-attach)
	* [onDetach](#view_on-detach)
	* [onDestroy](#view_on-destroy)
	* [extend](#view_extend)
	* [dispatcher](#dispatcher)
* [Module](#module)
	* [onReceiveMsg](#module_on-receive-msg)
	* [destroy](#module_destroy)
	* [extend](#module_extend)
	* [dispatcher](#dispatcher) 
* [Plugins](#plugins)
	* [layout manager](#plugins_layout-manager)
	* [navigator](#plugins_navigator)
	* [transition group](#plugins_transition-group)

## <a name="core"></a>core

Объект содержащий следующие методы ядра фреймверка:

* [setOptions](#core_set-options)
* [get](#core_get)
* [getAll](#core_get_all)
* [register](#core_register)
* [unregister](#core_unregister)

### <a name="core_set-options"></a>core.setOptions(obj)

Устанавливает внутрение настройки RAD.js v.2

#### Arguments

JSON объект с настройками.

```js
{
    debug: false,
    parameterName: 'data',
    viewAttributes: {
        'data-role': 'view'
    }
}
```

Параметры:

* `debug` - **true** или **false**, указывает как именно компилировать шаблоны
* `parameterName` - объект с данными, возвращаемый [getTemplateData()](#view_get-template-data), и который доступен в шаблоне во время рендеринга.
* `viewAttributes` - объект со служебными атрибутами [View](#view), которые используються фреймвоком. В данный момент содержит только атрибут `data-role` определяющий префекс для [ID](#view_get-id), который виден как атрибут DOM элемента.

#### Returns

`undefined`

#### Example

```js
import {core} from 'RAD'

core.setOptions({
	debug: true
});
```

#### Tips

* параметр `debug` - отвечает только за тип компиляции при использовании [template](#template). Этот параметр не затрагивает компиляцию с помощью [webpack loader](https://github.com/Rapid-Application-Development-JS/itemplate-loader), у него есть свои настройки.
* во время отладки приложения, вы можете использовать поиск по атрибут имя которого определено с помощью `data-role` а занчение через [ID](#view_get-id) для поиска DOM структуры соответствующей конкретной **view**
* в данный момент, реальной необходимости использовать этот метод в каких либо бизнес кейсах нет.

### <a name="core_get"></a>core.get(view_id)

Возвращает экземпляр зарегистрированного View используя в качестве идентификатора **id** возвращаемое [ID](#view_get-id).

#### Arguments

`string` -  view ID

#### Returns

Возвращает экземпляр [View](#view) по зарегестрированному ID, если ID не зарегестрирован или экземпляр не создан то будет возвращен **undefined**

#### Example

```js
import {core} from 'RAD'

let view = core.get('view-key-details');
```

#### Tips

* По факту метод возвращает экземпляры `view` только в двух случаях: 1) view автоматически было создано для отображания на экране, 2) вы в ручную создали экземпляр `view`.

### <a name="core_get_all"></a>core.getAll()

Возвращает все экземпляры инстанцированных `view`.

#### Arguments

`none`

#### Returns

Возвращает объект содержащий в качестве аттрибутов -  view ID, а в качестве значений аттрибутов - экземпляры инстанцированных `view`.

#### Example

```js
import {core} from 'RAD'

let views = core.getAll();
let currentView = views['view_ID'];
```

#### Tips

* этот, как и [предидущий метод](#core_get), использует ID view определяемый с помощью [ID](#view_get-id). Поэтому, даже если нет необходимости, иногда имеет смысл во время отладки определить **view ID** для того что бы в консоле посмотреть состояние указанной view.

### <a name="core_register"></a>core.register(id, object)

Регестрирует экземпляр view под указаным ID.

#### Arguments

* `id` - view ID генерируемое автоматически или определяемое с помощью [ID](#view_get-id)
* `object` - экземпляр view регестрируеться под данным **id**

#### Returns

`undefined`

#### Example

```js
import {core} from 'RAD'
import view from './sorce/views/my_view'

core.register('my-view', view);
```

#### Tips

* данный метод автоматически вызываеться при инстанцировании любой `view`, и пердназначен для системных нужд. Нет необходимости вызывать его в ручную.
* При вызове `register` для уже зарегестрированной `view` будет сгенерированно исключение.
* Метод оставлен в открытом доступе, для регистрации `view` не унаследованных от **RAD.View**

### <a name="core_unregister"></a>core.unregister(id)

Удаляет регистрацию для уже зарегистрированной `view` по **id**

#### Arguments

* `id` - идентификатор `view`

#### Returns

`undefined`

#### Example

```js
import {core} from 'RAD'

core.unregister('my-view');
```

#### Tips

* так же как и [`register`](#core_register) вызываеться автоматически для каждой [`view`](#view) которая удаляеться.
* нет необходимости вызывать в ручную.

## <a name="utils"></a>utils

Namespace содержащее узкоспециализированные, приклодные методы 

### <a name="utils_animation-end"></a>utils.AnimationEnd(element)

Враппер для регистрирации обработчиков события окончания анимации, состоящего из нескольких transitions, вызванного на оборачиваемом **element**.

#### Arguments

`element` - элемент, который оборачиваеться данным врапером.

#### Returns

объект `AnimationEnd`, в котором доступно три метода: [`bind`](#utils_transition-end_bind) [`unbind`](#utils_transition-end_unbind) [`unbindAll`](#utils_transition-end_unbind-all), аналогичные по функциональности с методами [`TransitionEnd`](#utils_transition-end)

#### Example

```js
import {utils} from 'RAD'

...
let animationEnd = utils.AnimationEnd(this.refs.myElement);
animationEnd.bind(()=>{
	// do something
});
```

#### Tips

* Более подробный пример использования можно увидеть в исходниках [transition group](#plugins_transition-group) плагина.

### <a name="utils_binder"></a>utils.binder

Функция которая связывает кастомные теги в шаблонах с javascript кодом [во время иньекции](basics/Injection.md). 

#### Arguments

* `component` - функция или объект, который связываеться с кастомным тегом
* `props` - объект данных сформированный из атрибутов кастомного тега
* `content` - функция рендеринга контента [компонента/хелпера](#utils_itemplate_register-helper)

#### Tips

* находиться в открытом доступе для иньекции в [webpack loader](cookbook/Loader.md)
* возможно использовать для написания кастомных лоадеров

### <a name="utils_dom"></a>utils.DOM

Объект содержащий полифилы для работы с классами на мобильных устройствах. Не использующий `classList`.

#### <a name="utils_dom_has-class"></a>utils.DOM.hasClass(element, className)

#### Arguments

* `element` - DOM элемент, в котором смотриться наличие css класса
* `className` - имя класса, которое ищиться в элементе
	
#### Returns

возвращает булево значение: **true** - если элемент содержит данный класс, **false** - если элемент не содержит.

#### Example

```js
import {utils} from 'RAD'

...
let hasClass = utils.DOM.hasClass(my_element,'my_class');
```

#### <a name="utils_dom_add-class"></a>utils.DOM.addClass

#### Arguments
#### Returns
#### Example
#### Tips

#### <a name="utils_dom_remove-class"></a>utils.DOM.removeClass

#### Arguments
#### Returns
#### Example
#### Tips

### <a name="utils_itemplate"></a>utils.ITemplate
#### <a name="utils_itemplate_compile"></a>utils.ITemplate.compile

#### Arguments
#### Returns
#### Example
#### Tips

#### <a name="utils_itemplate_helpers"></a>utils.ITemplate.helpers

#### Arguments
#### Returns
#### Example
#### Tips

#### <a name="utils_itemplate_options"></a>utils.ITemplate.options

#### Arguments
#### Returns
#### Example
#### Tips

#### <a name="utils_itemplate_register-helper"></a>utils.ITemplate.registerHelper

#### Arguments
#### Returns
#### Example
#### Tips

#### <a name="utils_itemplate_unregister-helper"></a>utils.ITemplate.unregisterHelper

#### Arguments
#### Returns
#### Example
#### Tips

### <a name="utils_incremental-dom"></a>utils.IncrementalDOM	

### <a name="utils_transition-end"></a>utils.TransitionEnd

#### Arguments
#### Returns
#### Example
#### Tips

#### <a name="utils_transition-end_bind"></a>utils.TransitionEnd.bind

#### Arguments
#### Returns
#### Example
#### Tips

#### <a name="utils_transition-end_unbind"></a>utils.TransitionEnd.unbind

#### Arguments
#### Returns
#### Example
#### Tips

#### <a name="utils_transition-end_unbind-all"></a>utils.TransitionEnd.unbindAll

#### Arguments
#### Returns
#### Example
#### Tips
	
## <a name="template"></a>template
 
## <a name="dispatcher"></a>dispatcher
### <a name="dispatcher_publish"></a>dispatcher.publish
### <a name="dispatcher_subscribe"></a>dispatcher.subscribe
### <a name="dispatcher_unsubscribe"></a>dispatcher.unsubscribe
 
## <a name="view"></a>View
### <a name="view_initialize"></a>View.initialize
### <a name="view_template"></a>this.template
### <a name="view_props"></a>this.props
### <a name="view_set-element"></a>this.setElement
### <a name="view_get-id"></a>this.getID
### <a name="view_get-template-data"></a>this.getTemplateData
### <a name="view_bind-render"></a>this.bindRender
### <a name="view_render"></a>this.render
### <a name="view_destroy"></a>this.destroy
### <a name="view_on-receive-msg"></a>this.onReceiveMsg
### <a name="view_on-before-render"></a>this.onBeforeRender
### <a name="view_on-render"></a>this.onRender
### <a name="view_on-attach"></a>this.onAttach
### <a name="view_on-detach"></a>this.onDetach
### <a name="view_on-destroy"></a>this.onDestroy
### <a name="view_extend"></a>View.extend

## <a name="module"></a>Module
### <a name="module_on-receive-msg"></a>this.onReceiveMsg
### <a name="module_destroy"></a>this.destroy
### <a name="module_extend"></a>Module.extend
 
## <a name="plugins"></a>Plugins
### <a name="plugins_layout-manager"></a>layout manager
### <a name="plugins_navigator"></a>navigator
### <a name="plugins_transition-group"></a>transition group
	