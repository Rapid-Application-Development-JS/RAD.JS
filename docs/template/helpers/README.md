# Table of Contents

 - Компиляция
 - автоматический режим
 - ручной режим
 - RAD.template(templateString, [options])
 - опции шаблонов
 - открытые теги, закрытые теги
 - support custom tags & webcomponents, кастомные теги, порядок создания инркментал дома
 - работа со стороними библиотеками
 - кастомный рендеринг
 - работа с атрибутами, кастомные атрибуты, атрибуты без значений
 - выражения
 - undefined в выражениях
 - js в темплейтах
 - контекст
 - key для сохранения элементов
 - статик масивы для экономии памяти
 - хелперы
  - стандартные хелперы
  - хелперы с сонтентом
  - контекст в хэлперах
  - передача данных с хэлперов оберток
 - refs
 - динамические refs
 - форматирование текста, html escape, utf коды

#Компиляция

Компиляция преобразует строку-шаблон в набор [IncrementalDOM](http://google.github.io/incremental-dom/#about) функций.

```ejs
<h1>Hello <%= data.name %>!</h1>
``` 

Результатом компиляции такой строки будет функция, выполняющая код аналогично следующей:

```javascript
var template = function(data) {
    elementOpen('h1');
    text('Hello ' + data.name);
    elementClose('h1');
};
```
> термин `аналогично` связан с тем что функции `elementOpen` `text` `elementClose` будут представлены в другом, укороченом, синтаксисе, определенном через замыкание. Так же возможны некоторые внутрение оптимизации синтаксиса, но функционально будет выполнена именно данная последовательность комманд.

## Автоматическая и ручная компиляция шаболнов

Компиляция шаблона в `RAD` может происходить в автоматическом и ручном режиме.

### автоматический режим

В случае если вы устанавливаете значения свойства класса **View** `template` как строку, при инициализации экземпляра этого класса будет произведенна автоматическая компиляция в шаблонную функцию.

### ручная компиляция

Если вы хотите произвести компиляцию шаблона с кастомными параметрами или использовать уже заранее подготовленную шаблонную функцию, Вы можете так же присвоить ее в качестве значения свойству `template` необходимого класса.

> В этом случае, следует учитывать два момента:
> 
> - переданные во время компиляции опции остаються установленными и для последующих вызовов функции компиляции, поэтому в случае установки кастомных параметров не для всего проекта, после компиляции Вам необъодимо будет вернуть параметры по умолчанию
> - функция которая устанавливаеться в качестве значения параметра `template` должна манипулировать c элементами DOM'a с помощью функций [incremental-dom](). Если вам необходима другая функциональность смотрите [работа со стороними библиотеками]() и [кастомный рендеринг](). 

Для того чтобы скомпилировать шаблон в функцию необходимо воспользоваться методом [`RAD.template`](), например следующим образом:

```javascript
import template from 'RAD';

var templateFn = template(require('patch-to-template.ejs'));
```

В качестве второго параметра компиляции можно передавать  [опции компиляции]().

### RAD.template(templateString, [options])

Данная функция компилирует строку переданную первым параметром в шаблонную функцию c командами [incremental-dom]() 

```javascript
var container = document.getElementById('container');
var template = RAD.template('<h1>Hello <%= data.name %>!</h1>');

RAD.utils.IncrementalDOM.patch(container, template, {name: 'John'});
```

> Обратите внимание на то как применяеться шаблонная функция, на самом деле в большинстве случаев Вам [нет необходимости применять шаблоны в ручную](#). Но Вы всегда можете использовать как и прямую ссылку на `IncrementalDOM` если добавите библиотеку в проект, так уже внедренную `RAD.utils.IncrementalDOM`, разницы нет.

### options

Вторым параметром идут опции компиляции:

<table>
    <tbody>
    <tr>
        <th> Parameter</th>
        <th> Type</th>
        <th> Default</th>
        <th> Description</th>
    </tr>
    <tr>
        <th colspan="4"> Парсинг шаблонов </th>
    </tr>
    <tr>
        <td> template </td>
        <td> Object </td>
        <td>
			<pre>
{
	evaluate: /&lt;%([\s\S]+?)%&gt;/g,
	interpolate: /&lt;%=([\s\S]+?)%&gt;/g,
	escape: /&lt;%-([\s\S]+?)%&gt;/g
}
            </pre>
        </td>
        <td>
            По умолчанию шаблоны используют ERB-синтаксис такой же как и <a href="http://underscorejs.org/#template"> underscore.template</a>. Параметр template позволяет задавать свои символы для выражений (аналогично _.templateSettings в underscore).
        </td>
    </tr>
    <tr>
        <td> order </td>
        <td> String Array </td>
        <td> ['interpolate', 'escape', 'evaluate'] </td>
        <td>
            Определяет порядок применения регулярных вырожений из `options.template`, для случая если вы захотите пререопределить используемые шаблоны
        </td>
    </tr>
    <tr>
        <td> evaluate </td>
        <td> Object </td>
        <td>
      <pre>
{
    name: 'script',
    open: '&lt;script&gt;',
    close: '&lt;/script&gt;'
}
     </pre>
        </td>
        <td>
            Служебный тег для промежуточного преобразования во время компиляции в который преобразовуеться javascript код в ваших шаблонах, расположеный внутри <i>evaluate</i> regular expression. Вы можете использовать данные теги вместо evaluate expressions.
        </td>
    </tr>
    <tr>
        <td> accessory </td>
        <td> Object </td>
        <td>
      	<pre>
{
    open: '{%',
    close: '%}'
}
      	</pre>
</td>
        <td> Служебные префикс и суффикс указывающие на начало и конец вычисляемого значения в шаблоне, и используемые для промежуточного преобразования во время компиляции в который преобразовуеться выражения <i>interpolate</i> и <i>escape</i> из шаблона. Так же как и служебный тег настроенный в <i>evaluate</i>, вы можете использовать их на прямую. 
        <br><br>
        <i><b>Следует учитывать что служебные теги и префиксы имеют ограничения на синтаксис и разрешенные знаки, поэтому их прямое переопределение крайне не рекомендуеться - используйте настройки `template` для изменения </b></i>
        </td>
    </tr>
    <tr>
        <td> emptyString </td>
        <td> Boolean </td>
        <td><b>true</b></td>
        <td> Description </td>
    </tr>
    <tr>
        <td> staticKey </td>
        <td> String </td>
        <td> 'key' </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> staticArray </td>
        <td> String </td>
        <td> 'static-array' </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> nonStaticAttributes </td>
        <td> String Array </td>
        <td> ['id', 'name'] </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> textSaveTags </td>
        <td> String Array </td>
        <td> ['pre', 'code'] </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> voidRequireTags </td>
        <td> String Array </td>
        <td>
            ['input', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']
        </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> debug </td>
        <td> Boolean
        </td>
        <td><b>false</b>
        </td>
        <td> Description </td>
    </tr>
    <tr>
        <th colspan="4"> Передача данных </th>
    </tr>
    <tr>
        <td> parameterName </td>
        <td> String </td>
        <td> 'data' </td>
        <td>
            Задает имя объекта с данными передаваемыми в функцию-темплейт: <br/>
            <pre>RAD.template('&lt;h1&gt;Hello &lt;%= data.name %&gt;!&lt;/h1&gt;')</pre>
        </td>
    </tr>
    <tr>
        <td> renderContentFnName </td>
        <td> String </td>
        <td> 'content' </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> parentParameterName </td>
        <td> String </td>
        <td> 'parent' </td>
        <td> Description </td>
    </tr>
    <tr>
        <th colspan="4"> Форматирование текста </th>
    </tr>
    <tr>
        <td> BREAK_LINE </td>
        <td> Regular Expression </td>
        <td> /(\r\n|\n|\r)\s{0,}/gm </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> escape </td>
        <td> Regular Expression </td>
        <td> /(&amp;amp;|&amp;lt;|&amp;gt;|&amp;quot;)/g </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> MAP </td>
        <td> Object </td>
        <td>
       	<pre>
{
    '&amp;amp;': '&amp;',
    '&amp;lt;': '&lt;',
    '&amp;gt;': '&gt;',
    '&amp;quot;': '&quot;'
}
      		</pre>
        </td>
        <td> Description </td>
    </tr>

    <tr>
        <th colspan="4"> Компоненты </th>
    </tr>
    <tr>
        <td> components </td>
        <td> Object </td>
        <td> <b>null</b> </td>
        <td>Определяет локальные компоненты.
            <br>
            <br>
            RAD.js позволяет создавать реюзабельные компоненты которые дуступны внутри шаблонов посредством кастомных тегов. В качестве компонента может выступать как простая функция так и View.
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

> Обратите внимание, что переданные во время компиляции опции остаються установленными и для последующих вызовов функции компиляции, поэтому в случае установки кастомных параметров не для всего проекта, после компиляции Вам необъодимо будет вернуть параметры по умолчанию
 
## Two Type of Function

## Работа со стороними бидиотеками

## Кастомный рендеринг


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