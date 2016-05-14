"use strict";
import {publish} from 'RAD'
import {Page, PopupManager} from './source/views'

publish('navigation.show', {
    container: '#screen',
    content: Page
});

publish('navigation.show', {
    container: '#modals',
    content: PopupManager
});