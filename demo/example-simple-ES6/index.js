"use strict";
import {View, publish, template} from 'RAD';

class WelcomePage extends View {

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

/*
 * =============================================
 * one of way for dialog manager implementation
 * =============================================
 */

const COMMAND = {
    open: 'open',
    close: 'close'
};

const CHANEL = 'dialogManager';

// dynamic dialog class
class Dialog extends View {
    className = 'modal-overlay';
    template = template(
        `<div class="modal-frame">
            <% var content = this.props.get("dialog-content").content;
               if (typeof content === 'function') { 
                    content(data);
                } else { %>
                <%= this.props.get("dialog-content").content %>
            <% } %>
        </div>`);
}

// modals manager
class DialogManager extends View {
    template = template(
        `<% for (var viewID in this.props.toJSON()) { %>
                <Dialog key="<%= viewID %>" dialog-content="<%= this.props.get(viewID) %>" />
         <% } %>`,
        { // place component classes for dynamic representation
            components: {
                Dialog: Dialog
            }
        });

    attributes = {
        style: {
            display: 'none',
            background: 'none'
        }
    };

    getID() {
        return CHANEL;
    }
    
    display(type){
        if (this.props.keys().length === 0) {
            this.el.style.display = type;
        }
    }

    onReceiveMsg(data) {
        if (data)
            switch (data.command) {
                case COMMAND.open:
                    this.display('block');
                    this.props.set(data.id, data.dialogContent);
                    break;
                case COMMAND.close:
                    this.props.unset(data.id);
                    this.display('none');
                    break;
            }
    }
}

//place the Dialog Manager into #modal container
publish('navigation.show', {
    container: '#modals',
    content: DialogManager
});

// show First Dialog
publish(CHANEL, {
    id: 'id_1',
    dialogContent: {
        content: 'First Dialog (pls wait 5 sec)'
    },
    command: COMMAND.open
});

// show Second Dialog over First
publish(CHANEL, {
    id: 'id_2',
    dialogContent: {
        content: template('<span style="color: red">Custom template</span>')
    },
    command: COMMAND.open
});

// close first dialog
setTimeout(()=> {
    publish(CHANEL, {
        id: 'id_2',
        command: COMMAND.close
    });
}, 5000);

// close second dialog
setTimeout(()=> {
    publish(CHANEL, {
        id: 'id_1',
        command: COMMAND.close
    });
}, 10000);