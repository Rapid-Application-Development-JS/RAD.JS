import {View} from 'RAD'
import {COMMAND, POPUP_CHANEL} from '../../constants'

const DELAY = 1000;

class CustomPopup extends View {
    template = require('./template.ejs');

    className = 'modal-overlay';
    
    onAttach() {
        this.timeoutID = setTimeout(this.tick, DELAY);
    }

    tick = () => {
        this.timeoutID = setTimeout(this.tick, DELAY);
        
        let time = this.props.get('timeout');
        if (time <= 0) {
            this.close();
        }
        this.props.set('timeout', time - DELAY);
    };

    close() {
        clearTimeout(this.timeoutID);
        
        let target = this.props.get('popup-id');
        this.publish(POPUP_CHANEL, {
            id: target,
            command: COMMAND.close
        });
    }
}

export default CustomPopup