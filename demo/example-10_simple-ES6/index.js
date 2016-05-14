"use strict";
import {View, publish} from 'RAD';

class WelcomePage extends View {

    tagName() {
        return 'section';
    }

    /*
     * Unfortunately, you can not directly use a template in the properties of the class.
     * Instead, you must use the already compiled function.
     */
    template = require('./template.ejs');

    onAttach() {
        console.log('onAttach');
    }

    onRender() {
        console.log('onRender');
    }

    onDetach() {
        console.log('onDetach');
    }
}

publish('navigation.show', {
    container: '#screen',
    content: WelcomePage
});