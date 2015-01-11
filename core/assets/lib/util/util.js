.pragma library

// Courtesy of falafel @ IRC Freenode, #javascript
function valueOfPath(path, obj) {
  return path.split('.').reduce(function(acc, x) {
    if (acc === null)
      return
    return acc[x]
  },obj)
}

Object.extend = function(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
};
