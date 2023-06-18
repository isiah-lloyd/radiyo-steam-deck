import {
    PanelSection,
    DialogButton,
    Focusable,
    showModal,
    Router,
    QuickAccessTab,
    Spinner,
    Navigation,
} from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { MdHome, MdSearch, MdSmartToy } from "react-icons/md";
import { ErrorMessage } from "../errorBox";
import { Route, Station } from "../interfaces";
import { RadioPlayer } from "../RadioPlayer";
import { TextFieldModal } from "../TextFieldModal";
import { StationList } from "../stationList";

export const SearchResults: VFC<{ query: string, onStationSelected: (T: Station) => void, route: Route }> = ({ query, onStationSelected, route }) => {
    const [results, setResults] = useState<Station[]>([])
    const [searchText, setSearchText] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string>();
    const getResults = async (q: string) => {
        try {
            setResults(await RadioPlayer.search(q, 5));
        }
        catch (e: any) {
            setErrorMsg(e.message);
        }
        setIsLoading(false);
    }
    const onSearchModalClosed = async (q: string) => {
        Navigation.OpenQuickAccessMenu(QuickAccessTab.Decky);
        setResults([]);
        setErrorMsg(undefined);
        setIsLoading(true);
        setSearchText(q);
        getResults(q);
    }
    useEffect(() => {
        setErrorMsg(undefined);
        setResults([]);
        setIsLoading(true);
        setSearchText(query);
        if (query) getResults(query);
    }, [query])
    if (route.page === 'search_results') {
        return (
            <PanelSection title={`Search Results for ${searchText}`}>
                {isLoading ? <Spinner /> : null}
                {results.length === 0 && !isLoading && !errorMsg ? (
                    <div style={{ textAlign: "center" }}>
                        <h1><MdSmartToy /></h1>
                        <p>No results found</p>
                    </div>
                ) : null}
                {errorMsg ? <ErrorMessage msg={errorMsg} /> : null}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <StationList stations={results} onStationSelected={onStationSelected} />
                    <Focusable style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} flow-children="horizontal">
                        <DialogButton style={{ width: '50%', minWidth: 0 }} onClick={() => route.changePage('home')}><MdHome /></DialogButton>
                        <DialogButton onClick={() => showModal(<TextFieldModal label="Search" placeholder="Search by station name or artists" onClosed={onSearchModalClosed} />, window)} style={{ width: '50%', minWidth: 0 }}><MdSearch /></DialogButton>
                    </Focusable>
                </div>
            </PanelSection>
        )
    }
    else {
        return null;
    }
};