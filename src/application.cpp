#include "application.h"

#include <QtQml>
#include <QScreen>
#include <QKeyEvent>
#include <QQuickView>

#include "quicktrackinfo.h"
#include "quickartistsynopsis.h"
#include "quicksearch.h"
#include "imageprovider.h"

#include "models/albumlistmodel.h"
#include "models/albumbrowsemodel.h"

namespace sp = Spotinetta;

namespace Sonetta {

Application::Application(int &argc, char **argv)
    :   QGuiApplication(argc, argv), m_view(0), m_nav(0)
{
    sp::SessionConfig config;
    config.applicationKey = sp::ApplicationKey(g_appkey, g_appkey_size);

    m_session = new sp::Session(config, this);
    m_player = new Player(m_spotify, this);
    m_ui = new UIStateCoordinator(this);
}

Application::~Application()
{
    delete m_view;
}

int Application::run()
{
    qmlRegisterUncreatableType<Player>("sonetta", 0, 1, "Player", "Can not instantiate Player from QML");
    qmlRegisterUncreatableType<UIStateCoordinator>("sonetta", 0, 1, "UIStateCoordinator", "Can not instantiate UIStateCoordinator from QML.");

    qmlRegisterType<Navigation>("sonetta", 0, 1, "Navigation");
    qmlRegisterType<NavigationAttached>();
    qmlRegisterUncreatableType<QuickNavEvent>("sonetta", 0, 1, "NavEvent", "Cannot instantiate navigation event. ");

//    qmlRegisterType<PlaylistContainerModel>("sonetta", 0, 1, "PlaylistContainerModel");
//    qmlRegisterType<PlaylistModel>("sonetta", 0, 1, "PlaylistModel");
    qmlRegisterType<AlbumListModel>("sonetta", 0, 1, "AlbumListModel");
    qmlRegisterType<AlbumBrowseModel>("sonetta", 0, 1, "AlbumBrowseModel");
    qmlRegisterType<QuickTrackInfo>("sonetta", 0, 1, "TrackInfo");
    qmlRegisterType<QuickArtistSynopsis>("sonetta", 0, 1, "ArtistSynopsis");
    qmlRegisterType<QuickSearch>("sonetta", 0, 1, "Search");

    if (!m_spotify->createSession())
    {
        qFatal("Failed to create spotify session. Aborting...");
        return 1;
    }

    m_nav = new Navigation(this);
    m_view = new QQuickView;

    QString applicationDir = applicationDirPath();

    ImageProvider * provider = new ImageProvider(this);

    m_view->engine()->addImageProvider(QLatin1String("sp"), provider);
    m_view->engine()->rootContext()->setContextProperty("player", m_player);
    m_view->engine()->rootContext()->setContextProperty("spotify", m_spotify);
    m_view->engine()->rootContext()->setContextProperty("ui", m_ui);
    m_view->engine()->addImportPath(applicationDir + QStringLiteral("/qml/modules"));
    m_view->setSource(QUrl::fromLocalFile(applicationDir + QStringLiteral("/qml/rework/main.qml")));
    m_view->setResizeMode(QQuickView::SizeRootObjectToView);

    // Center view
    QScreen * screen = m_view->screen();
    QPoint screenCenter = screen->availableGeometry().center();
    QPoint windowCenter = m_view->geometry().center();
    m_view->setPosition(screenCenter - windowCenter);
    m_view->showFullScreen();

    // Start event loop
    return exec();
}

Application * Application::instance()
{
    QCoreApplication * inst = QCoreApplication::instance();
    return inst == nullptr ? nullptr : static_cast<Application *>(inst);
}

sp::Session * Application::session() const
{
    return m_session;
}

bool Application::notify(QObject *receiver, QEvent *event)
{
    if (event->type() == QEvent::KeyPress)
    {
        QKeyEvent * keyEvent = static_cast<QKeyEvent *>(event);

        // Ignore Alt + Enter
        if (!(keyEvent->key() == Qt::Key_Return && keyEvent->modifiers() & Qt::AltModifier))
        {
            if (Navigation::dispatchKeyEvent(keyEvent))
                return true;
        }
    }

    return QGuiApplication::notify(receiver, event);
}

}