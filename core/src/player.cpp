#include "player.h"

#include <QCoreApplication>

namespace sp = Spotinetta;

namespace Sonetta {

Player::Player(ObjectSharedPointer<Spotinetta::Session> session, ObjectSharedPointer<AudioOutput> output, QObject *parent)
    :   QObject(parent), m_session(session), m_output(output),
      m_queue(new QueueModel(session.constCast<const sp::Session>(), this)), m_endOfTrack(false),
      m_bufferEmpty(false), m_shuffle(false), m_repeat(false)
{
    Q_ASSERT(session != nullptr);
    Q_ASSERT(output != nullptr);

    m_watcher.reset(new sp::TrackWatcher(session.data(), this));

    // This ensures a track is eventually played whether it's loaded
    // or not
    connect(m_watcher.data(), &sp::TrackWatcher::loaded, [this] {
        play(m_watcher->watched());
    });;

    connect(output.data(), &AudioOutput::bufferEmpty, this, &Player::onBufferEmpty);
    connect(output.data(), &AudioOutput::bufferPopulated, this, &Player::onBufferPopulated);
    connect(output.data(), &AudioOutput::positionChanged, this, &Player::positionChanged);
    connect(output.data(), &AudioOutput::isPausedChanged, this, &Player::playingChanged);
    connect(this, &Player::trackChanged, this, &Player::playingChanged);
    connect(session.data(), &sp::Session::endOfTrack, this, &Player::onEndOfTrack);
}

void Player::onBufferEmpty()
{
    m_bufferEmpty = true;
    transitionTrack();
}

void Player::onBufferPopulated()
{
    m_bufferEmpty = false;
    transitionTrack();
}

void Player::onEndOfTrack()
{
    m_endOfTrack = true;
    // It appears Spotify sends empty samples until we actually
    // pause playback or unload the track. Transition doesn't
    // actually happen until the output has played all data
    // in the buffer though.
    m_session->unload();
    transitionTrack();
}

bool Player::shuffle() const
{
    return m_shuffle;
}

bool Player::repeat() const
{
    return m_repeat;
}

bool Player::playing() const
{
    return !m_output.isNull() ? !m_output->isPaused() && track().isValid() : false;
}

int Player::position() const
{
    return m_output.isNull() ? 0 : m_output->position();
}

sp::Track Player::track() const
{
    return m_watcher->watched();
}

void Player::setShuffle(bool enable)
{
    if (m_shuffle != enable)
    {
        m_shuffle = enable;
        emit shuffleChanged();
    }
}

void Player::setRepeat(bool enable)
{
    if (m_repeat != enable)
    {
        m_repeat = enable;
        emit repeatChanged();
    }
}

QObject * Player::queue() const
{
    return m_queue.data();
}

void Player::transitionTrack()
{
    if (m_endOfTrack && m_bufferEmpty)
    {
        // Plays next track when the current track has finished given two conditions:
        // - The end of track must have been reached. This means that libspotify has
        //   pushed all audio data belonging to the current track to our output buffers.
        // - The output must be idle, meaning all delivered audio data has been played.
        // The result is hopefully a perfect transition between tracks

        // Make sure position timer gets reset
        m_output->reset(0);
        next();
    }
}

bool Player::play(const Spotinetta::Track &track)
{
    m_endOfTrack = false;

    if (track.availability(m_session.data()) != sp::Track::Availability::Available)
        return false;

    if (this->track().isValid())
    {
        // If currently playing a track, unload it first
        m_session->unload();

        // Clear buffers
        m_output->reset(0);
    }

    if (track.isLoaded())
    {
        sp::Track loadedTrack = m_session->load(track);
        if (loadedTrack.isValid())
        {
            m_output->unpause();
            m_session->play();
        }

        if (loadedTrack != this->track())
        {
            m_watcher->watch(track);
            emit trackChanged();
        }
    }

    return true;

    // If track is not loaded, it will be played when it is loaded,
    // as the watcher's loaded signal is connected to play(track)
}

bool Player::play(const QString &uri)
{
    return play(sp::Link(uri).track());
}

void Player::enqueue(const Spotinetta::Track &track)
{
    // Assumes track is loaded, might want to add watcher and enqueue when ready
    // or it may be better to add watch functionality to QueueModel
    m_queue->enqueue(track);
}

void Player::enqueue(const QString &uri)
{
    enqueue(sp::Link(uri).track());
}

void Player::seek(int position)
{
    sp::Track track = m_watcher->watched();
    if (track.isValid())
    {
        int pos = qMax(position, 0);
        pos = qMin(track.duration(), pos);
        m_session->seek(pos);
        m_output->reset(pos);
    }
}

void Player::play()
{
    m_session->play();
    m_output->unpause();
}

void Player::playPause()
{
    if (m_session->playbackState() == sp::Session::PlaybackState::Paused)
    {
        play();
    }
    else
    {
        pause();
    }
}

void Player::pause()
{
    m_session->pause();
    m_output->pause();
}

void Player::next()
{
    sp::Track track;
    // Try to get an available track from queue
    while (!m_queue->isEmpty() && track.availability(m_session.data()) != sp::Track::Availability::Available)
        track = m_queue->dequeue();

    if (track.isValid())
    {
        play(track);
    }
    else {
        pause();
        m_watcher->watch(sp::Track());
    }

    emit trackChanged();
}


}
