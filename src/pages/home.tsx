import {
    PanelSection,
    Focusable,
    TextField,
    Router,
    QuickAccessTab,
    showModal,
    Dropdown,
    DropdownOption,
    DialogButton,
} from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { ErrorMessage } from "../errorBox";
import { Route, Station } from "../interfaces";
import { RadioPlayer } from "../RadioPlayer";
import { TextFieldModal } from "../TextFieldModal";
import { StationList } from "../stationList";
import storage from "../storage";
import { fetchNC } from "../fetchNC";
import { AlertModal } from "../AlertModal";
enum BROWSE_OPTIONS {
    Favorites,
    Recently_Played,
    Trending
}
export const Home: VFC<{ onSearch: (query: string) => void, onStationSelected: (station: Station) => void, route: Route }> = ({ onSearch, onStationSelected, route }) => {
    const [browseStations, setBrowseStations] = useState<Station[]>([]);
    const [selectedOption, setSelectedOption] = useState<BROWSE_OPTIONS>();
    const [errorMsg, setErrorMsg] = useState<string>();
    const onSearchModalClosed = async (query: string) => {
        Router.OpenQuickAccessMenu(QuickAccessTab.Decky);
        onSearch(query);
    }
    const browseOptions: DropdownOption[] = [{ data: BROWSE_OPTIONS.Favorites, label: 'Favorites' }, { data: BROWSE_OPTIONS.Recently_Played, label: 'Recently Played' }, { data: BROWSE_OPTIONS.Trending, label: 'Trending' }]
    const onBrowseOptionChange = async (option: BROWSE_OPTIONS) => {
        setErrorMsg(undefined);
        setBrowseStations([]);
        switch (option) {
            case BROWSE_OPTIONS.Favorites:
                setSelectedOption(BROWSE_OPTIONS.Favorites);
                setBrowseStations(storage.favorite_stations)
                break;
            case BROWSE_OPTIONS.Recently_Played:
                setSelectedOption(BROWSE_OPTIONS.Recently_Played);
                setBrowseStations(storage.recently_played)
                break;
            case BROWSE_OPTIONS.Trending:
                setSelectedOption(BROWSE_OPTIONS.Trending);
                try {
                    setBrowseStations(await RadioPlayer.getTopSongs() ?? []);
                }
                catch (e: any) {
                    setErrorMsg(e.message);
                }
                break;
        }
    }
    const onCustomStationModalClosed = async (url: string) => {
        Router.OpenQuickAccessMenu(QuickAccessTab.Decky);
        let response;
        if (url.substring(0, 4) == 'http' && url.substring(0, 5) !== 'https') {
            showModal(<AlertModal title={'URL must be HTTPS'} description={''} />, window)
        }
        else if (url.substring(0, 5) !== 'https') {
            url = 'https://' + url
        }
        try {
            response = await (await fetchNC(url, true)).response;
            console.log(response);
        }
        catch (e: any) {
            console.log('Error while fetching');
            const title = `Error while fetching ${url}`
            showModal(<AlertModal title={title} description={e.message} />, window)
            return;
        }
        const contentType = response.headers[Object.keys(response.headers).find(key => key.toLowerCase() === 'content-type') ?? ''];
        const icyName = response.headers[Object.keys(response.headers).find(key => key.toLowerCase() === 'icy-name') ?? ''];
        if (contentType !== 'audio/mpeg') {
            const desc = `Got "content-type: ${contentType}"`;
            showModal(<AlertModal title="URL must point to an MP3 stream" description={desc} />, window)
        }
        else if (!icyName) {
            const desc = `I'm not sure if this is a good way to tell if this is a station, if you feel this is a mistake please file a bug on GitHub.`
            showModal(<AlertModal title="Not a Stream" description={desc} />, window)
        }
        else {
            const station: Station = {} as Station;
            station.streamDownloadURL = url;
            station.text = response.headers['icy-name']
            storage.addFav(station);
            setBrowseStations([station, ...browseStations]);
        }
    }
    useEffect(() => {
        if (storage.favorite_stations.length > 0) {
            onBrowseOptionChange(BROWSE_OPTIONS.Favorites);
        }
        else {
            onBrowseOptionChange(BROWSE_OPTIONS.Trending);
        }
    }, []);
    if (route.page === 'home') {
        return (
            <PanelSection>
                <Focusable>
                    <TextField
                        label="Search"
                        placeholder={'Search for radio station'}
                        onClick={() => showModal(<TextFieldModal label="Search" placeholder="Search by station name or artists" onClosed={onSearchModalClosed} />, window)}
                    />
                </Focusable >
                <Dropdown rgOptions={browseOptions} selectedOption={selectedOption} onChange={(e) => onBrowseOptionChange(e.data)}></Dropdown>
                {errorMsg ? <ErrorMessage msg={errorMsg} /> : null}
                <StationList stations={browseStations} onStationSelected={onStationSelected} />
                {selectedOption === BROWSE_OPTIONS.Favorites ? <DialogButton style={{ marginTop: '1rem' }} onClick={() => showModal(<TextFieldModal label="Add Station by URL (Beta)" placeholder="Must point directly to MP3 stream. HTTPS URL required." onClosed={onCustomStationModalClosed} />, window)}>Add Station by URL...</DialogButton> : null
                }
            </PanelSection >
        )
    } else return null;
};