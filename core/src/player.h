#pragma once

#include <QObject>
#include <QQueue>
#include <QQuickView>
#include <QPointer>

#include <Spotinetta/Spotinetta>

#include "models/queuemodel.h"
#include "audiooutput.h"
#include "utilities/pointers.h"

class QTimer;

namespace Sonetta {

class Player : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool shuffle READ shuffle WRITE setShuffle NOTIFY shuffleChanged)
    Q_PROPERTY(bool repeat READ repeat WRITE setRepeat NOTIFY repeatChanged)
    Q_PROPERTY(bool playing READ playing NOTIFY playingChanged)
    Q_PROPERTY(int position READ position NOTIFY positionChanged)
    Q_PROPERTY(Spotinetta::Track track READ track NOTIFY trackChanged)
    Q_PROPERTY(QObject * queue READ queue CONSTANT)

public:
    explicit Player(ObjectSharedPointer<Spotinetta::Session> session, ObjectSharedPointer<AudioOutput> output, QObject *parent = 0);

    bool shuffle() const;
    bool repeat() const;
    bool playing() const;
    int position() const;
    Spotinetta::Track track() const;

    void setShuffle(bool enable);
    void setRepeat(bool enable);

    QObject * queue() const;
    
signals:
    void shuffleChanged();
    void repeatChanged();
    void trackChanged();
    void positionChanged();
    void playingChanged();
    
public slots:
    bool play(const Spotinetta::Track &track);
    bool play(const QString & uri);
    void enqueue(const Spotinetta::Track &track);
    void enqueue(const QString & uri);
    void seek(int position);

    void play();
    void playPause();
    void pause();
    void next();

private slots:
    void transitionTrack();
    void onEndOfTrack();
    void onBufferEmpty();
    void onBufferPopulated();

private:
    void updatePlaybackStatus();

    ObjectSharedPointer<Spotinetta::Session>        m_session;
    ObjectSharedPointer<AudioOutput>                m_output;
    ObjectScopedPointer<Spotinetta::TrackWatcher>   m_watcher;
    ObjectScopedPointer<QueueModel>                 m_queue;

    bool m_endOfTrack;
    bool m_bufferEmpty;

    bool m_shuffle;
    bool m_repeat;
};

}
