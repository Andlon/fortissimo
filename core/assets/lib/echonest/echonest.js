.pragma library
.import "../util/url.js" as URL
.import "../util/util.js" as Util

var ECHONEST_HOST = 'developer.echonest.com'

// Makes a request to EchoNest's servers.
function makeEchonestRequest(apiKey, resource, parameters, successCallback) {
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

function createDynamicPlaylist(apiKey, parameters, callback) {
    makeEchonestRequest(apiKey, '/api/v4/playlist/dynamic/create', parameters, function(obj) {
        var sessionId = Util.valueOfPath('response.session_id', obj)
        callback(sessionId)
    })
}

function requestNextInDynamicPlaylist(apiKey, parameters, callback) {
    makeEchonestRequest(apiKey, '/api/v4/playlist/dynamic/next', parameters, function(obj) {
        console.log(JSON.stringify(obj))
        var songs = Util.valueOfPath('response.songs', obj)
        if (songs && songs.length > 0) {
            var tracks = Util.valueOfPath('tracks', songs[0])
            if (tracks && tracks.length > 0) {
                var trackid = Util.valueOfPath('foreign_id', tracks[0])
                callback(trackid)
                return
            }
        }
        console.error('Something went wrong when requesting next song in dynamic playlist. Response from server: ' + JSON.stringify(obj))
    })
}
