'use client';

import { useEffect, useState } from 'react';
import { searchArtist, ItunesCollection } from '../services/musickit';

export type FilterMode = 'all' | 'classic' | 'special';

const FOLGE_PATTERN = /Folge\s+(\d+)/i;
// Spin-offs that also use the "Folge X" naming but aren't core series episodes.
const SPINOFF_PATTERN = /Minis|Gute\s*-?\s*Nacht|Schäfchenwolken|Box/i;

const getFolgeNumber = (name: string) => {
    const match = name.match(FOLGE_PATTERN);
    return match ? parseInt(match[1], 10) : 999999;
};

const isClassicEpisode = (name: string) => FOLGE_PATTERN.test(name) && !SPINOFF_PATTERN.test(name);

/**
 * Shared fetch/dedupe/sort logic for series that follow the classic
 * "Folge X" numbering (Bibi Blocksberg, Bibi & Tina, Benjamin Blümchen, ...).
 */
export function useClassicSeries(artistName: string) {
    const [episodes, setEpisodes] = useState<ItunesCollection[]>([]);
    const [filteredEpisodes, setFilteredEpisodes] = useState<ItunesCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterMode, setFilterMode] = useState<FilterMode>('all');

    useEffect(() => {
        let cancelled = false;

        const fetchEpisodes = async () => {
            try {
                // Fetch a large number to ensure we cover everything, including re-releases
                const results = await searchArtist(artistName, 600);
                if (cancelled) return;

                if (!results || results.length === 0) {
                    setEpisodes([]);
                    return;
                }

                const uniqueById = Array.from(new Map(results.map(item => [item.collectionId, item])).values());

                // One entry per episode number, preferring the "Hörspiele" genre release.
                const classicsMap = new Map<number, ItunesCollection>();
                const others: ItunesCollection[] = [];

                uniqueById.forEach(item => {
                    const name = item.collectionName;
                    const match = name.match(FOLGE_PATTERN);

                    if (match && !SPINOFF_PATTERN.test(name)) {
                        const episodeNum = parseInt(match[1], 10);
                        const existing = classicsMap.get(episodeNum);
                        if (!existing || (item.primaryGenreName === 'Hörspiele' && existing.primaryGenreName !== 'Hörspiele')) {
                            classicsMap.set(episodeNum, item);
                        }
                    } else {
                        others.push(item);
                    }
                });

                const sortedClassics = Array.from(classicsMap.values())
                    .sort((a, b) => getFolgeNumber(a.collectionName) - getFolgeNumber(b.collectionName));

                const uniqueOthers = others.filter((item, index, self) =>
                    index === self.findIndex(t => t.collectionName === item.collectionName)
                );

                const cleanList = [...sortedClassics, ...uniqueOthers]
                    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

                setEpisodes(cleanList);
            } catch (err) {
                console.error('Failed to fetch episodes', err);
                if (!cancelled) setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchEpisodes();
        return () => {
            cancelled = true;
        };
    }, [artistName]);

    useEffect(() => {
        if (filterMode === 'all') {
            setFilteredEpisodes(episodes);
        } else if (filterMode === 'classic') {
            setFilteredEpisodes(
                episodes
                    .filter(ep => isClassicEpisode(ep.collectionName))
                    .sort((a, b) => getFolgeNumber(a.collectionName) - getFolgeNumber(b.collectionName))
            );
        } else {
            setFilteredEpisodes(episodes.filter(ep => !isClassicEpisode(ep.collectionName)));
        }
    }, [filterMode, episodes]);

    return { filteredEpisodes, loading, error, filterMode, setFilterMode };
}
