.import "../config/credentials.js" as Credentials
.import "echonest/echonest.js" as EchoNest
.import 'util/util.js' as Util

// Holds EchoNest session ID
var sessionId = null

function initialize() {
    session.login(Credentials.spotifyUsername, Credentials.spotifyPassword)

    if (settings.profileId === "") {
        createTasteProfile();
    } else {
        createDynamicPlaylist()
    }
}

function nextTrack() {
    if (sessionId !== null) {
        EchoNest.requestNextInDynamicPlaylist(Credentials.echonestApiKey, { "session_id": sessionId }, function(tracks) {
            var successfulPlay = false
            do {
                successfulPlay = player.play(tracks.pop())
            } while (tracks.length > 0 && !successfulPlay)

            if (!successfulPlay) {
                console.log("Re-requesting...")
                nextTrack();
            }
        });
    }
}

function updateTasteProfile() {
    var trackObjects = []

    library.trackList.forEach( function (track) {
        trackObjects.push({ 'item': { 'track_id': track }})
    })

    EchoNest.updateTasteProfile(Credentials.echonestApiKey, { 'id': settings.profileId, 'data': JSON.stringify(trackObjects) }, function () {
        createDynamicPlaylist()
    })
}

function createDynamicPlaylist() {
    EchoNest.createDynamicPlaylist(Credentials.echonestApiKey, { 'type': 'catalog', 'session_catalog': settings.profileId, 'seed_catalog': settings.profileId,
                                       'bucket': [ 'id:spotify', 'tracks'], 'limit': 'true' }, function(id) {
        sessionId = id
        nextTrack()
    });
}

function createTasteProfile() {
    EchoNest.createTasteProfile(Credentials.echonestApiKey, { 'type': 'general', 'name': 'hackthedrive' }, function (profileId) {
        settings.profileId = profileId

        // Update taste profile
        if (library.complete)
            updateTasteProfile()
        else {
            library.isCompleteChanged.connect(function () {
                if (library.complete) updateTasteProfile()
            })
        }
    })
}
