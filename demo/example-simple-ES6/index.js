"use strict";
import { Base, publish, template } from 'RAD';

class WelcomePage extends Base.View {

    tagName() {
        return 'section';
    }

    /*
     * Unfortunately, you can not directly use a template in the properties of the class.
     * Instead, you must use the already compiled function.
     */
    template = template(document.getElementById('hello-page').innerHTML);

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