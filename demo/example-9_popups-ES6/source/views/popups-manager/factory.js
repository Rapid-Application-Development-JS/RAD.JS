import {View} from 'RAD'
import Popup from './popup'

function factory(option) {
    if (option['popup-content'] && option['popup-content'].content instanceof View) {
        return option['popup-content'].content
    }

    // create standard type of view
    return new Popup(option);
}

/* Be careful! You must export the modules to the template by CommonJS format.
 * In current case, you should have a pure function in the template.
 */
module.exports = factory;