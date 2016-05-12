"use strict";
import {View, publish} from 'RAD';

class WelcomePage extends View {
    template = require('./template.ejs');
}

publish('navigation.show', {
    container: '#screen',
    content: WelcomePage
});