(function(){

    var splitSpaces = /\S+/g;
    var camelArgs = [/-([a-z])/g, function(match, letter){ return letter.toUpperCase() }];
    var defaultButtons = ['bold', 'italic', 'underline', 'anchor', 'h3', 'unorderedlist', 'orderedlist'];

    function initialize(node){
        if (node.xtag.editor) node.xtag.editor.destroy();
        node.xtag.editor = new MediumEditor(node, xtag.merge({
            spellcheck: node.spellcheck,
            toolbar:{
                buttons: node.xtag.buttons || defaultButtons
            }
        }, node.xtag.options || {}));
    }

    xtag.register('x-medium-editor', {
        lifecycle: {
            created: function() {
                initialize(this);
            }
        },
        accessors: {
            spellcheck: {
                attribute: { boolean: true }
            },
            buttons: {
                attribute: {},
                set: function(val){
                    this.xtag.buttons = val.trim().split(splitSpaces);
                }
            },
            options: {
                attribute: {},
                set: function(val){
                    var options = this.xtag.options = {};
                    val.replace(splitSpaces, function (match){
                        options[match.replace.apply(match, camelArgs)] = true;
                    });
                }
            },
            value: {
                get: function(){
                    return this.innerHTML;
                },
                set: function(val){
                    this.xtag.editor.setContent(val);
                }
            }
        },
        events: {
            focus: function(){
                this.xtag.state = this.value;
            },
            blur: function(){
                if (this.xtag.state != this.value) xtag.fireEvent(this, 'change');
                this.xtag.state = null;
            }
        }
    });

})();
