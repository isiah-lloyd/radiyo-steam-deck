import { fetchNC } from './fetchNC';
import { autocompleteAPIResponse, autocompleteAPIResponseArray, PlaylistAPIResponse, reco2APIResponse, Station } from './interfaces';

export class RadioPlayer {
    public CURRENT_STATION: Station = {} as Station;
    static RADIO_DIRECTORY_KEY = '7090975725';
    constructor() {
    }
    static async search(query: string, limit: number | null = null, category: 'ARTIST' | 'STATION' | 'GENRE' | null = null): Promise<Station[]> {
        const stations: Station[] = [];

        if (category === 'STATION') {
            query = '@callsign%20' + encodeURIComponent(query) + '*';
        }
        else if (category === 'ARTIST') {
            query = '@artist%20' + encodeURIComponent(query) + '*';
        }
        else if (category === 'GENRE') {
            query = '@genre%20' + encodeURIComponent(query) + '*';
        }
        const playlistResults = await (await fetchNC(`http://api.dar.fm/playlist.php?callback=json${limit ? `&pagesize=${limit}` : ''}&q=${encodeURIComponent(query)}%20&partner_token=${this.RADIO_DIRECTORY_KEY}`)).json() as PlaylistAPIResponse;
        if (playlistResults.success) {
            const results = playlistResults.result.filter((el: any) => {
                return el.band === 'NET' || el.band === 'FM' || el.band === 'AM';
            });
            for (const result of results) {
                const station: Station = {} as Station;
                station.id = result.station_id;
                station.text = result.callsign;
                //const streamingURLResult = await(await fetch(`http://api.dar.fm/uberstationurl.php?callback=json&partner_token=${RadiYo.RADIO_DIRECTORY_KEY}&station_id=${stationId}`)).json();
                station.streamDownloadURL = `http://stream.dar.fm/${station.id}`;
                const stationInfoResult = await (await fetchNC(`http://api.dar.fm/darstations.php?callback=json&station_id=${station.id}&partner_token=${this.RADIO_DIRECTORY_KEY}`)).json();
                const stationInfo = stationInfoResult.result[0].stations[0];
                station.image = stationInfo.station_image;
                station.subtext = stationInfo.slogan ? stationInfo.slogan : stationInfo.description;
                station.genre = stationInfo.genre;
                station.nowPlaying = { title: '', artist: '' };
                station.nowPlaying.title = result.title;
                station.nowPlaying.artist = result.artist;
                stations.push(station);
            }
            return stations;
        }
        else {
            return [];
        }
    }
    static async searchByStationId(stationId: string): Promise<Station> {
        const station: Station = {} as Station;
        station.streamDownloadURL = `http://stream.dar.fm/${stationId}`;
        const stationInfoResult = await (await fetchNC(`http://api.dar.fm/darstations.php?callback=json&station_id=${stationId}&partner_token=${this.RADIO_DIRECTORY_KEY}`)).json();
        const stationInfo = stationInfoResult.result[0].stations[0];
        station.id = stationId;
        station.text = stationInfo.callsign;
        station.image = stationInfo.station_image;
        station.subtext = stationInfo.slogan ? stationInfo.slogan : stationInfo.description;
        station.genre = stationInfo.genre;
        return station;
    }
    static async recommendStations(artist: string, limit: number | null = 5, getStationInfo = false): Promise<Station[] | null> {
        const stations: Station[] = [];
        let counter = 0;
        const playlistResults = await (await fetch(`https://api.dar.fm/reco2.php?callback=json&artist=^${encodeURIComponent(artist)}*&partner_token=${this.RADIO_DIRECTORY_KEY}`)).json() as reco2APIResponse;
        if (playlistResults.success) {
            for (const result of playlistResults.result) {
                if (limit && counter >= limit) break;
                const station: Station = {} as Station;
                station.nowPlaying = { title: '', artist: '' };
                station.id = result.playlist.station_id;
                station.text = result.playlist.callsign;
                station.streamDownloadURL = `https://stream.dar.fm/${station.id}`;
                station.nowPlaying.title = result.songtitle;
                station.nowPlaying.artist = result.songartist;
                if (getStationInfo) {
                    const stationInfoResult = await (await fetch(`https://api.dar.fm/darstations.php?callback=json&station_id=${station.id}&partner_token=${this.RADIO_DIRECTORY_KEY}`)).json();
                    const stationInfo = stationInfoResult.result[0].stations[0];
                    station.image = stationInfo.station_image;
                    station.subtext = stationInfo.slogan ? stationInfo.slogan : stationInfo.description;
                    station.genre = stationInfo.genre;
                }
                stations.push(station);
                counter++;
            }
            return stations;
        }
        else {
            return null;
        }
    }
    static async searchByArtist(artist: string, limit = 5): Promise<Station[] | null> {
        const search = await this.search(artist, limit, 'ARTIST');
        if (search) {
            if (search.length < limit) {
                let result;
                const remainingSlots = limit - search.length;
                const recStations = await this.recommendStations(artist, remainingSlots);
                if (recStations) {
                    result = search.concat(recStations);
                    return result;
                }
            }
            else {
                return search;
            }
        }
        else {
            const recStations = await this.recommendStations(artist, 5);
            return recStations;
        }
        return null;
    }
    static async searchByStation(query: string, limit = 5): Promise<Station[] | null> {
        const search = await this.search(query, limit, 'STATION');
        if (search) {
            return search;
        }
        else {
            return null;
        }
    }
    static async searchByGenre(genre: string, limit = 5): Promise<Station[] | null> {
        const search = await this.search(genre, limit, 'GENRE');
        if (search) {
            return search;
        }
        else {
            return null;
        }
    }
    static async searchOne(query: string): Promise<Station | null> {
        const search = await RadioPlayer.search(query, 2);
        if (search) {
            return search[0];
        }
        else {
            return null;
        }
    }
    static async getTopSongs(limit = 10): Promise<Station[] | null> {
        const stations: Station[] = [];
        const playlistResults = await (await fetchNC(`http://api.dar.fm/topsongs.php?callback=json&page_size=${limit}&q=Music&partner_token=${this.RADIO_DIRECTORY_KEY}`)).json() as reco2APIResponse;
        if (playlistResults.success) {
            const random = playlistResults.result.sort(() => .5 - Math.random()).slice(0, 5);
            for (const result of random) {
                const station: Station = {} as Station;
                station.nowPlaying = { title: '', artist: '' };
                station.id = result.playlist.station_id;
                station.text = result.playlist.callsign;
                station.nowPlaying.title = result.songtitle;
                station.nowPlaying.artist = result.songartist;
                stations.push(station);
            }
            return stations;
        }
        else {
            return null;
        }
    }
    static async getAutocomplete(query: string): Promise<autocompleteAPIResponseArray[] | null> {
        if (query) {
            const response = await (await fetch(`http://api.dar.fm/presearch.php?callback=json&q=${query}*&partner_token=${this.RADIO_DIRECTORY_KEY}`)).json() as autocompleteAPIResponse;
            return response.result;
        }
        return null;
    }
}