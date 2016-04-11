"use strict";
import {View, publish, template, utils} from 'RAD';

let html = `Text text text&#160;<a href="http://www.example">example</a> `;

class WelcomePage extends View {

    template = template(document.getElementById('hello-page').innerHTML);

    htmlInjection = template.compileHelper(html);

}

publish('navigation.show', {
    container: '#screen',
    content: WelcomePage
});