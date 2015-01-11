.pragma library
.import "../util/url.js" as URL
.import "../util/util.js" as Util

var ECHONEST_HOST = 'developer.echonest.com'

// Makes a request to EchoNest's servers.
function makeEchonestGetRequest(apiKey, resource, parameters, successCallback) {
    parameters['api_key'] = apiKey;
    var url = URL.createHttpUrl(ECHONEST_HOST, resource, parameters);

    var request = new XMLHttpRequest;
    request.open("GET", url)
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status === 200) {
                successCallback(JSON.parse(request.responseText))
            } else {
                console.error('Resource ' + resource + ' not found. Response: \n' + request.responseText)
            }
        }
    }

    request.send()
}

function makeEchonestPostRequest(apiKey, resource, parameters, successCallback) {
    parameters['api_key'] = apiKey;
    var url = URL.createHttpUrl(ECHONEST_HOST, resource, {})

    var request = new XMLHttpRequest
    request.open("POST", url)
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Content-length", parameters.length);
    request.setRequestHeader("Connection", "close");
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                successCallback(JSON.parse(request.responseText))
            } else {
                console.error('Resource ' + resource + ' not found. Response: \n' + request.responseText)
            }
        }
    }

    request.send(URL.combineToParameterList(parameters))
}

function createDynamicPlaylist(apiKey, parameters, callback) {
    makeEchonestGetRequest(apiKey, '/api/v4/playlist/dynamic/create', parameters, function(obj) {
        var sessionId = Util.valueOfPath('response.session_id', obj)
        callback(sessionId)
    })
}

function requestNextInDynamicPlaylist(apiKey, parameters, callback) {
    makeEchonestGetRequest(apiKey, '/api/v4/playlist/dynamic/next', parameters, function(obj) {
        var songs = Util.valueOfPath('response.songs', obj)
        if (songs && songs.length > 0) {
            var tracks = Util.valueOfPath('tracks', songs[0])
            if (tracks && tracks.length > 0) {
                var trackIds = []
                tracks.forEach(function (track) {
                    trackIds.push(Util.valueOfPath('foreign_id', track))
                })
                callback(trackIds)
                return
            }
        }
        console.error('Something went wrong when requesting next song in dynamic playlist. Response from server: ' + JSON.stringify(obj))
    })
}

function updateTasteProfile(apiKey, parameters, callback) {
    makeEchonestPostRequest(apiKey, '/api/v4/tasteprofile/update', parameters, function(obj) {
        callback(Util.valueOfPath('response.ticket', obj))
    })
}

function createTasteProfile(apiKey, parameters, callback) {
    makeEchonestPostRequest(apiKey, '/api/v4/tasteprofile/create', parameters, function (obj) {
        callback(Util.valueOfPath('response.id', obj))
    })
}

function steerDynamicPlaylist(apiKey, parameters) {
    makeEchonestGetRequest(apiKey, '/api/v4/playlist/dynamic/steer', parameters, function (obj) {
        var code = Util.valueOfPath('response.status.code', obj)
        if (code === undefined || code !== 0) {
            console.error('Failed to steer playlist. Response: ' + JSON.stringify(obj))
        }
    })
}
