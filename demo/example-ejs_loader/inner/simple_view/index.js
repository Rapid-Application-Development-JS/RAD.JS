import {View} from 'RAD';

class SimpleView extends View {
    template = require('./template.ejs');
    className = 'box';
}

module.exports = SimpleView;
