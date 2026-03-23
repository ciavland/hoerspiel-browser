
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
    const allResults: ItunesCollection[] = [];
    const fetchLimit = 200; // Max per request

    try {
        // Collect search queries needed to bypass the 200 limit for long series.
        // We always search the base term (fetches popular specials/newest).
        const termsToSearch = [term];

        // If requesting more than 200, we use smaller query buckets to prevent any single query from
        // exceeding the 200 result limit. E.g. "Folge 1" matches 1, 10-19, 100-199 and easily hits 200.
        if (limit > 200) {
            for (let i = 1; i <= 9; i++) {
                termsToSearch.push(`${term} Folge ${i}`);
            }
            // Decades 10 to 25 cover up to Folge 259. 
            // E.g., "Folge 16" catches 16, 160-169 without hitting the limit, rescuing items like 169.
            for (let i = 10; i <= 25; i++) {
                termsToSearch.push(`${term} Folge ${i}`);
            }
        }

        // Batch execution of queries to prevent overwhelming iOS Safari concurrent connection limits
        const fetchSearch = async (searchQuery: string) => {
            const params = new URLSearchParams({
                term: searchQuery,
                country: 'DE',
                media: 'music',
                entity: 'album',
                limit: Math.min(limit, fetchLimit).toString()
            });

            try {
                const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`);
                if (!response.ok) return [];
                const data = await response.json();
                return (data.results || []) as ItunesCollection[];
            } catch (err) {
                console.error(`Failed to fetch ${searchQuery}:`, err);
                return [];
            }
        };

        const resultsArrays: ItunesCollection[][] = [];
        const chunkSize = 4; // Max 4 concurrent requests per artist call
        for (let i = 0; i < termsToSearch.length; i += chunkSize) {
            const chunk = termsToSearch.slice(i, i + chunkSize);
            const chunkResults = await Promise.all(chunk.map(fetchSearch));
            resultsArrays.push(...chunkResults);
        }

        // Flatten and deduplicate by collectionId
        const seenIds = new Set<number>();
        for (const results of resultsArrays) {
            for (const r of results) {
                if (!seenIds.has(r.collectionId)) {
                    seenIds.add(r.collectionId);
                    allResults.push(r);
                }
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
