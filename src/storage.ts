import { Station } from "./interfaces";
const KEY_PREFIX = 'radiyo_'
class Store {
    public recently_played: Station[] = [];
    public favorite_stations: Station[] = [];
    constructor() {
        this.favorite_stations = this.get('favs') ?? [];
        this.recently_played = this.get('rp') ?? [];
    }
    private get(key: string) {
        const item = localStorage.getItem(KEY_PREFIX + key);
        if (item) {
            return JSON.parse(item)
        } else null;
    }
    private set(key: string, payload: any) {
        localStorage.setItem(KEY_PREFIX + key, JSON.stringify(payload));
    }
    addFav(station: Station) {
        station.nowPlaying = undefined;
        this.favorite_stations.push(station);
        this.set('favs', this.favorite_stations);
    }
    rmvFav(station: Station) {
        const index = this.favorite_stations.findIndex((el) => el.streamDownloadURL === station.streamDownloadURL);
        this.favorite_stations.splice(index, 1);
        this.set('favs', this.favorite_stations);
    }
    isFav(station: Station): boolean {
        return !!this.favorite_stations.find((el) => el.streamDownloadURL === station.streamDownloadURL);
    }
    pushRecentlyPlayed(station: Station) {
        station.nowPlaying = undefined;
        if (!(!!this.recently_played.find((el) => el.streamDownloadURL === station.streamDownloadURL))) {
            this.recently_played.push(station);
            if (this.recently_played.length > 5) {
                this.recently_played.shift();
            }
            this.set('rp', this.recently_played);
        }
    }

}

export default new Store();