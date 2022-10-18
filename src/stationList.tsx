import {
    Focusable,
} from "decky-frontend-lib";
import { VFC } from "react";
import { MdMusicNote } from "react-icons/md";
import { Station } from "./interfaces";
const customButton: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    verticalAlign: 'center',
    textAlign: 'center',
    background: '#23262e',
    color: '#dcdedf',
    borderRadius: '2px',
    marginTop: '1rem',
    maxHeight: '69px',
    minHeight: '60px',
    fontSize: '.9rem'
}
export const StationList: VFC<{ stations: Station[], onStationSelected: (T: Station) => void }> = ({ stations, onStationSelected }) => {
    return (
        <div>
            {/*Sad hack to get focus style on custom buttons */}
            <style>
                {`.gpfocus > .stationButton {
                    background: #fff !important;
                    color: #23262e !important;
                    outline: none !important;
                }
                `}
            </style>
            {stations.map(station => (
                <Focusable onActivate={() => onStationSelected(station)}>
                    <div className="stationButton" style={customButton}>
                        <h3 style={{ margin: 0 }}>{station.text}</h3>
                        {station.nowPlaying?.title ? (
                            <p style={{ margin: 0 }}><MdMusicNote />{station.nowPlaying.artist} - {station.nowPlaying.title}</p>
                        ) : null}
                    </div>
                </Focusable>
            ))}
        </div>
    )
};