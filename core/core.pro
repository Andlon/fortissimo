QT += quick multimedia network

CONFIG += c++11

win32:QMAKE_POST_LINK += $$PWD/../deploy.bat
unix:QMAKE_POST_LINK += bash $$PWD/../deploy.sh

# Add rpath so that deployed libs can be found in libs/ subdirectory on Linux
unix:!mac {
    LIBS += -Wl,-rpath=\\\$$ORIGIN/libs
}

TARGET = fortissimo

RCC_DIR = "build/rcc"
UI_DIR = "build/uic"
MOC_DIR = "build/moc"
OBJECTS_DIR = "build/obj"

CONFIG(debug, debug|release) {
    DESTDIR = "$$PWD/../debug"
}
CONFIG(release, debug|release) {
    DESTDIR = "$$PWD/../release"
}

INCLUDEPATH -= "$$PWD"
QML_IMPORT_PATH += "$$PWD/assets/modules"

include("../dependencies/spotinetta/link.pri")

HEADERS += \
    src/navigation/navigation.h \
    src/models/abstracttrackcollectionmodel.h \
    src/models/abstractalbumcollectionmodel.h \
    src/models/albumlistmodel.h \
    src/models/tracklistmodel.h \
    src/models/abstractartistcollectionmodel.h \
    src/models/artistlistmodel.h \
    src/player.h \
    src/uistatecoordinator.h \
    src/application.h \
    src/imageprovider.h \
    src/models/playlistmodel.h \
    src/models/playlistcontainermodel.h \
    src/quick/quicktrackinfo.h \
    src/quick/enums.h \
    src/quick/models.h \
    src/audiooutput.h \
    src/searchengine.h \
    src/utilities/predictioncollection.h \
    src/models/queuemodel.h \
    src/utilities/persistentplaylistindex.h \
    src/settings.h \
    src/utilities/mosaicgenerator.h \
    src/quick/quickmosaicgenerator.h \
    src/models/albummodel.h \
    src/quick/quickfactory.h \
    src/navigation/lircclient.h \
    src/utilities/pointers.h \
    src/navigation/windowsnavigationfilter.h \
    src/navigation/navigationcontroller.h \
    src/quick/quickartistsynopsis.h \
    src/quick/quickglobalstatemachine.h \
    src/utilities/librarycollection.h

SOURCES += \
    $$PWD/../appkey.c \
    src/navigation/navigation.cpp \
    src/main.cpp \
    src/models/abstracttrackcollectionmodel.cpp \
    src/models/abstractalbumcollectionmodel.cpp \
    src/models/albumlistmodel.cpp \
    src/quick/quicktrackinfo.cpp \
    src/models/tracklistmodel.cpp \
    src/models/abstractartistcollectionmodel.cpp \
    src/models/artistlistmodel.cpp \
    src/player.cpp \
    src/uistatecoordinator.cpp \
    src/application.cpp \
    src/imageprovider.cpp \
    src/models/playlistmodel.cpp \
    src/models/playlistcontainermodel.cpp \
    src/audiooutput.cpp \
    src/searchengine.cpp \
    src/utilities/predictioncollection.cpp \
    src/models/queuemodel.cpp \
    src/utilities/persistentplaylistindex.cpp \
    src/settings.cpp \
    src/utilities/mosaicgenerator.cpp \
    src/models/albummodel.cpp \
    src/navigation/lircclient.cpp \
    src/navigation/navigationcontroller.cpp \
    src/quick/quickartistsynopsis.cpp \
    src/quick/quickglobalstatemachine.cpp \
    src/utilities/librarycollection.cpp

DISTFILES += \
    assets/interfaces/default/main.qml \
    assets/lib/echonest/echonest.js \
    assets/lib/util/url.js \
    assets/lib/Fortissimo.js \
    assets/lib/util/util.js \
    assets/interfaces/default/SpotifyImage.qml
