"use strict";
import {View, template} from 'RAD'
import {COMMAND, POPUP_CHANEL, POPUP_IDS} from '../../constants'
import CustomPopup from '../custom-popup'

const templateFn = template(`<div>
            <span>Custom template</span>
            <img src="http://lorempixel.com/200/80/" alt="dummy"/>
            </div>`);

const MAP = {
    first: {
        id: POPUP_IDS.first,
        getContent: function () {
            return 'Standard Popup';
        }
    },
    second: {
        id: POPUP_IDS.second,
        getContent: function () {
            return templateFn;
        }
    },
    third: {
        id: POPUP_IDS.third,
        getContent: function () {
            return new CustomPopup({
                'popup-id': POPUP_IDS.third, // for closing
                timeout: 5000
            });
        }
    }
};

class Page extends View {
    template = require('./template.ejs');

    events = {
        'click .js-popup': 'showPopup'
    };

    showPopup(e) {
        let button = e.target;
        let target = button.getAttribute('data-target');

        button.blur();
        this.publish(POPUP_CHANEL, {
            id: MAP[target].id,
            dialogContent: {
                content: MAP[target].getContent()
            },
            command: COMMAND.open
        });
    }
}

export default Page