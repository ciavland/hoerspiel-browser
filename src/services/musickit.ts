
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

            console.log(`Fetching ${term}: offset=${offset}, limit=${currentLimit}`);
            const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch from iTunes API');
            }
            const data = await response.json();
            const results = data.results as ItunesCollection[];

            if (!results || results.length === 0) {
                break;
            }

            // Filter out existing IDs to prevent duplicates
            const existingIds = new Set(allResults.map(r => r.collectionId));
            const newResults = results.filter(r => !existingIds.has(r.collectionId));

            if (newResults.length === 0 && results.length > 0) {
                // We got results but they were all duplicates. Stop to prevent infinite loop.
                console.log(`Stopped fetching ${term} at offset ${offset} due to duplicate results.`);
                break;
            }

            allResults = [...allResults, ...newResults];
            offset += results.length;

            // Only break if we get 0 results. 
            // Warning: some APIs return fewer than limit even if more pages exist (e.g. strict filtering).
            // However, to prevent infinite loops if the API returns identical data despite offset,
            // we rely on 'offset' increasing.
            if (results.length === 0) {
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
