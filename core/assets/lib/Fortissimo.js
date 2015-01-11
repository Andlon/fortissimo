.import "../config/credentials.js" as Credentials
.import "echonest/echonest.js" as EchoNest
.import 'util/util.js' as Util

// Holds EchoNest session ID
var sessionId = null

function initialize() {
    session.login(Credentials.spotifyUsername, Credentials.spotifyPassword)


    EchoNest.createDynamicPlaylist(Credentials.echonestApiKey, { "artist": "Coldplay", 'bucket': [ 'id:spotify', 'tracks'], 'limit': 'true' }, function(id) {
        sessionId = id
    });
}

function nextTrack() {
    if (sessionId !== null) {
        EchoNest.requestNextInDynamicPlaylist(Credentials.echonestApiKey, { "session_id": sessionId }, function(track) {
            console.log('New track: ' + track)
            player.play(track)
        });
    }
}
