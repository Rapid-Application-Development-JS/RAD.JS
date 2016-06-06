# Menu Component & View Switching

## View Switching


## Menu

В прошлой части нам мы оставили без функциональности наш `menu component`, теперь мы исправим данную не доработку.

### template.js

И начнем мы с шаблона нашего компонента:

```ejs
<div ref="container" class="btn-group" role="group">
    <% for (var i = 0; i < data.array.length; i++) { %>
    <button type="button" class="<%= 'btn btn-info' + (data.active === i ? ' active' : '') %>" data-target>
        <%= data.array[i] %>
    </button>
    <% } %>
</div>
```

Если вы посмотрите на шаблон меню, Вы не увидете ничего нового по сравнению с **Bootstrap** версткой в которую добалена логика добавления такого кол-ва кнопок, которое соответствует размеру переданного массива заголовков кнопок.

### index.js

```javascript
let templateFn = require('./template.ejs');
function menu(data, content) {
    let container = templateFn(data, content).container;
    
    container.onclick = function (e) {
        
    };
}

export default menu;
```

Как мы упоминали в прошлой части *dependency injection* components основано на инъекции чистой функции в шаблонную функцию.

На основании этого, мы будем использовать в качестве чистую функцию которая будет выступать декоратором 

 > Обратите внимание что в отличии от того же **React.js** у вас есть возможность писать и интегрировать чистые шаблонные функции, не только как js но и ejs