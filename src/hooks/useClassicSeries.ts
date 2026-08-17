'use client';

import { useEffect, useMemo, useState } from 'react';
import { searchArtist, ItunesCollection } from '../services/musickit';
import { dedupeById, dedupeByName, isClassicTitle, isSpinOffTitle, parseFolgeNumber } from '../lib/episodeUtils';

export type FilterMode = 'all' | 'classic' | 'special';

// Shared fetch/dedupe/classify logic for series that are numbered as "Folge X"
// (Benjamin Blümchen, Bibi Blocksberg, Bibi & Tina). TKKG has its own hook since
// its numbering and classic/special split work differently.
export function useClassicSeries(artistName: string, fetchLimit = 600) {
    const [episodes, setEpisodes] = useState<ItunesCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<FilterMode>('all');

    useEffect(() => {
        let cancelled = false;

        const fetchEpisodes = async () => {
            try {
                const results = await searchArtist(artistName, fetchLimit);
                if (cancelled || !results || results.length === 0) return;

                const uniqueById = dedupeById(results);

                // One entry per episode number, preferring the "Hörspiele" genre release.
                const classicsMap = new Map<number, ItunesCollection>();
                const others: ItunesCollection[] = [];

                for (const item of uniqueById) {
                    const episodeNum = parseFolgeNumber(item.collectionName);
                    if (episodeNum !== null && !isSpinOffTitle(item.collectionName)) {
                        const existing = classicsMap.get(episodeNum);
                        if (!existing || (item.primaryGenreName === 'Hörspiele' && existing.primaryGenreName !== 'Hörspiele')) {
                            classicsMap.set(episodeNum, item);
                        }
                    } else {
                        others.push(item);
                    }
                }

                const sortedClassics = Array.from(classicsMap.values()).sort(
                    (a, b) => (parseFolgeNumber(a.collectionName) ?? 0) - (parseFolgeNumber(b.collectionName) ?? 0)
                );
                const uniqueOthers = dedupeByName(others);

                const sortedAll = [...sortedClassics, ...uniqueOthers].sort(
                    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
                );

                setEpisodes(sortedAll);
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
    }, [artistName, fetchLimit]);

    const filteredEpisodes = useMemo(() => {
        if (filterMode === 'classic') {
            return [...episodes]
                .filter((ep) => isClassicTitle(ep.collectionName))
                .sort((a, b) => (parseFolgeNumber(a.collectionName) ?? 999999) - (parseFolgeNumber(b.collectionName) ?? 999999));
        }
        if (filterMode === 'special') {
            return episodes.filter((ep) => !isClassicTitle(ep.collectionName));
        }
        return episodes;
    }, [episodes, filterMode]);

    return { filteredEpisodes, loading, filterMode, setFilterMode };
}
