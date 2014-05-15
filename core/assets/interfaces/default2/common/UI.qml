pragma Singleton
import QtQuick 2.2

Item {
    readonly property int globalSpacing: 30
    readonly property string globalBackgroundPattern: "medium"

    property QtObject timing: QtObject {
        readonly property int highlightMove: 100
        readonly property int dialogPopup: 350
    }

    property QtObject dialog: QtObject {
        readonly property real brightnessDelta: -0.80
        readonly property int blurRadius: 32
    }

    property QtObject colors: QtObject {
        readonly property color light: "#292929"
        readonly property color medium: "#202020"
        readonly property color dark: "#151515"

        readonly property color text: "#ffffff"
        readonly property color label: "#999999"
        readonly property color focus: "#ffc000"
        readonly property color focusText: light
    }

    property QtObject fonts: QtObject {
        readonly property font standard: Qt.font({ family: "Roboto", pointSize: 23, weight: 40 })
        readonly property font disclaimer: Qt.font({ family: "Roboto", pointSize: 17, weight: 40 })
        readonly property font header: Qt.font({ family: "Roboto", pointSize: 32, weight: 50 })
    }

    property QtObject box: QtObject {
        readonly property string backgroundPattern: "dark"
        readonly property color borderColor: colors.light
        readonly property int borderWidth: 1
    }

    property QtObject menu: QtObject {
        readonly property int defaultWidth: 400
        readonly property int defaultHeight: 60
        readonly property int horizontalMargins: globalSpacing
        readonly property int verticalMargins: globalSpacing / 2
    }
}
