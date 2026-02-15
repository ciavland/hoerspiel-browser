
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
    const params = new URLSearchParams({
        term,
        country: 'DE',
        media: 'music',
        entity: 'album',
        limit: limit.toString()
    });

    try {
        const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch from iTunes API');
        }
        const data = await response.json();
        return data.results as ItunesCollection[];
    } catch (error) {
        console.error('iTunes API Error:', error);
        return [];
    }
};

export const searchArtist = async (artistName: string, limit = 20) => {
    return searchAudioPlays(artistName, limit);
};

export const initializeMusicKit = async () => {
    // no-op, kept for component compatibility if mistakenly called
    return null;
};
