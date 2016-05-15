var iDOM = RAD.utils.IncrementalDOM;
var elementOpen = iDOM.elementOpen;
var elementClose = iDOM.elementClose;
var skip = iDOM.skip;

// Be careful, component was developed to work only with static content

module.exports = function (data, renderContent) {
    var block = elementOpen('pre');
    if (!block.immutable) {
        elementOpen('code', null, ['class', data.type]);

        // render content
        renderContent();

        elementClose('code');
        elementClose('pre');

        // highlight the code
        hljs.highlightBlock(block);

        // marker for skipping future component update
        block.immutable = true;
    } else {
        skip();
        elementClose('pre');
    }
};