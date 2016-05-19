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
	
## <a name="template"></a>template
 
## <a name="dispatcher"></a>dispatcher
### <a name="dispatcher_publish"></a>dispatcher.publish
### <a name="dispatcher_subscribe"></a>dispatcher.subscribe
### <a name="dispatcher_unsubscribe"></a>dispatcher.unsubscribe
 
## <a name="view"></a>View

**RAD.View** - это расширенная версия Backbone.View которая предоставляет несколько дополнительных методов, а также ряд колбэков описывающих жизненный цикл View.
   
### <a name="view_template"></a>this.template
***
Свойство задающее шаблон. Может принимает либо строку либо шаблон с Incremental DOM аннотациями.   

##### Example
```javascript 
var LibraryView = RAD.View.extend({
	template: RAD.template(...)
}); 
``` 
### <a name="view_render"></a>this.render()
***
В отличии от Backbone, RAD.View предоставляет готовый метод render который использует Incremental DOM в качестве шаблонизатора.

##### Arguments
`none`
##### Returns
`{View Object}` - возвращает ссылку на View
##### Example
   
```javascript 
var WelcomePage = RAD.View.extend({ 
	template: document.getElementById('hello-page').innerHTML 
});  
var page = new WelcomePage({el: '#screen' });  
page.render(); 
```

### <a name="view_bind-render"></a>this.bindRender(target, events)
***
Это упрощенная запись для: `this.listenTo(target, events, this.render);` 

##### Arguments
`{Object} target` - объект на чьи события нужно подписаться: `Backbone.Collection`, `Backbone.Model` и т.д;

`{String} events` - имя события на которое нужно подписаться.

##### Returns
`{View Object}` - возвращает ссылку на View

##### Example

```javascript 
var WelcomePage = RAD.View.extend({   
	template: ...
	initialize: function() {
		this.bindRender(this.model, 'change:title');
	}
});  
var page = new WelcomePage({
	el: '#screen',
	model: pageModel 
});  
page.render();
pageModel.set('title', 'Hello world!'); // trigger page render
```
### <a name="view_bind-render"></a>this.refs
***
Внутри шаблона каждому элементу можно указывать специальный атрибут `ref="refName"`. После каждого вызова `render` в объект `this.refs` будут записаны ссылки на указанные элементы.

##### Example

```ejs
<form action="#" class="form-todo-item">
    <input ref="title" class="edit" name="todo-title" value="<%= data.model.title %>">
</form>
```
теперь по ссылке `this.refs.title` можно получить элемент `<input>`

```javascript
var TodoItem = RAD.View.extend({   
	...
	onRender: function() {
		this.refs.title.value // input value
	}
}); 
```


### <a name="view_props"></a>this.props
***
При создании View в конструктор можно передавать различные данные. Часть из них являются зарезервированными `model`, `collection`, `el`, `id`, `className`, `tagName`, `attributes`, `events`, `key`, `template` и будут присвоены самой View. Остальные же будут переданы в специальную модель `this.props`. 

Каждый раз когда значения `this.props` меняется будет вызван `render`.

##### Example

Это удобно когда мы используем View как компоненты внутри шаблона.

```ejs
<% var TodoItem = require('../todo-view/'); %>
...
<ul class="todo-list">

<% data.todos.each(function(todo, index) { %>

	<::TodoItem key="<%= todo.get('id') %>" model="<%= todo %>" index="<%= index %>"/>
	
<% }, this); %>

</ul>
```

Теперь каждому TodoItem буде доступно значение `this.props.get('index')`.

