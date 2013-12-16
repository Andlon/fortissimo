.pragma library

function createInitialState()
{
    var state = {}

    /* Generic options */
    state.page = "playlists"
    state.pageLabel = "playlists"
    state.showTopSection = true

    /* Playlists page options */
    state.playlists = {}

    // Holds the current Spotinetta::Playlist object, or undefined if none
    state.playlists.playlist = undefined

    // Possible stages:
    // "container": displays a list of available playlists for the current user
    // "playlist": displays the playlist specified by the above playlist property
    state.playlists.stage = "container"

    /* Search page options */
    state.search = {}

    // Possible stages:
    // "query" : query input screen
    // "results": displays results for the given query
    state.search.stage = "query"

    /* Browse options */
    state.browse = {}

    // Possible types (self-explanatory):
    // "artist", "album", "playlist"
    // "": no browse
    state.browse.type = ""
    state.browse.artist = undefined
    state.browse.album = undefined
    state.browse.playlist = undefined

    return state
}

function createPage(state, page)
{
    state.page = page
    state.pageLabel = getLabel(page)
    state.showTopSection = page !== "nowplaying"

    state.browse.type = ""
    state.browse.artist = undefined
    state.browse.album = undefined
    state.browse.playlist = undefined

    return state
}

function createArtistBrowse(state, artist)
{
    state.browse.type = "artist"
    state.browse.artist = artist

    return state
}

function getLabel(page)
{
    switch (page)
    {
    case "playlists":
        return "playlists"
    case "nowplaying":
        return "now playing"
    case "search":
        return "search"
    case "session":
        return "session"
    default:
        return ""
    }
}