import {View} from 'RAD'
import Popup from './popup'

function factory(option) {
    console.log('factory:',option);
    if (option['dialog-content'] && option['dialog-content'].content instanceof View) {
        return option['dialog-content'].content
    }

    // create standard type of view
    return new Popup(option);
}

export default factory