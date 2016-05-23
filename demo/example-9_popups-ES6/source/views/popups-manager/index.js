import {View} from 'RAD'
import {COMMAND, POPUP_CHANEL} from '../../constants'

class PopupManager extends View {
    template = require('./tepmlate.ejs');

    attributes = {
        style: {
            display: 'none',
            background: 'none'
        }
    };

    getID() {
        return POPUP_CHANEL;
    }

    display(type) {
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

export default PopupManager
