import { ServerAPI } from "decky-frontend-lib";

let server: ServerAPI;
export function setServer(s: ServerAPI) {
    server = s;
}
export const fetchNC = async (url: string) => {
    //TODO: returns string when erroed. catch that.
    const response = await (await server.fetchNoCors(url,
        {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            }
        })).result as { body: string, headers: object, status: number }
    if (response.status === 200) {
        return {
            response,
            json: () => JSON.parse(response.body)
        };
    }
    else {
        console.error(`error while fetching ${url}`);
        console.error(response);
        throw new Error(`There was an error while fetching data`);
    }
}
export const getRedirect = async (url: string): Promise<string> => {
    const newUrl = await (await server.callPluginMethod("getRedirectUrl", { url })).result as { response?: string, error?: string };
    if (newUrl.response) {
        return newUrl.response;
    }
    else {
        throw new Error(`Error while trying to open stream for ${url}`);
    }
}
