# Template Engine

TODO: добавить краткое описание


## RAD.template(templateString, [options])

Преобразует строку-шаблон в набор [IncrementalDOM](http://google.github.io/incremental-dom/#about) функций.

```javascript
var template = RAD.template('<h1>Hello <%= data.name %>!</h1>');
``` 

Результатом компиляции такой строки `'<h1>Hello <%= data.name %>!</h1>'` будет примерно следующая функция:

```javascript
var template = function(data) {
    elementOpen('h1');
    text('Hello ' + data.name);
    elementClose('h1');
};
``` 

Пример использования:

```javascript
var container = document.getElementById('container');
var template = RAD.template('<h1>Hello <%= data.name %>!</h1>');

RAD.utils.IncrementalDOM.patch(container, template, {name: 'John'});
``` 

Вторым аргументом можно передавать набор следующих опций:

<table>
  <tbody>
    <tr>
      <th> Parameter </th>
      <th> Type </th>
      <th> Default </th>
      <th> Description </th>
    </tr>
    <tr>
      <td>
      		parameterName
      </td>
      
      <td>
      		string
      </td>
      
      <td>
      		data
      </td>
      
      <td> 
      		Задает имя объекта с данными передаваемыми в функцию-темплейт: <br />
      		<pre>RAD.template('&lt;h1&gt;Hello &lt;%= data.name %&gt;!&lt;/h1&gt;')</pre> 
      </td>
    </tr>
    <tr>
		<td> 
			template 
		</td>
		
		<td> 
			object 
		</td>
		
		<td> 
			<pre>{
	evaluate: /&lt;%([\s\S]+?)%&gt;/g,
	interpolate: /&lt;%=([\s\S]+?)%&gt;/g,
	escape: /&lt;%-([\s\S]+?)%&gt;/g
}</pre>
		</td>
		
      	<td>
      	 По умолчанию шаблоны используют ERB-синтаксис такой же как и <a href="http://underscorejs.org/#template"> underscore.template</a>. Параметр template позволяет задавать свои символы для выражений (аналогично _.templateSettings в underscore).    
      	</td>
    </tr>
    <tr>
	  <td> 
	  	components 
	  </td>
	  
	  <td> 
	  	object 
	  </td>
	  
	  <td> 
	  	null 
	  </td>
	  
	  <td>
Определяет локальные компоненты.
<br>
<br>
RAD.js позволяет создавать реюзабельные компоненты которые  дуступны внутри шаблонов посредством кастомных тегов. В качестве компонента может выступать как простая функция так и View.    
<br>
<br> 
Компоненты могут быть как локальные так и глобальные.
<br>
<br> 
Глобальный компонент регистрируется при помощи метода <code>RAD.template.registerHelper</code> после чего становиться доступным для использования внутри любого шаблона.   
<br>
  
	  </td>
    </tr>

</tbody>
</table>

Пример обьявления локальных компонентов:

```javascript
var template = RAD.template( require('./todo-list.ejs'), {
    components: {
        TodoItem: require('../todo-item/')
    }
}); 

```

todo-list.ejs:

```erb
<ul class="todo-list">
    <% data.todos.each(function(todo) { %>
    <TodoItem model="<%= todo %>"/>
    <% }, view); %>
</ul>
```


## RAD.template.registerHelper(helperName, componentFunction)

Регистрирует функцию `componentFunction` как глобальный компонент доступный внутри любого шаблона посредством кастомнного тега `<helperName> content </helperName>`. 

`componentFunction` принимает два аргумента `attrs` и `content`:  
<br>

* `attrs` - обьект со всем аттрибутами передаными в компонент
* `content` - функция содержащая контент компонента преобразованый в IncrementalDOM инструкции. Таким образом компоненты поддерживают transclusion.  
 
**Важно:** Чтобы глобальный компонент был доступен внутри шаблона он должен быть зарегистрирован до компиляции шаблона.  


```javascript
var linkTemplate = RAD.template(require('./template.ejs'), {parameterName: 'link'} );

RAD.template.registerHelper('NavItem', function(attrs) {
    linkTemplate({
        href: attrs.href,
        title: attrs.title,
        selected: Backbone.history.fragment === attrs.href
    });
});
```

файл template.ejs:  

```erb
<% if (link.selected) { %>
    <a href="#/<%= link.href %>" class="selected"> <%= link.title %> </a>
<% } else { %>
    <a href="#/<%= link.href %>"> <%= link.title %> </a>
<% } %>
```

теперь зарегистрированный компонент доступен внутри шаблона как кастомный тег `<NavItem />`:

```html
<ul class="filters">
    <li>
        <NavItem href="" title="All" />
    </li>
    <li>
        <NavItem href="active" title="Active" />
    </li>
    <li>
        <NavItem href="completed" title="Completed" />
    </li>
</ul>
```

итоговый html:

```html
<ul class="filters">
	<li><a href="#/">All</a></li>
	<li><a href="#/active" class="selected">Active</a></li>
	<li><a href="#/completed">Completed</a></li>
</ul>
```

В примере выше мы зарегистрировали глобальный компонент `NavItem` который принимает параметры `href` и `title` и добавляет `selected` состояние в зависимости от текущего URL#fragment

> Обратите внимание что компиляцию хелперов можно произвести с помощью `RAD.template` и с помощью `RAD.template.compileHelper`. Разница состоит в том что в первом случае хелпер функция будет скомпелированная с замыканием и у вас не будет прямого доступа к  второму аргументу функции, который используеться в качестве функции рендеринга transclude контента. Во втором случае при компиляции, у вас будет прямой доступ и это позволит вам более изящно и коротко писать код transclude helpers.
> 
> Например, код простейшего transclude helper'aбудет выглядеть следующим образом:
> 
> ``` ejs
> <div><% content(); %></div>
> ```
> 
> ```javascript
> var templateFn = RAD.template.compileHelper(require('./template.ejs'));
> RAD.template.registerHelper('my-custom-div', templateFn);
> ``` 
> Более подробно можно почитать в документации по [helpers](helpers/README.md)


  
