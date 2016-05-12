function HOC(data, content) {
    console.log(data, content);
    content();
}

// you should use 'module.exports' for webpack loader exports
module.exports = HOC;