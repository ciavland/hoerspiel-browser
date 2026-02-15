
// Replacement for MusicKit service using public iTunes Search API

export interface ItunesCollection {
    collectionId: number;
    artistName: string;
    collectionName: string;
    artworkUrl100: string;
    collectionViewUrl: string;
    releaseDate: string;
    primaryGenreName: string;
    previewUrl?: string; // Not usually on albums, but present on tracks
}

export const searchAudioPlays = async (term: string, limit = 20) => {
    let allResults: ItunesCollection[] = [];
    let offset = 0;
    const fetchLimit = 200; // Max per request

    try {
        while (allResults.length < limit) {
            const currentLimit = Math.min(fetchLimit, limit - allResults.length);
            const params = new URLSearchParams({
                term,
                country: 'DE',
                media: 'music',
                entity: 'album',
                limit: currentLimit.toString(),
                offset: offset.toString()
            });

            const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch from iTunes API');
            }
            const data = await response.json();
            const results = data.results as ItunesCollection[];

            if (!results || results.length === 0) {
                break;
            }

            allResults = [...allResults, ...results];
            offset += results.length;

            // If we got fewer results than requested, we've reached the end
            if (results.length < currentLimit) {
                break;
            }
        }
        return allResults;
    } catch (error) {
        console.error('iTunes API Error:', error);
        return allResults; // Return what we have so far
    }
};

export const searchArtist = async (artistName: string, limit = 20) => {
    return searchAudioPlays(artistName, limit);
};

export const initializeMusicKit = async () => {
    // no-op, kept for component compatibility if mistakenly called
    return null;
};
