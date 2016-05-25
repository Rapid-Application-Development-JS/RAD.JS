# Dependency Injection and Nested View

Одной из основных проблем **Backbone.js** являеться создание layout'ов из `view`, например использование `view` внутри другой `view`. Именно по этой причине появилось множество библиотек которые дополняют **Backbone.js** для решения данно проблемы.

Например всем известные [Marionette](http://marionettejs.com/) или [Chaplinjs](http://chaplinjs.org/).

Проблема состоит в том что эти фреймверки/библиотеки вводят новые абстракции, и новые логические слои, а в этом нет абсолютно никакой необходимости.

Давайте попробуем решить эту проблему по другому, к примеру, было бы намного проще если бы мы могли указывать наши `view` непосредственно в шаблоне, как часть разметки, а их **properties** указывать просто как атрибуты:

```ejs
<div>
	<p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
		Donec mattis, turpis congue finibus suscipit, massa est convallis massa,
		ut fermentum tellus neque vitae orci.
	</p>
	<::RAD_View my-props="<%= ... %>" data="<%= data.forView%>"/>
</div>
```

Такой подход решил бы множество проблем: 

* проблемы с nested view
* проблему layout'инга
* проблему передачи данных из родительских компонент в дочерние
* и, наконец, позволило бы сделать легкий и прозрачный Dependency Injection для `view`

**RAD.js** решает данную проблему именно таким способом.

> **На самом деле основным эффектом от такого типа `Dependency Injection` являеться возможность использования компонентной архитектуры при разработке приложения на `Backbone.js`**

Попробуем и мы сделать [пример пример из предидущего раздела](DOM.md) более читабильным.

## View

Для этого разделим шаблон из предидущего примера на две независимые функциональные части:

* кнопка которая подсчитывает количество кликов
* greetings widget, состоящий из поля ввода и заголовка связаного с ним.

Все правильно, эти две функциональности абсолютно не связанны друг с другом, и логично бы было разнести их в разные модули.

### javascript

Что бы не превращать проект в кашу создадим директорию `source` в которую будем складывать все исходные файлы. И вложенные папки: `source/views/greetings`, `source/views/counter` и `source/views/main`. Что бы расположить исходный код наших `view`

В каждой из папок создадим `index.js` и `template.ejs` для каждой из наших компонент соответственно. Кроме пожалуй папки `counter`, отдельный файл шаблона в ней просто не нужен.

Разнесите логику и шаблоны `counter` и `greetings` виджетов по своим папкам самотоятельно там нет абсолютно ничего нового, что бы не обсуждалось в прошлом разделе.

Поэтому просто приведем их листинги.

`source/views/greetings/index.js`:

```javascript
import {View} from 'RAD.js';

class Greetings extends View {
    template = require('./template.ejs');

    events = {
        'input input': 'nameChange'
    };
    
    getTemplateData(){
        return this.props.toJSON();
    }

    nameChange() {
        let name = this.refs.my_input.value;
        this.props.set('name', name);
    }
}

module.exports = Greetings;
```

`source/views/counter/index.js`:

```javascript
import {View, template} from 'RAD.js';

class Counter extends View {

    template = template('<button>Clicks:<%= this.props.get("amount") %></button>');

    events = {
        'click button': 'click'
    };

    click() {
        let amount = this.props.get('amount');
        this.props.set('amount', amount + 1);
    }
}

module.exports = Counter;
```

`source/views/main/index.js`:

```javascript
import {View} from 'RAD.js';

class Main extends View {
    template = require('./template.ejs');
}

export default Main
```

А `index.js` приобрел теперь совсем простой вид:

```javascript
"use strict";
import {publish} from 'RAD.js'
import MainView from './source/views/main'

publish('navigation.show', {
    container: '#screen',
    content: MainView
});
``` 
**На что обратить внимание:**

* так как иньекция происходит через функцию `require` по спецификации CommonJS, которую **webpack** подменяет своим аналогом внутри сбилдженого бандла, то и экспорт модулей, которые инъектируються, должен быть произведен через `module.exports = ... ;`. Для того чтобы **webpack** смог совместить эти да события.

> Использование экспорта из спецификации *ES6* для импорта(*dependency injection*) `view` в данный момент не представляеться возможным так как компиляцию *ES6* производит **babel**.

### template.ejs

Шаблоны `greetings` и `counter` не несут в себе новой функициональности, поэтому приводить мы их не будем.

Вся новая функциональность сосредоточена в шаблоне `main` вью, в который мы вставляем наши выделенные модули.

Не углубляясь в документацию по [`Dependency Injection`](../basics/Injection.md) так как это **quick start**, мы приведем `./source/views/main\template.ejs` полностью:

```ejs
<%
var Counter = require('../counter');
var Greetings = require('../greetings');
%>
<::Counter amount="<%= 0 %>" />
<::Greetings name="World" />
```

**Проще некуда:** Все что вам необхдимо это экспортировать с помощью `require` необходимую Вам `view` и с помощью префекса `::` вставить ее в шаблон. Все атрибуты полученного кастомного тега автоматически станут properties вашей импортированной `view`.

**На что обратить внимание:**

* так же как и в предидущем пункте на то как именно Вы экспортируете и импортируете модули.
* в качестве значения атрибута `amount` мы использовали запись: `"<%= 0 %>"`, что бы `0` передавался как число, а не строка.

*Основополагающей идеей, данного подхода являеться необходимость использования `view` как элементов шаблона Вашей`view`, что в несколько раз упрощает разработку.*

> На самом деле, `Dependency Injection` в шаблоны не ограничиваеться только `view`, оно основано на иньекции функций, поэтому и чистые функции и компоненты на них основанные, тоже легко иньектируються в шаблоны. Об этом более подробно в [документации]((../basics/Injection.md)).

## Source

Исходники нашего проекта можно получить по следующей [ссылке](source/3.zip).

## Что дальше?

Рассмотрев основные отличия от **Backbone.js**, Вы можете перейти непосредственно к [обучающим материалам](../tutorial/Tutorial.md), которые продемонстрируют разработку более сложного приложения и покажут возможность использования сторонних библиотек.