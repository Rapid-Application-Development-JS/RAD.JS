import {View} from 'RAD'

class CustomPopup extends View {
    className = 'modal-overlay';
    template = require('./template.ejs');
}

export default CustomPopup