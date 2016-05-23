"use strict";
import {View, publish, template} from 'RAD';

let htmlStr = 'Text text text&#160;<a href="http://www.example">example</a>';

class Page extends View {

    template = template(document.getElementById('hello-page').innerHTML);

    htmlInjection = template(htmlStr);

}

publish('navigation.show', {
    container: '#screen',
    content: Page
});