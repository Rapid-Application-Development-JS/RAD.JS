"use strict";
import {View} from 'RAD'

class Page extends View {

    tagName() {
        return 'section';
    }

    template = require('./template.ejs');
}

export default Page