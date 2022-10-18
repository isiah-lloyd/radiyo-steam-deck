import {
    PanelSection,
    Focusable,
    TextField,
    Router,
    QuickAccessTab,
    showModal,
    Dropdown,
    DropdownOption
} from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { ErrorMessage } from "../errorBox";
import { Route, Station } from "../interfaces";
import { RadioPlayer } from "../RadioPlayer";
import { SearchModal } from "../searchModal";
import { StationList } from "../stationList";
import storage from "../storage";

export const Home: VFC<{ onSearch: (query: string) => void, onStationSelected: (station: Station) => void, route: Route }> = ({ onSearch, onStationSelected, route }) => {
    const [browseStations, setBrowseStations] = useState<Station[]>([]);
    const [selectedOption, setSelectedOption] = useState<number>();
    const [errorMsg, setErrorMsg] = useState<string>();
    const onSearchModalClosed = async (query: string) => {
        Router.OpenQuickAccessMenu(QuickAccessTab.Decky);
        onSearch(query);
    }
    const browseOptions: DropdownOption[] = [{ data: 0, label: 'Favorites' }, { data: 1, label: 'Recently Played' }, { data: 2, label: 'Trending' }]
    const onBrowseOptionChange = async (option: number) => {
        setErrorMsg(undefined);
        setBrowseStations([]);
        switch (option) {
            case 0:
                setSelectedOption(0);
                setBrowseStations(storage.favorite_stations)
                break;
            case 1:
                setSelectedOption(1);
                setBrowseStations(storage.recently_played)
                break;
            case 2:
                setSelectedOption(2);
                try {
                    setBrowseStations(await RadioPlayer.getTopSongs() ?? []);
                }
                catch (e: any) {
                    setErrorMsg(e.message);
                }
                break;
        }
    }
    useEffect(() => {
        if (storage.favorite_stations.length > 0) {
            onBrowseOptionChange(0);
        }
        else {
            onBrowseOptionChange(2);
        }
    }, []);
    if (route.page === 'home') {
        return (
            <PanelSection>
                <Focusable>
                    <TextField
                        label="Search"
                        placeholder={'Search for radio station'}
                        onClick={() => showModal(<SearchModal onClosed={onSearchModalClosed} />)}
                    />
                </Focusable >
                <Dropdown rgOptions={browseOptions} selectedOption={selectedOption} onChange={(e) => onBrowseOptionChange(e.data)}></Dropdown>
                {errorMsg ? <ErrorMessage msg={errorMsg} /> : null}
                <StationList stations={browseStations} onStationSelected={onStationSelected} />
            </PanelSection>
        )
    } else return null;
};