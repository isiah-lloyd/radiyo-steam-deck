export interface NowPlaying {
    title: string;
    artist: string;
    albumArtUrl: string;
}
export interface Station {
    id?: string;
    image?: string;
    subtext?: string;
    //title of station
    text: string;
    streamDownloadURL: string,
    //link to m3u file
    URL?: string,
    genre?: string
    nowPlaying?: {
        title: string;
        artist: string;
    }
    listenerCount?: number;
}

export interface FeaturedStation {
    title: string;
    description: string;
    stations: Station[];
}

// API responses
interface PlaylistAPIResponseArray {
    callsign: string;
    station_id: string;
    band: string;
    artist: string;
    title: string;
}
export interface PlaylistAPIResponse {
    success: boolean;
    result: PlaylistAPIResponseArray[]
}
interface reco2APIResponseArray {
    songartist: string;
    songtitle: string;
    playlist: PlaylistAPIResponseArray;
}
export interface reco2APIResponse {
    success: boolean;
    result: reco2APIResponseArray[];
}
export interface autocompleteAPIResponseArray {
    keyword: string;
    type: 'A' | 'T' | 'S';
}
export interface autocompleteAPIResponse {
    success: boolean
    result: autocompleteAPIResponseArray[]
}
export type Pages = 'home' | 'player' | 'search_results';
export interface Route {
    page: Pages,
    changePage: (page: Pages) => void
}