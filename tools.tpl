window.RAD = require('./prebuild');
window.RAD.init();
var blanks = [];

<% for (var i in arr) { %>

var <%- i %> = require('../<%- arr[i].file %>');
blanks.push(<%- i %>);

<% } %>

for (var i = 0; i < blanks.length; i++) {
	RAD[blanks[i].type](blanks[i].namespace, blanks[i].module);
}