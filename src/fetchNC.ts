import { ServerAPI } from "decky-frontend-lib";

let server: ServerAPI;
export function setServer(s: ServerAPI) {
    server = s;
}
export const fetchNC = async (url: string, customStation: boolean = false) => {
    const response = await (await server.callPluginMethod("fetch", { url, customStation })).result as { body: string, headers: object, status: number, error?: string }
    if (response.status === 200) {
        return {
            response,
            json: () => JSON.parse(response.body)
        };
    }
    else {
        console.error(`error while fetching ${url}`);
        if (response.error) {
            console.error(response.error);
            throw new Error(response.error)
        }
        else {
            throw new Error(`There was an error while fetching data`);
        }
    }
}
export const getRedirect = async (url: string): Promise<string> => {
    const newUrl = await (await server.callPluginMethod("getRedirectUrl", { url })).result as { response?: string, error?: string };
    if (newUrl.response) {
        return newUrl.response;
    }
    else {
        throw new Error(newUrl.error);
    }
}
