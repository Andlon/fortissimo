import QtQuick 2.2
import Sonetta 0.1
import Navigation 0.1

import "."

/*
  - CollectionView:
  Provides a generic list component with a custom look and feel,
  intended to reduce repetition of QML code to achieve more or less
  the same look and feel across the entire interface.

  Usage: CollectionView provides look and feel in terms of alternating
         item backgrounds and highlight. Just provide a delegate (of type CollectionDelegate)
         that displays the content.
  */

FocusScope {
    id: root

    property Component delegate
    property alias model: list.model
    property alias currentIndex: list.currentIndex
    property alias currentItem: list.currentItem
    property alias delegateHeight: scrollbar.delegateHeight
    property alias count: list.count

    property alias add: list.add
    property alias addDisplaced: list.addDisplaced
    property alias displaced: list.displaced
    property alias move: list.move
    property alias moveDisplaced: list.moveDisplaced
    property alias populate: list.populate
    property alias remove: list.remove
    property alias removeDisplaced: list.removeDisplaced

    property alias snapMode: list.snapMode
    property alias section: list.section

    property alias verticalLayoutDirection: list.verticalLayoutDirection

    property QtObject contextModel: null

    signal itemPressed(var index, var model)
    signal contextPressed(string name, var data)
    clip: true

    height: list.contentHeight

    ListView {
        id: list
        anchors {
            top: root.top
            bottom: root.bottom
            left: root.left
            right: scrollbar.left
        }

        delegate: delegateComponent
        highlight: CollectionHighlight { listView: list }
        highlightFollowsCurrentItem: true
        highlightMoveDuration: UI.timing.highlightMove
        highlightResizeDuration: UI.timing.highlightMove

        clip: true
        boundsBehavior: Flickable.StopAtBounds
        focus: true
        interactive: false
        currentIndex: 0

        Navigation.onDown: {
            if (list.currentIndex < list.count - 1) {
                if (list.verticalLayoutDirection == ListView.TopToBottom)
                    list.incrementCurrentIndex()
                else
                    list.decrementCurrentIndex()
            }
            else
                event.accepted = false
        }

        Navigation.onUp: {
            if (list.currentIndex > 0) {
                if (list.verticalLayoutDirection == ListView.TopToBottom)
                    list.decrementCurrentIndex()
                else
                    list.incrementCurrentIndex()
            }
            else {
                event.accepted = false
            }
        }

        Navigation.onRight: {
            if (scrollbar.visible)
                scrollbar.focus = true
            else
                event.accepted = false
        }

        Navigation.onOk: root.itemPressed(list.currentIndex, list.currentItem.internalModel)
    }

    VerticalScrollbar {
        id: scrollbar
        list: list
        anchors {
            right: root.right
            bottom: root.bottom
            top: root.top
        }

        Navigation.onLeft: list.focus = true
    }

    Component {
        id: delegateComponent

        FocusScope {
            id: delegateRoot
            height: delegateLoader.height
            width: list.width
            visible: delegateLoader.status === Loader.Ready

            property int internalIndex: index
            property var internalModel: model

            Pattern {
                anchors.fill: delegateRoot
                pattern: "dark"
                visible: internalIndex % 2 == 0
                z: -1
                parent: delegateRoot.parent
            }

            Loader {
                id: delegateLoader
                width: list.width
                sourceComponent: root.delegate
                focus: true

                property alias model: delegateRoot.internalModel
            }
        }
    }
}