**Примечание:** В примере выше мы использовали `require('../todo-view/')` внутри шаблона. Для этого необходимо использовать webpack [itemplate loader](https://github.com/Rapid-Application-Development-JS/itemplate-loader).

### <a name="view_get-template-data"></a>this.getTemplateData();
***
Этот метод вызывается при каждом `render` и определяет какие данные будут переданы в шаблон. 

##### Arguments
`none` 

##### Returns
`{object}` - возвращает объект с данными;


##### Example
По умолчанию в шаблон передаются данные из `collection`, `model` и `props`.

```javascript
 getTemplateData: function() {
    return {
        collection: this.collection && this.collection.toJSON(),
        model: this.model && this.model.toJSON(),
        props: this.props.toJSON()
    };
}
```
получение данных внутри шаблона:

```
<label class="todo-label no-select">
    <%= data.model.title %>
</label>

```

Этот метод можно переопределить для передачи любых данных. 

```javascript
getTemplateData: function () {
    return {
        remaining: todoList.active().length,
        length: todoList.length
    }
}
```

Теперь значения length и remaining будут доступны внутри шаблона:

```ejs
<span class="todo-count">
    <%= data.remaining %> / <%= data.length %>
</span>
```

### <a name="view_get-id"></a>this.getID();
***
Возвращает внутренний id. 

##### Arguments
`none` 

##### Returns
`{string}` - возвращает строку идентификатор формата `view-134`;

##### Example

```javascript 
var WelcomePage = RAD.View.extend({
	tagName: 'section',     
	template: document.getElementById('hello-page').innerHTML 
});  
var page = new WelcomePage({el: '#screen' });  
page.getID(); // view-5
```

### <a name="view_destroy"></a>this.destroy();
***
Удаляет view и `el` из DOM, вызывает `this.stopListening` и отписывается от все событий которые были подписаны через `this.subscribe` 

##### Arguments
`none` 

##### Returns
`{undefined}`


### <a name="view_subscribe"></a>this.subscribe(channel, callback, [context]);
***
Позволяет подписатся на получения сообщений из `channel`. 

##### Arguments
`{String} channel` - имя канала на чьи события нужно подписаться

`{Function} callback` - функция будет вызвана каждый раз когда будет получено новое сообщение из `channel`

`{Object} context` - задает контекст выполнения `callback`


##### Returns
`{Undefined}` - Если метод вернет `false` - контент не буде изменен.

##### Example
```js
// router.js
var TodoRouter = Backbone.Router.extend({
    routes: {
        '*filter': 'filterItems'
    },
    filterItems: function (param) {
        RAD.publish('filter', param);
    }
});

// todo-list.js
var TodoList = RAD.View.extend({
    template: require('./template.ejs'),
    initialize: function () {
        this.subscribe('filter', this.filter, this);
    },
    filter: function (value) {
        this.props.set('filter', value);
    }
 });   

```

### <a name="view_unsubscribe"></a>this.unsubscribe([channel], [callback], [context]);
***
Позволяет отписатся от получения сообщений.

##### Example
```js

// отписать this.filter от получения сообщений от канала filter
this.unsubscribe('filter', this.filter); 

// отписать все колбэки от получения сообщений от канала filter
this.unsubscribe('filter'); 

// отписать this.filter от получения сообщений из любого канала
this.unsubscribe(null, this.filter);

// отписать все колбэки с нужным контекстом 
this.unsubscribe(null, null, this);  

```

### <a name="view_on-before-render"></a>this.onBeforeRender();
***
Вызывется перед каждым запуском `render`.

##### Arguments
`none` 

##### Returns
`{Boolean | Undefined}` - Если метод вернет `false` - контент не буде изменен.

##### Example

```js
var CustomView = RAD.View.extend({
    className: 'block',

    onBeforeRender: function () {
        if (this.dataEl) {
            this.renderValue();
            return false;
        }
    },

    onRender: function () {
        this.el.innerHTML = template({date: new Date()});
        this.dataEl = this.el.querySelector('.data');
        this.renderValue();
    },

    renderValue: function () {
        this.dataEl.textContent = ' ' + this.props.get('value') + ' ';
    }
});
```

### <a name="view_on-render"></a>this.onRender();
***
Будет вызван сразу после `render`. В этот момент View уже закончила отрисовку шаблона.  

##### Arguments
`none` 

##### Returns
`{Undefined}`

### <a name="view_on-attach"></a>this.onAttach();
***
Вызывается сразу после того как View была отрисована и добавлена в DOM.

##### Arguments
`none` 

##### Returns
`{Undefined}`


### <a name="view_on-detach"></a>this.onDetach();
***
Вызывается сразу после того как View была удалена из DOM.

##### Arguments
`none` 

##### Returns
`{Undefined}`


### <a name="view_on-destroy"></a>this.onDestroy();
***
Этот колбек будет вызван если View была удалена используя метод `this.destroy`.   

##### Arguments
`none` 

##### Returns
`{Undefined}`

##### Example

## <a name="module"></a>Module
### <a name="module_on-receive-msg"></a>this.onReceiveMsg
### <a name="module_destroy"></a>this.destroy
### <a name="module_extend"></a>Module.extend
 
## <a name="plugins"></a>Plugins
### <a name="plugins_navigator"></a>navigator
### <a name="plugins_transition-group"></a>transition group
	