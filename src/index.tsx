import {
  definePlugin,
  DialogButton,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import { MdMusicNote, MdOutlineRadio, MdVolumeUp } from "react-icons/md";
import { setServer } from "./fetchNC";
import { Pages, Route, Station } from "./interfaces";
import { Home } from "./pages/home";
import { Player } from "./pages/player";
import { SearchResults } from "./pages/searchResults";
import { RadioPlayer } from "./RadioPlayer";
import storage from "./storage";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  setServer(serverAPI);
  const [searchText, setSearchText] = useState('');
  const [station, setStation] = useState<Station>();
  const [route, setRoute] = useState<Route>({ page: 'home', changePage: changePage });
  const onSearch = async (query: string) => {
    setSearchText(query);
    changePage('search_results');
  }
  const onStationSelected = async (station: Station) => {
    setSearchText('');
    if (station.id && !station.streamDownloadURL) {
      //got incomplete station data (from topsongs), get full station
      station = await RadioPlayer.searchByStationId(station.id)
    }
    setStation(station);
    storage.pushRecentlyPlayed(station);
    changePage('player');
  }
  function changePage(page: Pages) {
    setRoute((route) => ({ ...route, page: page }));
  }

  return (
    <div>
      {station && route.page === 'home' ? <DialogButton style={{ backgroundColor: '#66c0f4' }} onClick={() => changePage('player')}><MdMusicNote />{station.text}</DialogButton> : null}
      <Home onSearch={onSearch} onStationSelected={onStationSelected} route={route} />
      {station ? <Player station={station} route={route} /> : null}
      <SearchResults query={searchText} onStationSelected={onStationSelected} route={route} />
    </div>
  )
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>RadiYo!</div>,
    alwaysRender: true,
    content: <Content serverAPI={serverApi} />,
    icon: <MdOutlineRadio />,
  };
});

