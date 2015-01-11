import QtQuick 2.4
import Sonetta 0.1
import "../../lib/Fortissimo.js" as Fortissimo
import "../../lib/util/stat.js" as Stat

Rectangle {
    width: 100
    height: 62

    color: "#333355"

    FontLoader {
        id: robotoThin
        source: "Roboto-Thin-Modified.ttf"
    }

    Connections {
        target: session

        onLoggedIn: library.runScan()
        onLoginFailed: console.log("Login failed")
    }

    Rectangle {
        border.color: "#222222"
        border.width: 6
        color: "transparent"
        anchors.fill: cover
        anchors.margins: -12
    }

    SpotifyImage {
        id: cover
        uri: track.largeCoverUri
        anchors {
            horizontalCenter: parent.horizontalCenter
            bottom: trackDetails.top
            top: parent.top
            topMargin: 150
            bottomMargin: 30
        }

        width: height
    }

    MouseArea {
        onClicked: Fortissimo.nextTrack()
        anchors.fill: cover
    }

    Column {
        id: trackDetails
        height: childrenRect.height
        anchors {
            left: parent.left
            right: parent.right
            bottom: parent.bottom
            margins: 40
        }

        Text {
            text: track.name
            color: "#dddddd"
            font.family: robotoThin.name
            font.pointSize: 40
            font.weight: Font.Light
            horizontalAlignment: Text.AlignHCenter

            anchors {
                left: parent.left
                right: parent.right
            }
        }

        Text {
            text: track.artistNames.join(', ')
            color: "#dddddd"
            font.family: robotoThin.name
            font.pointSize: 32
            font.weight: Font.Light
            horizontalAlignment: Text.AlignHCenter

            anchors {
                left: parent.left
                right: parent.right
            }
        }
    }

    TrackInfo {
        id: track
        track: player.track
    }

    Timer {
        id: sampleTimer
        interval: 1000
        repeat: true
        running: false
        onTriggered: Fortissimo.sample()
    }

    Timer {
        id: steeringTimer
        interval: 10000
        repeat: true
        running: false
        onTriggered: Fortissimo.steer()
    }

    Component.onCompleted: {
        Fortissimo.initialize()
        sampleTimer.running = true
        steeringTimer.running = true
    }
}

