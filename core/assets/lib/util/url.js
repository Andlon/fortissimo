.pragma library

function combineToParameterList(parameters) {
    return Object.keys(parameters).map( function(key) {
        var value = parameters[key]
        if (Array.isArray(value)) {
            return value.map( function(subvalue) {
              return encodeURIComponent(key) + '=' + encodeURIComponent(subvalue)
            }).join('&')
        }
        else {
            return encodeURIComponent(key) + '=' + encodeURIComponent(value)
        }
    }).join('&');
}

function createHttpUrl(host, resource, query) {
    var queryString = combineToParameterList(query)
    queryString = queryString.length > 0 ? '?' + queryString : ''

    return [ 'http',
             '://',
             host,
             resource,
             queryString
            ].join('');
}
