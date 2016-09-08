# Components

> Данная часть являеться расширенным обяснением дополнительных возможностей использования [Dependency Injection](Injection.md) рассмотреной в предидущей части.

И так, как было обещано ранее, мы попытаемся упростить немного код нашего последнего альтернативного варианта, воспользовавшить тем что префикс позднего связывания `::` работает с чистыми функциями.

Но в начале давайте глянем на одно из наших `view`:

```javascript
class Counter extends View {
    template = template(`<button>Clicks:<%= this.data.count %></button>`);

    events = {
        'click button': 'onClick'
    };

    initialize(options) {
        this.data = options.data;
    }

    onClick() {
        this.data.count += 1;
        this.render();
    }
}
```

Фактически у нас нет логики в данном `view`, мало того, у нас даже нет его состояния, и как раз для таких случаев более экономно было бы использовать не `view`, а `component` которые являються stateless функциями.

Если обратиться к документации по [Components](../guide/Components.md) и [Dependency Injection](../basics/Injection.md) то можно увидеть что надпись:

 ```html
 <::functionName attr1="..." attr2="...">
 	<content/>
 </::functionName>
 ```
что данная надпись представляет следующий вызов функции `functionName(data, contentRenderFn);` в момент рендеринга шаблона, не в момент его компиляции. Где параметр `data` представляет собой все атрибуты(`attr1`, `attr2`) вызова собраные в объект данных с именами свойств равных именам атрибута и значениями соответственно, а `contentRenderFn` представляет собой шаблонную функцию для рендеринга контента(`<content/>`), вызываемую в необходимом вам месте следующим образом: `contentRenderFn();` непосредственно внутри вашей функции.

В нашем случае нас интересует только первый параметр `data` с помошью которого передаються данные в функцию компонент, в дальнейшем мы просто используем синтаксис ES6 object to arguments destruction.

Запишем необходимый нам функционал как функцию которая рендерит шаблон и не имеет собственного состояния:

```javascript
// template compiling
var counterTemplateFn = template(`<button ref="button">Clicks: <%= data %></button>`);

function counterFn({count, callback}) {
    // template rendering
    var refs = counterTemplateFn(count);

    // attach onclick callback fn
    refs.button.onclick = ()=> {
        callback(count+1);
    };
}
```

Давайте разберемся что тут происходит:

1. Мы компилируем строку шаблона нашего компонента в *incremental-dom* функцию: `counterTemplateFn`
2. Затем создаем функцию `counterFn` при вызове которой мы будем рендерить полученую функцию-шаблон.
3. `counterFn` после рендеринга возвращает объект содержащий прямые ссылки на DOM элементы, котрые мы в следующем шаге используем для добавления обработчика на `onclick`
4. вызываем `callback` функцию что бы вернуть значение прирощенное на 1

> Зачем нам `callback`? Дело в том, что как мы уже писале ранее, желательно что бы компоненты были stateless, поэтому состояние должно храниться в родительской `view`.

Для использования нашего компонента нам необходимо слегка изменить вызов, для того чтобы передать `callback`:

`<::this.inner.Counter count="<%= this.data.count %>" callback="<%= this.counterCallback %>" />`

Поэтому полный листинг будет выглядеть следующим образом:

```javascript
import {View, publish, template} from 'RAD.js'

// template compiling
var counterTemplateFn = template(`<button ref="button">Clicks: <%= data %></button>`);

function counterFn({count, callback}) {
    // template rendering
    var refs = counterTemplateFn(count);

    // attach onclick callback fn
    refs.button.onclick = ()=> {
        callback(count+1);
    };
}

class Greetings extends View {
    template = template(`
        <h1><%= 'Hello, ' + this.data.name + '!' %></h1>
        <div>
            <input type="text" value="<%= this.data.name %>"/>
        </div>`);

    events = {
        'input input': 'onInput'
    };

    initialize(options) {
        this.data = options.data;
    }

    onInput(e) {
        this.data.name = e.target.value;
        this.render();
    }
}

class WelcomePage extends View {
    template = template(`
        <::this.components.Greetings data="<%= this.data %>" />
        <::this.components.Counter count="<%= this.data.count %>" callback="<%= this.counterCallback %>" />`);

    components = {
        Greetings: Greetings,
        Counter: counterFn
    };

    data = {
        name: 'World',
        count: 0
    };

    counterCallback = (value)=> {
        this.data.count = value;
        this.render();
    }
}

new WelcomePage({el: '#screen'}).render();
```

Как видно использование чистых функций не отличаеться от использования `view` внутри шаблонов.



--- 

Рассмотрев основные отличия от **Backbone.js**, Вы можете перейти непосредственно к [обучающим материалам](../tutorial/Tutorial.md), которые продемонстрируют разработку более сложного приложения и покажут возможность использования сторонних библиотек.