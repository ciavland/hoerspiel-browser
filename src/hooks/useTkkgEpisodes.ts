'use client';

import { useEffect, useMemo, useState } from 'react';
import { searchArtist, ItunesCollection } from '../services/musickit';
import { dedupeById } from '../lib/episodeUtils';
import { FilterMode } from './useClassicSeries';

const CLASSIC_ARTISTS = new Set(['TKKG', 'TKKG Retro-Archiv']);

const getEpisodeNumber = (name: string): number => {
    // Try standard "Folge X" or "TKKG X"
    const matchStandard = name.match(/(?:Folge|TKKG)\s*(\d+)/i);
    if (matchStandard) return parseInt(matchStandard[1], 10);

    // Try "003/Title" format
    const matchSlash = name.match(/^(\d+)\//);
    if (matchSlash) return parseInt(matchSlash[1], 10);

    return 999999;
};

export function useTkkgEpisodes() {
    const [episodes, setEpisodes] = useState<ItunesCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<FilterMode>('all');

    useEffect(() => {
        let cancelled = false;

        const fetchEpisodes = async () => {
            try {
                // Sequential fetching to respect Apple API rate limits.
                // Each call uses the global concurrency limiter in musickit.ts.
                const tkkg = await searchArtist('TKKG', 600);
                const retro = await searchArtist('TKKG Retro-Archiv', 600);
                const junior = await searchArtist('TKKG Junior', 200);
                if (cancelled) return;

                const uniqueResults = dedupeById([...(tkkg || []), ...(retro || []), ...(junior || [])]);

                if (uniqueResults.length > 0) {
                    const sorted = [...uniqueResults].sort((a, b) => {
                        const numA = getEpisodeNumber(a.collectionName);
                        const numB = getEpisodeNumber(b.collectionName);

                        // If both have numbers, sort by number
                        if (numA !== 999999 && numB !== 999999) return numA - numB;

                        // If one has number and other doesn't, prioritize the numbered one
                        if (numA !== 999999) return -1;
                        if (numB !== 999999) return 1;

                        // Fallback to release date if no number
                        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                    });
                    setEpisodes(sorted);
                }
            } catch (error) {
                console.error('Failed to fetch episodes', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchEpisodes();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredEpisodes = useMemo(() => {
        // Klassiker: "TKKG" or "TKKG Retro-Archiv" (filtered by artist name)
        if (filterMode === 'classic') return episodes.filter((ep) => CLASSIC_ARTISTS.has(ep.artistName));
        if (filterMode === 'special') return episodes.filter((ep) => !CLASSIC_ARTISTS.has(ep.artistName));
        return episodes;
    }, [episodes, filterMode]);

    return { filteredEpisodes, loading, filterMode, setFilterMode };
}
