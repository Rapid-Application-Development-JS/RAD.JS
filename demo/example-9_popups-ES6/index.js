"use strict";
import {publish, template} from 'RAD'
import {COMMAND, POPUP_CHANEL} from './source/constants'
import {Page, PopupManager, CustomPopup} from './source/views'

/* one way of placing 'Page' to the #screen container */
var page = new Page({
    el: '#screen'
});
page.render();

/*  one way of placing the 'Popup Manager' into #modal container */
publish('navigation.show', {
    container: '#modals',
    content: PopupManager
});

// show First Dialog
publish(POPUP_CHANEL, {
    id: 'id_1',
    dialogContent: {
        content: 'First Dialog (pls wait 5 sec)'
    },
    command: COMMAND.open
});

// show Second Dialog over First
publish(POPUP_CHANEL, {
    id: 'id_2',
    dialogContent: {
        content: template('<span style="color: orange">Custom template</span>')
    },
    command: COMMAND.open
});

publish(POPUP_CHANEL, {
    id: 'id_3',
    dialogContent: {
        content: new CustomPopup()
    },
    command: COMMAND.open
});

// close first dialog
setTimeout(()=> {
    publish(POPUP_CHANEL, {
        id: 'id_2',
        command: COMMAND.close
    });
}, 5000);

// close second dialog
setTimeout(()=> {
    publish(POPUP_CHANEL, {
        id: 'id_1',
        command: COMMAND.close
    });
}, 10000);

// close second dialog
setTimeout(()=> {
    publish(POPUP_CHANEL, {
        id: 'id_3',
        command: COMMAND.close
    });
}, 2500);