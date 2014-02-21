function addVendorPrefix(property) {
    var arr = ["ms", "Ms", "moz", "Moz", "webkit", "Webkit", "o", "O"], i, tmp = document.createElement("div"),
        result = null, arrayOfPrefixes = [];

    function capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    for (i = 0; i < arr.length; i += 1) {
        arrayOfPrefixes.push(arr[i] + capitalise(property));
    }

    arrayOfPrefixes.push(property);

    for (i = 0; i < arrayOfPrefixes.length; i += 1) {
        if (tmp.style[arrayOfPrefixes[i]] !== undefined) {
            result = arrayOfPrefixes[i];
            break;
        }
    }
    return result;
}