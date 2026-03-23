
// Replacement for MusicKit service using public iTunes Search API

const queryCache = new Map<string, ItunesCollection[]>();
let activeRequests = 0;
const MAX_CONCURRENT = 5;
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

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
    const cacheKey = `${term}_${limit}`;
    if (queryCache.has(cacheKey)) {
        return queryCache.get(cacheKey)!;
    }

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
        } else {
            // For homepage (<200 limit), we avoid 104 queries to dodge Apple HTTP 429.
            // To fill any "gaps" in the newest top 20 (since newer episodes are sometimes less popular 
            // than classics), we minimally fetch "Folge 1" (covers 100-199) and "Folge 2" (covers 200-299).
            // This is just 3 queries total per artist instead of 26, easily rendering the full newest gapless.
            termsToSearch.push(`${term} Folge 1`);
            termsToSearch.push(`${term} Folge 2`);
        }

        // Global concurrency throttler to prevent overwhelming iOS Safari and Apple API Rate Limits
        const fetchSearch = async (searchQuery: string) => {
            while (activeRequests >= MAX_CONCURRENT) {
                await delay(50 + Math.random() * 50); // small jitter prevents race conditions
            }
            activeRequests++;

            const params = new URLSearchParams({
                term: searchQuery,
                country: 'DE',
                media: 'music',
                entity: 'album',
                limit: Math.min(limit, fetchLimit).toString()
            });

            try {
                const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`);
                if (!response.ok) {
                    if (response.status === 429) {
                        console.warn(`Rate limit hit for ${searchQuery}.`);
                        await delay(1000);
                    }
                    return [];
                }
                const data = await response.json();
                return (data.results || []) as ItunesCollection[];
            } catch (err) {
                console.error(`Failed to fetch ${searchQuery}:`, err);
                return [];
            } finally {
                activeRequests--;
            }
        };

        const resultsArrays: ItunesCollection[][] = [];
        // Fire all queries simultaneously, the while-loop queue handles safe consecutive throttling!
        const allChunkResults = await Promise.all(termsToSearch.map(fetchSearch));
        resultsArrays.push(...allChunkResults);

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

        queryCache.set(cacheKey, allResults);
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
