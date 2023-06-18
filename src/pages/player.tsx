import {
    PanelSection,
    DialogButton,
    Spinner,
    SliderField,
    Focusable,
    PanelSectionRow,
} from "decky-frontend-lib";
import React, { ReactEventHandler, SyntheticEvent, useEffect, useRef, useState, VFC } from "react";
import { MdHome, MdPause, MdPlayArrow, MdStar, MdStarOutline, MdStop, MdVolumeUp } from "react-icons/md";
import { ErrorBox } from "../errorBox";
import { getRedirect } from "../fetchNC";
import { Route, Station } from "../interfaces";
import storage from "../storage";
import logo from "../../images/logo.png"
import { clearCurrentStation, currentStation, player, setCurrentStation } from "../playerController";

type PLAYER_STATUS = 'PLAYING' | 'PAUSED' | 'BUFFERING';
const smallButtonStyle: React.CSSProperties = {
    marginBottom: '1rem',
}
const centerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center"
}
const metadata: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    gap: "10px"
}
const imageContainer: React.CSSProperties = {
    position: "relative",
    maxWidth: "60%",
    alignSelf: 'center',
}
const imageOverlay: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'none',
}
export const Player: VFC<{ station: Station, route: Route }> = ({ station, route }) => {
    const [playerStatus, setPlayerStatus] = useState<PLAYER_STATUS>('BUFFERING');
    const [volume, setVolume] = useState<number>(100);
    const [isFav, setIsFav] = useState<boolean>();
    const [errorMsg, setErrorMsg] = useState<string>();
    const setAudioSrc = async () => {
        try {
            player.src = await getRedirect(station.streamDownloadURL);
        }
        catch (e: any) {
            setErrorMsg(e.message);
        }
        player.load();
        player.play();
    }
    const playButtonIcon = () => {
        switch (playerStatus) {
            case 'PLAYING':
                return <MdStop />
            case 'PAUSED':
            default:
                return <MdPlayArrow />
        }
    }
    const changePlayerState = () => {
        switch (playerStatus) {
            case 'PLAYING':
                player.pause();
                clearCurrentStation();
                break;
            case 'PAUSED':
                player.play();
                break;
        }
    }
    const onPlayerError = (e: Event) => {
        const target = e.target as HTMLAudioElement;
        let msg = "";
        if (target.error) {
            switch (target.error.code) {
                case MediaError.MEDIA_ERR_NETWORK:
                    msg += 'A network issue occurred while fetching audio.'
                    break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    msg += 'The format of this stream is not supported.'
                    break;
                default:
                    msg += 'There was an issue while fetching audio.'
                    break;
            }
            msg += `\nErr: ${target.error.code} ${target.error.message}\nURL: ${target.currentSrc}`
            setErrorMsg(msg);
        }
    }
    const onImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = logo;
    }
    const setFav = () => {
        if (isFav) {
            storage.rmvFav(station);
            setIsFav(false);
        } else {
            storage.addFav(station);
            setIsFav(true);
        }
    }
    const changeVolume = (volume: number) => {
        const normalizedVolume = (volume / 100.0)
        player.volume = normalizedVolume;
        setVolume(volume);
    }
    useEffect(() => {
        player.addEventListener('play', () => setPlayerStatus('PLAYING'));
        player.addEventListener('playing', () => setPlayerStatus('PLAYING'));
        player.addEventListener('loadeddata', () => setPlayerStatus('PLAYING'));
        player.addEventListener('pause', () => setPlayerStatus('PAUSED'));
        player.addEventListener('ended', () => setPlayerStatus('PAUSED'));
        player.addEventListener('waiting', () => setPlayerStatus('BUFFERING'));
        player.addEventListener('stalled', () => setPlayerStatus('BUFFERING'));
        player.addEventListener('error', onPlayerError)

    }, [])
    useEffect(() => {
        if (station) {
            setErrorMsg(undefined);
            if (!currentStation || currentStation && currentStation.streamDownloadURL !== station.streamDownloadURL) {
                setAudioSrc();
                setIsFav(storage.isFav(station));
            }
            else if (player) {
                setPlayerStatus('PLAYING')
            }
            setCurrentStation(station);
        }
    }, [station]);
    return (
        <div>
            {route.page === 'player' ? (
                <PanelSection>
                    {errorMsg ? <ErrorBox msg={errorMsg} /> :
                        <DialogButton style={smallButtonStyle} onClick={changePlayerState}>{playButtonIcon()}</DialogButton>
                    }
                    <SliderField value={volume} min={0} max={100} step={1} icon={<MdVolumeUp />} onChange={changeVolume} bottomSeparator="none" />
                    <div style={centerStyle}>
                        <div style={imageContainer}>
                            <img onError={onImageError} style={{ width: '100%' }} src={station.image ?? logo} />
                            <Spinner style={playerStatus === 'BUFFERING' ? { ...imageOverlay, display: 'block' } : imageOverlay} />
                        </div>
                        <div style={metadata}>
                            <p>{station.text}</p>
                        </div>
                        <Focusable style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} flow-children="horizontal">
                            <DialogButton style={{ width: '50%', minWidth: 0 }} onClick={() => route.changePage('home')}><MdHome /></DialogButton>
                            <DialogButton onClick={setFav} style={{ width: '50%', minWidth: 0 }}>{isFav ? <MdStar /> : <MdStarOutline />}</DialogButton>
                        </Focusable>
                    </div>
                </PanelSection>
            ) : null}
        </div>
    )

};