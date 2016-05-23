import {View} from 'RAD'
import {COMMAND, POPUP_CHANEL} from '../../../constants'

class Popup extends View {
    template = require('./template.ejs');
    
    className = 'modal-overlay';
    
    events = {
        'click .js-close' : 'close'
    };
    
    close() {
        let target = this.props.get('popup-id');
        this.publish(POPUP_CHANEL, {
            id: target,
            command: COMMAND.close
        });
    }
}

export default Popup