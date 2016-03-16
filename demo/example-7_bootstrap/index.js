"use strict";
import { View, publish, template } from 'RAD';

// require to load all components
require('./bootstrap-components');

class WelcomePage extends View {

    template = template(require('./template.ejs'));

    constructor() {
        super();
        setInterval(this.reRender, 500);
    }

    counter = 1;

    reRender = () => {
        this.counter += 1;
        this.render();
    };

    // dropdown functionality demo
    dropDownItems = ['Action', 'Another action', 'Something else here', null, 'Separated link'];

    onDropDownClick = (e, index, value)=> {
        console.log(this, 'onDropDownClick: ', e, index, value);
    };
}

publish('navigation.show', {
    container: '#screen',
    content: WelcomePage
});