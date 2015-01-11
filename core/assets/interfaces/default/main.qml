import QtQuick 2.4
import Sonetta 0.1
import "../../lib/Fortissimo.js" as Fortissimo

Rectangle {
    width: 100
    height: 62

    color: "#333355"

    Connections {
        target: session

        onLoggedIn: {
            library.runScan()
            player.play("spotify:track:3bidbhpOYeV4knp8AIu8Xn")
        }
        onLoginFailed: console.log("Login failed")
    }

    Component.onCompleted: {
        Fortissimo.initialize()
    }

    Rectangle {
        anchors.centerIn: parent
        height: 200
        width: 200

        color: "Yellow"

        MouseArea {
            onClicked: Fortissimo.nextTrack()
            anchors.fill: parent
        }
    }

    Column {
        height: childrenRect.height
        anchors {
            left: parent.left
            right: parent.right
            bottom: parent.bottom
            margins: 20
        }

        Text {
            text: track.name
            color: "#dddddd"
            font.family: "Roboto Thin"
            font.pointSize: 30
        }

        Text {
            text: track.artistNames.join(', ')
            color: "#dddddd"
            font.family: "Roboto Thin"
            font.pointSize: 26
        }
    }

    TrackInfo {
        id: track
        track: player.track
    }

    Connections {
        target: library

        onIsCompleteChanged: console.log("Track count: " + library.trackList.length)
    }

}

