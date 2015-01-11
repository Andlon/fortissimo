.import "../config/credentials.js" as Credentials
.import "echonest/echonest.js" as EchoNest
.import 'util/util.js' as Util
.import 'bmwcar/bmwcar.js' as BMW
.import 'util/stat.js' as Stat

// Holds EchoNest session ID
var sessionId = null

// Desired energy for Echonest steering
var desiredEnergy = 0.55
var desiredEnergyRange = [0.40, 0.65]

// Sampled BMW Car data
var samples = []
var sampleTimerId = null

// Constants
var DELTA_THRESHOLD = 10000
var INTENSITY_THRESHOLD = 0.0225

function initialize() {
    session.login(Credentials.spotifyUsername, Credentials.spotifyPassword)

    if (settings.profileId === "") {
        createTasteProfile();
    } else {
        createDynamicPlaylist()
    }
}

function calculateAcceleration(data) {
    if (data.length < 2)
        return []

    var accelerationData = new Array(data.length - 1)
    for (var i = 0; i < data.length - 1; ++i) {
        var dv = data[i + 1][0] - data[i][0]
        var dt = data[i + 1][1] - data[i][1]
        accelerationData[i] = Math.abs(dv / dt)
    }

    return accelerationData
}

function determineDesiredEnergy(accelerationData, speed) {
    // Use standard deviation of acceleration as a measure of intensity of driving
    var s = Stat.stddev(accelerationData)

    var deltaThreshold = s - INTENSITY_THRESHOLD
    if (deltaThreshold > 0) {
        // High intensity drive
        var desiredEnergy = 0.5 - Math.min(deltaThreshold / (2 * INTENSITY_THRESHOLD), 0.5)
        return [ desiredEnergy, desiredEnergy - 0.1, desiredEnergy + 0.1 ]
    } else {
        if (speed < 5) {
            // In traffic or similar, bump up energy
            return [ Stat.seminormal(0.70, 0.1), 0.55, 0.85 ]
        } else {
            return [ Stat.seminormal(0.55, 0.1), 0.35, 0.70 ]
        }
    }
}

function analyzeDriving(speed) {
    var accelerationData = calculateAcceleration(samples)
    var energy = determineDesiredEnergy(accelerationData, speed)
    var lower = energy[1]
    var upper = energy[2]

    // Update values that will be sent to EchoNest on next steer
    desiredEnergy = energy[0]
    desiredEnergyRange = [lower, upper]
}

function steer() {
    EchoNest.steerDynamicPlaylist(Credentials.echonestApiKey,
                                  { 'session_id': sessionId, 'min_energy': desiredEnergyRange[0],
                                  'max_energy': desiredEnergyRange[1], 'target_energy': desiredEnergy })
}

function sample() {
    BMW.sampleVehicleSpeed(Credentials.mojioApiToken, Credentials.carId, function (speed, datetime) {
        var speedMps = speed / 3.6
        var current = datetime.getTime()
        if (samples.length > 0) {
            var latest = samples[samples.length - 1][1]
            var oldest = samples[0][1]
            var delta = current - oldest
            if (delta > DELTA_THRESHOLD) samples.shift()
        }

        // Only push samples if new information is available
        if (samples.length == 0 || latest !== current) {
            samples.push([speedMps, current])
            analyzeDriving(speedMps)
        }
    })
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
