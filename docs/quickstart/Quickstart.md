# Quick Start

## Создание проекта

### Генерируем `package.json` и устанавливаем зависимости

Вводим команду для генерации указанного файла:

```bash
npm init
``` 
и отвечаем на все указанные вопросы, и получаем сгенерированный файл.

Для дальнейшей работы нам понадобяться следующие зависимости, прописанные в `package.json`:

```json
{
  "name": "tour_of_heroes",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "webpack",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "MIT",
  "dependencies": {
    "RAD.js": "^2.0.2"
  },
  "devDependencies": {
    "babel-core": "^6.9.0",
    "babel-loader": "^6.2.4",
    "babel-plugin-transform-class-properties": "^6.9.0",
    "babel-preset-es2015": "^6.9.0",
    "itemplate-loader": "^0.1.3",
    "webpack": "^1.13.1",
    "webpack-dev-server": "^1.14.1"
  }
}
```

устанавливаем эти зависимости с помошью 

```bash
npm i
```

### webpack

В качестве сборщика для проекта мы будем использовать, как вы уже увидели из `package.js` **webpack**. Поэтому для упрощения мы просто приведем `webpack.config.js`:

```javascript
var webpack = require("webpack");

module.exports = {
    entry: "./index.js",
    output: {
        path: __dirname + '/build',
        filename: "app.min.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-class-properties']
                }
            },
            {
                test: /\.ejs$/,
                exclude: /node_modules/,
                loader: 'itemplate-loader'
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({output: {comments: false}})
    ]
};
```

> Обратите внимание что в качестве компилятора *ES6* мы используем **Babel.js**, а в качестве лоадера для `*.ejs` шаблонов - **itemplate-loader**. И хотя вы можете использовать любую систему сборки или компиллер для *ES6*, в качестве примера мы приводим указанные так как их использование упрощает разработку и сокращает количество написанного кода.

> *ES6* в примерах мы использовали по тойже причине.

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <meta name="format-detection" content="telephone=no">

    <title>Tour of Heroes</title>

</head>
<body>
    <div id="screen"></div>
    <script type="text/javascript" src="build/app.min.js"></script>
</body>
</html>
```

Начала мы просто выведем стандартную надпись *Hello, World!*

Для этого в файле `index.js` создадим класс `WelcomePage` расширив `RAD.View` следующим образом:

```javascript
"use strict";
import {View, publish, template} from 'RAD.js';

class WelcomePage extends View {
    template = template('Hello, World!');
}

// place view to DOM container via navigator plugin
publish('navigation.show', {
    container: '#screen',
    content: WelcomePage
});
```

Теперь выполнив команду: `npm run build` или `webpack`, вы можете запустить ваш пример и увидеть **Hello, World!** на экране.

Что происходит в данном примере:

* экспорт [`View`](../API.md#view), [`publish`](../API.md#dispatcher_publish) и [`template`](../API.md#template): как класс для наследования, метод рассылки сообщений и компилятор шаблонов, соответственно
* описываем класс. Обратите внимание что свойство `template` класса должно содержать откомпилированную шаблонную функцию.
* и наконец, публикуем нашу View в DOM по указанному css селектору с помощью команды для плагина навигатор.

> <a name="standart"></a> Мы могли бы воспользоваться и стандартной техникой **Backbone.js**:
> 
>```javascript
>let page = new WelcomePage({
	...
    el: '#screen'
});
page.render();
>```
>Указать css селектор элемента который будет использоваться в качестве основного для данного `view`. Но, в этом случае нам бы понадобилось бы в будщем задавать биндинг `events` для `views` через функцию следующим образом:
>
>```javascript
>events() {
>	return {
>		...
>	}
>}
>```
>Связано это с `babel-plugin-transform-class-properties` плагином, какой вариант вас устраивает больше - решать вам.

## Source

Исходники нашего проекта можно получить по следующей [ссылке](source/1.zip).

## Что дальше

Замечательно у нас есть простейший проект, но из него совершенно не понятно что же именно отличает **RAD.js** от простого **Backbone.js**, для этого мы совсем коротко рассмотрим два основопологающих отичия:

* [Работа с DOM](DOM.md)
* [Dependency Injection and Nested View](Injection.md)