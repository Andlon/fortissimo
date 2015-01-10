import QtQuick 2.4
import Sonetta 0.1
import "../../config/credentials.js" as Credentials

Rectangle {
    width: 100
    height: 62

    color: "#333355"

    Connections {
        target: session

        onLoggedIn: player.play("spotify:track:7BqmSGGjuVKdD3tQoPWteT")
        onLoginFailed: console.log("Login failed")
    }

    Component.onCompleted: {
        session.login(Credentials.spotifyUsername, Credentials.spotifyPassword)
    }

    Rectangle {
        anchors.centerIn: parent
        height: 200
        width: 200

        color: "Yellow"

        MouseArea {
            onClicked: player.next()
            anchors.fill: parent
        }

    }
}

