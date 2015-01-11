.pragma library

function createHttpUrl(host, resource, query) {
    var queryString = Object.keys(query).map( function(key) {
        var value = query[key]
        if (Array.isArray(value)) {
            return value.map( function(subvalue) {
              return encodeURIComponent(key) + '=' + encodeURIComponent(subvalue)
            }).join('&')
        }
        else {
            return encodeURIComponent(key) + '=' + encodeURIComponent(value)
        }
    }).join('&');
    queryString = queryString.length > 0 ? '?' + queryString : ''

    return [ 'http',
             '://',
             host,
             resource,
             queryString
            ].join('');
}
