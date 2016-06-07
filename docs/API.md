# API Reference

Содержит сравочный материал по всем доступным методам RAD.js v.2. 

## Table of Contents
* [core](#core)
	* [setOptions](#core_set-options)
	* [get](#core_get)
	* [getAll](#core_get_all)
* [utils](#utils)
	* [AnimationEnd](#utils_animation-end)
	* [binder](#utils_binder)
	* [DOM](#utils_dom)
		* [hasClass](#utils_dom_has-class)
		* [addClass](#utils_dom_add-class)
		* [removeClass](#utils_dom_remove-class)
	* [ITemplate](#utils_itemplate)
		* [registerHelper](#utils_itemplate_register-helper)
		* [unregisterHelper](#utils_itemplate_unregister-helper)
	* [IncrementalDOM](#utils_incremental-dom)
* [template](#template) 
* [dispatcher](#dispatcher)
	* [publish](#dispatcher_publish)
	* [subscribe](#dispatcher_subscribe)
	* [unsubscribe](#dispatcher_unsubscribe)
* [View](#view)
	* [template](#view_template)
	* [props](#view_props)
	* [refs](#view_refs)
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

* `{boolean} debug='false'` - **true** или **false**, указывает как именно компилировать шаблоны
* `{string} parameterName='data'` - имя объекта с данными, возвращаемый [getTemplateData()](#view_get-template-data), и который доступен в шаблоне во время рендеринга.
* `{object} viewAttributes` - объект со служебными атрибутами [View](#view), которые используються фреймвоком. В данный момент содержит только атрибут `data-role` определяющий префекс для [ID](#view_get-id), который виден как атрибут DOM элемента.

#### Returns

`{undefined}`

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

`{string}` -  view ID

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


## <a name="utils"></a>RAD.utils

Namespace содержащее узкоспециализированные, прикладные методы 

### <a name="utils_animation-end"></a>utils.AnimationEnd(element)
***
Враппер для регистрирации обработчиков события окончания анимации, состоящего из нескольких transitions, вызванного на оборачиваемом **element**.

#### Arguments

`{element}` - элемент, который оборачиваеться данным врапером.

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

### <a name="utils_binder"></a>utils.binder(component, props, content)
***
Функция которая связывает кастомные теги в шаблонах с javascript кодом [во время иньекции](basics/Injection.md). 

#### Arguments

* `{Function} component` - функция или объект, который связываеться с кастомным тегом
* `{object} props` - объект данных сформированный из атрибутов кастомного тега
* `{Function} content` - функция рендеринга контента [компонента / хелпера](#utils_itemplate_register-helper)

#### Tips

* находиться в открытом доступе для иньекции в [webpack loader](cookbook/Loader.md)
* возможно использовать для написания кастомных лоадеров



### <a name="utils_itemplate_register-helper"></a>utils.ITemplate.registerHelper(name, fn)
***
Для компиляции html/ejs шаблонов в набор Incremental DOM функций, RAD.js использует iTemplate. С более детальным описанием всех его возможностей можно ознакомится [тут](https://github.com/Rapid-Application-Development-JS/itemplate). 

Одной из главных его особенностей является возможность созадавать компоенеты (helpers) которые представляют собой обычные функции и которые можно декларативно описывать внутри шаблонов.

#### Arguments
`{string} name` - имя компонента под которым он будет доступен внтури шаблона.

`{Function} fn` - функция которая в качестве аргументов принимает обьект `attrs` содержащий список всех атрибутов переданных компоненту (внутри шаблона) и вторым аргументом функцию `content` - это функция содержащая в себе контент нашего компонент. 

#### Returns

`{undefined}`

#### Example
```js
var RAD = require('RAD');
var Backbone = require('Backbone');
var navItemTemplate = RAD.template( require('./NavItemTemplate.ejs') );

RAD.utils.ITemplate.registerHelper('NavItem', function (attrs, content) {
    navItemTemplate({
        href: attrs.href,
        selected: Backbone.history.fragment === attrs.href
    }, content);
});

```

NavItemTemplate.ejs:

```ejs
<% if (data.selected) { %>
<a href="#/<%= data.href %>" class="selected"> <% content(); %> </a>
<% } else { %>
<a href="#/<%= data.href %>"> <% content(); %> </a>
<% } %>
```

Теперь наш копонент можно использовать в любом шаблоне:

```ejs
<ul class="filters">
    <li>
        <NavItem href="">All</NavItem>
    </li>
    <li>
    	 <NavItem href="active">Active</NavItem>
    </li>
    <li>
    	 <NavItem href="completed">Completed</NavItem>
    </li>
</ul>

```

В итоге мы получим следующий html:

```html
<ul class="filters">
	<li><a href="#/">All</a></li>
	<li><a href="#/active">Active</a></li>
	<li><a href="#/completed" class="selected">Completed</a></li>
</ul>

```


#### <a name="utils_itemplate_unregister-helper"></a>utils.ITemplate.unregisterHelper('name')
***
Удалить ранее зарегистрированый компонент

##### Arguments
`{string} name` - имя компонента который нужно удалить.
##### Returns
`{undefined}`


### <a name="utils_incremental-dom"></a>utils.IncrementalDOM
***
Предоставляет доступ к [Incremental DOM API](https://github.com/google/incremental-dom)	
	
## <a name="template"></a>RAD.template(str);
Компилирует html/ejs строку в набор Incremental DOM анотаций.

##### Arguments
`{String} str` - html/ejs строка.

##### Returns
`{Function}` - возвращает функцию-шаблон которая содержит Incremental DOM анотации. 

##### Example
```js
var RAD = require('RAD');
var Backbone = require('Backbone');
var navItemTemplate = RAD.template( require('./NavItemTemplate.ejs') );

RAD.utils.ITemplate.registerHelper('NavItem', function (attrs, content) {
    navItemTemplate({
        href: attrs.href,
        selected: Backbone.history.fragment === attrs.href
    }, content);
});

```

 
## <a name="dispatcher"></a>Event Dispatcher
Для коммуникации между модулями, RAD.js предоставляет Event Dispatcher который по факту является клоном Backbone.Events.


### <a name="dispatcher_subscribe"></a>RAD.subscribe(channel, callback, [context]);
***
Позволяет подписатся на получения сообщений из `channel`. 

##### Arguments
`{String} channel` - имя канала на чьи события нужно подписаться

`{Function} callback` - функция будет вызвана каждый раз когда будет получено новое сообщение из `channel`

`{Object} context` - задает контекст выполнения `callback`


##### Returns
`{Undefined}`

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
        RAD.subscribe('filter', this.filter, this);
    },
    filter: function (value) {
        this.props.set('filter', value);
    }
 });   

```

### <a name="dispatcher_unsubscribe"></a>RAD.unsubscribe([channel], [callback], [context]);
***
Позволяет отписатся от получения сообщений.

##### Example
```js

// отписать this.filter от получения сообщений от канала filter
RAD.unsubscribe('filter', this.filter); 

// отписать все колбэки от получения сообщений от канала filter
RAD.unsubscribe('filter'); 

// отписать this.filter от получения сообщений из любого канала
RAD.unsubscribe(null, this.filter);

// отписать все колбэки с нужным контекстом 
RAD.unsubscribe(null, null, this);  

```

### <a name="dispatcher_publish"></a>RAD.publish(chanel, [args]);
***
Позволяет отправлять сообщения по указаному каналу. 

##### Arguments
`{string} chanel` - название каннала или список каналов (разделенных пробелом)

`{} args` - можно передавать любое количество аргументов. Агрументы будут переданны в колбэк функцию которая подписана на канал. 

##### Returns
`{View Object}` - возвращает ссылку на View
##### Example

```js
var TodoRouter = Backbone.Router.extend({
    routes: {
        '*filter': 'filterItems'
    },
    filterItems: function (param) {
        RAD.publish('filter', param);
    }
});
```
 
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
### <a name="view_refs"></a>this.refs
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

`{Object} context` - задает контекст выполнения `callback`. По умолчанию `context` === `this`


##### Returns
`{Undefined}` - Если метод вернет `false` - контент не буде изменен.

##### Example

```js
var TodoList = RAD.View.extend({
    template: require('./template.ejs'),
    initialize: function () {
        this.subscribe('filter', this.filter);
    },
    filter: function (value) {
        this.props.set('filter', value);
    }
 });   

```

### <a name="view_unsubscribe"></a>this.unsubscribe([channel], [callback], [context]);
***
Позволяет отписатся от получения сообщений. По умолчанию: `context` === `this`.

##### Example
```js

// отписать this.filter от получения сообщений от канала filter
this.unsubscribe('filter', this.filter); 

// отписать все колбэки от получения сообщений от канала filter
this.unsubscribe('filter'); 

// отписать this.filter от получения сообщений из любого канала
this.unsubscribe(null, this.filter);

// отписать все колбэки на которые была подписана View 
this.unsubscribe();  

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
Вызывается сразу после того как View была удалена из DOM в следсвии перерисовки родительского копонента.

##### Arguments
`none` 

##### Returns
`{Undefined}`


### <a name="view_on-destroy"></a>this.onDestroy();
***
Этот колбек будет вызван если View была удалена используя метод `this.destroy`. `onDetach` так же будет вызван перед `onDestroy`.

##### Arguments
`none` 

##### Returns
`{Undefined}`


## <a name="plugins_navigator"></a>navigator
Для простоты навигации RAD.js предоставляет плагин который позволяет удобное API для вставки Views или компонентов в DOM. 

### RAD.publish('naviagtion.show', data);
`naviagtion.show` - это зарезервированое имя канала. navigator принимает следующие `data`:

##### Arguments
```js
RAD.publish('navigation.show', {
    container: '#container', // css селектор или html элемент куда необходимо вставить View или компоенент;
    content: SomeView, // функция конструктор
    options: someData // данные которые будут переданы в функцию конструктор
});

```

##### Returns
`{Undefined}`

##### Example
```js
var MainPage = require('./views/MainPage');

RAD.publish('navigation.show', {
    container: '#container',
    content: MainPage,
    options: {
    	title: 'Home Page'
    }
});

```

```js
var MainPage = RAD.View.extend({
    template: require('./MainLayout.ejs'),
    initialize: function () {
        this.props.get('title'); // Hello Page
    }
});

```

## <a name="plugins_transition-group"></a>transition group

Для удобства работы с CSS анимациями RAD.js предоставляет встроенный компонент `<i-transtion></i-transition>`. 
На данный момент он поддерживает только CSS3 Keyframes Animation. И предоставляет API схожее с React Transition Group.

##### Options:
`{string} tagName='div'` - позволяет указать тег transition group элемент. 

`{string} initialAnimation` - если указать как `none` - тогда при первой отрисовки анимация к элемента применятся не будет.

`{string} animationEnter` - CSS класс который будет применятся к добавленным элементам. 
 
`{string} animationLeave` - CSS класс который будет применятся к удаляемым элементам. 

`{string} animationName` - позволяет указать один общий CSS класc для `animationLeave` и `animationEnter`.

`{number | string} leaveTimeout=3500 enterTimeout=3500` - Позволяют задать время тайм-аута для анимации. Transition group всегда старается отследить события onAnimationEnd но для подстраховки можно указать явно timeout для предотвращения подвисания. 
Если указать timeout=0 - анимация произойдет мгновенно.  


`{string} enterClass='enter'` - позволяет переопределить доп класc применяемый к добавленым элементам. 

`{string} leaveClass='leave'` - позволяет переопределить доп класc применяемый к добавленым элементам. 

`{string} activeClass='animated'` - позволяет переоределить класc-активатор для анимации.

`{number | string} delay='0'` - позволяет указать задержку перед выполнением анимации
> Обратите внимание, что в данном случае `delay` не являеться полным аналогом css `animation-delay`, в нашем случае элемент добавляеться в DOM, но анимация стартует именно после указанной задержки.
> 
> Следует так же учитывать, что при отсутствии атрибута `delay` анимация происходит **синхронно**, а при его указании (даже при значении `0`), анимация будет **асинхронной**!

`{string} groupName='group'` - позволяет синхронизировать асинхронные анимации, сгрупировав их в одну группу с одним именем.
> Обратите внимание, что атрибут `groupName` используеться только в случае асинхронных анимаций, при синхронных анимациях, он просто не будет иметь влияние.
> 
> Данный атрибут как правило необходим когда вы пытаетесь анимировать переход с одной `view` на другую, в которой есть вложенные анимации, даже если в них установлена стартовая анимация как `initialAnimation ='none'`, в этом случае Вам необходимо объеденить все анимации в группу с одним именем и установить `delay='0'`. 

##### Example	

``` ejs
<i-transition tagName="ul"
              class="todo-list"
              animationName="toggleHeight"
              initialAnimation="none"
              enterTimeout="400"
              leaveTimeout="400">

        <% data.todos.each(function(todo) { %>

        <::TodoItem key="<%= todo.get('id') %>"
                    model="<%= todo %>"
                    tagName="li"/>

        <% }, this); %>

</i-transition>
```
**Важно**: дочернии элементы transition group должны именть уникальный `key`


```css
@keyframes animateHeight {
    0% {
        height: 0;
        overflow: hidden;
    }

    100% {
        height: 58px;
        overflow: hidden;
    }
}

.toggleHeight {
    animation-name: animateHeight;
}

.toggleHeight.leave {
    animation-direction: reverse;
}

```

Для описания CSS анимации transition group предоставляет сразу 3 CSS класcа которые будут применятся в следующий последовательности:

- Enter Animation. В момент добавления нового DOM узла к нему буду добавлены CSS классы указанные в параметрах: `animationEnter` и `enterClass` - в этот момент можно описать анимацию и задать начальное состояния. После чего будет добавлен класс-тригер `activeClass` - в этот момент можно запустить нашу анимацию. 

- Leave Animation: перед удалением к DOM узлу добавляются классы указаны в `animationLeave` и `enterClass` после чего будет добавлен клас-тригер `activeClass`

Не обязательно использовать все 3-и класса для описания анимации. Можно всю анимации описать и через `animationEnter` и `animationLeave` или же только через `animationName`. Дополнительные класы могут быть использованы для стилизации, изменения animation-direction.

Также достаточно легко использовать готовые наборы/библиотеки для CSS анимаций такие как Animate.css (можно найти пример использование в demo/example-2_two-pages) 

 