#pragma once

#include <QObject>
#include <QSet>
#include <QStringList>
#include <Spotinetta/Spotinetta>
#include "pointers.h"

namespace Sonetta {

class LibraryCollection : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool complete READ isComplete NOTIFY isCompleteChanged)
    Q_PROPERTY(QStringList trackList READ trackList NOTIFY tracksChanged)
public:
    explicit LibraryCollection(ObjectSharedPointer<const Spotinetta::Session> session, QObject *parent = 0);

    bool isComplete();
    QStringList trackList() const;

    Q_INVOKABLE void runScan();

signals:
    void isCompleteChanged();
    void tracksChanged();

private:
    void decrementRemainingPlaylistCount();
    void scan();
    void scanPlaylist(const Spotinetta::Playlist & playlist);

    QSet<QString> m_tracks;

    bool m_isComplete;
    int m_remainingPlaylists;
    ObjectSharedPointer<const Spotinetta::Session> m_session;
    ObjectScopedPointer<Spotinetta::PlaylistContainerWatcher> m_watcher;
};

}
