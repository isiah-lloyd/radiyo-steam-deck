import { Station } from "./interfaces";

export let currentStation: Station | null;

export const setCurrentStation = (station: Station) => {
    currentStation = station;
}
export const clearCurrentStation = () => {
    currentStation = null;
}
export const player = new Audio();
