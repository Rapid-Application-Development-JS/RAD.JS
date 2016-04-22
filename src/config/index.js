var Config = {
    // Specific RAD.js attributes to connect HTMLElement with its View
    Attributes: {
        ID: 'view-id',
        ROLE: 'data-role'
    },

    // List of BaseView parameters which can be applied by passing as an options.
    ViewOptions: ['key', 'propsModel', 'model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'],

    // Internal Events used to communicate with modules
    Events: {
        REGISTER: 'register',
        UNREGISTER: 'unregister',

        ATTACH: 'attach',
        DETACH: 'detach',

        NODE_ATTACHED: 'nodeAdded',
        NODE_REMOVED: 'nodeRemoved',

        PATCH_START: 'patchStart',
        PATCH_END:'patchEnd'
    }
};

module.exports = Config;