import { NowPlaying } from './interfaces';

export class SpliceMetadata extends TransformStream<Uint8Array, Uint8Array> {
    private META_INT: number;
    private byteCounter = 0;
    private iterator = 0;
    private tempBuffer = '';
    private updateFn: (song: NowPlaying | string) => void;
    constructor(META_INT: number, fn: (song: NowPlaying | string) => void, opts?: any) {
        super({ ...opts });
        this.META_INT = META_INT;
        this.updateFn = fn;
    }
    /**
     * Metadata comes in this format " StreamTitle='Artist - Song';"
     * This function splits the song and artist into a readable format
     * @param raw Metadata coming straight from the buffer
     */
    private extractSongTitle(raw: string): NowPlaying | string | null {
        console.debug(raw);
        const rawProc: string = raw.split('StreamTitle=\'')[1].split('\';')[0];
        if (raw.includes('adContext=')) {
            return 'Advertisement';
        }
        if (raw.includes('durationMilliseconds=')) {
            const durationMs = raw.split('durationMilliseconds=\'')[1].split('\'')[0];
            let durationS = 0;
            if (durationMs) {
                durationS = Math.round(parseInt(durationMs) / 1000);
            }
            if (raw.includes('insertionType=\'preroll\'')) {
                return `Station pre roll ad, your music will begin shortly - Duration: ${durationS}s`;
            }
            else {
                return `Station advertisement - Duration: ${durationS}s`;
            }
        }
        const np: NowPlaying = {} as NowPlaying;
        if (rawProc.includes('song_spot')) {
            // we are in iheartmedia land :(
            const split = rawProc.split(' - text="');
            np.artist = split[0];
            np.title = split[1].split('"')[0];
            return np;
        }
        const numOfDash = rawProc.replace(/[^-]/g, '').length;
        // If there's more than one dash, we don't know if its part of the song title
        // or splitting the artist and song, so lets just return a string and be easy
        if (numOfDash == 1) {
            const splitData = rawProc.split('-');
            np.title = splitData[1].trim();
            np.artist = splitData[0].trim();
            return np;
        }
        else if (rawProc !== '') {
            return rawProc;
        }
        else {
            return null;
        }
    }
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController): void {
        console.log(chunk);
        // const hexArray = chunk.toString('hex').match(/.{2}/g);
        // let filteredChunk = '';
        // chunk.forEach((byte, index) => {
        //     if (this.byteCounter === this.META_INT) {
        //         this.byteCounter = 0;
        //         this.iterator = byte * 16;
        //     }
        //     else if (this.iterator > 0) {
        //         this.iterator--;
        //         if (byte !== 0) {
        //             if (hexArray) {
        //                 this.tempBuffer += hexArray[index];
        //             }
        //         }
        //         if (this.iterator === 0) {
        //             const songTitle = this.extractSongTitle(Buffer.from(this.tempBuffer, 'hex').toString('utf8'));
        //             if (songTitle) { this.updateFn(songTitle); }
        //             this.tempBuffer = '';
        //         }
        //     }
        //     else {
        //         if (hexArray) {
        //             filteredChunk += hexArray[index];
        //             this.byteCounter++;
        //         }
        //     }
        // });
        // controller.enqueue(Buffer.from(filteredChunk, 'hex'));
    }
}