#include "librarycollection.h"
#include <QDebug>

namespace sp = Spotinetta;

namespace Sonetta {

LibraryCollection::LibraryCollection(ObjectSharedPointer<const Spotinetta::Session> session, QObject *parent)
    :   QObject(parent), m_isComplete(false), m_remainingPlaylists(0), m_session(session), m_watcher(new sp::PlaylistContainerWatcher(session.data(), this))
{

}

bool LibraryCollection::isComplete()
{
    return m_isComplete;
}

QStringList LibraryCollection::trackList() const
{
    return m_tracks.values();
}

void LibraryCollection::runScan()
{
    m_watcher->watch(m_session->playlistContainer());

    if (m_watcher->watched().isLoaded()) {
        scan();
    } else {
        connect(m_watcher.data(), &sp::PlaylistContainerWatcher::loaded, this, &LibraryCollection::scan);
    }
}

void LibraryCollection::decrementRemainingPlaylistCount()
{
    --m_remainingPlaylists;
    if (m_remainingPlaylists == 0) {
        m_isComplete = true;
        emit isCompleteChanged();
    }
}

void LibraryCollection::scan()
{
    m_remainingPlaylists = m_watcher->watched().playlistCount();
    for (const sp::Playlist & playlist : m_watcher->watched().playlists()) {
        if (playlist.isLoaded()) {
            scanPlaylist(playlist);
            decrementRemainingPlaylistCount();
        } else {
            auto * watcher = new sp::PlaylistWatcher(m_session.data(), this);
            connect(watcher, &sp::PlaylistWatcher::stateChanged, watcher, [&] () {
                auto playlist = watcher->watched();
                if (playlist.isLoaded()) {
                    watcher->deleteLater();
                    scanPlaylist(playlist);
                    decrementRemainingPlaylistCount();
                }
            });
        }
    }
}

void LibraryCollection::scanPlaylist(const Spotinetta::Playlist &playlist)
{
    for (const auto & track : playlist.tracks()) {
        m_tracks.insert(sp::Link(track).uri());
    }

    emit tracksChanged();
}

}
