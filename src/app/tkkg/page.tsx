'use client';

import { useEffect, useState } from 'react';
import { searchArtist, ItunesCollection } from '../../services/musickit';
import SeriesPage from '../../components/SeriesPage';
import { FilterMode } from '../../hooks/useClassicSeries';

const isClassicTkkg = (artistName: string) => artistName === 'TKKG' || artistName === 'TKKG Retro-Archiv';

const getEpisodeNumber = (name: string) => {
    // Try standard "Folge X" or "TKKG X"
    const matchStandard = name.match(/(?:Folge|TKKG)\s*(\d+)/i);
    if (matchStandard) return parseInt(matchStandard[1], 10);

    // Try "003/Title" format
    const matchSlash = name.match(/^(\d+)\//);
    if (matchSlash) return parseInt(matchSlash[1], 10);

    return 999999;
};

export default function TkkgPage() {
    const [episodes, setEpisodes] = useState<ItunesCollection[]>([]);
    const [filteredEpisodes, setFilteredEpisodes] = useState<ItunesCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterMode, setFilterMode] = useState<FilterMode>('all');

    useEffect(() => {
        let cancelled = false;

        const fetchEpisodes = async () => {
            try {
                // Fetch all three sources in parallel; the shared concurrency
                // limiter in musickit.ts still throttles the underlying requests.
                const [tkkg, retro, junior] = await Promise.all([
                    searchArtist('TKKG', 600),
                    searchArtist('TKKG Retro-Archiv', 600),
                    searchArtist('TKKG Junior', 200),
                ]);
                if (cancelled) return;

                // Combine and deduplicate by collectionId
                const allResults = [...(tkkg || []), ...(retro || []), ...(junior || [])];
                const uniqueResults = Array.from(new Map(allResults.map(item => [item.collectionId, item])).values());

                const sorted = uniqueResults.sort((a, b) => {
                    const numA = getEpisodeNumber(a.collectionName);
                    const numB = getEpisodeNumber(b.collectionName);

                    // If both have numbers, sort by number
                    if (numA !== 999999 && numB !== 999999) return numA - numB;

                    // Numbered episodes come before unnumbered ones (specials)
                    if (numA !== 999999) return -1;
                    if (numB !== 999999) return 1;

                    // Fallback to release date if no number
                    return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                });

                setEpisodes(sorted);
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
    }, []);

    useEffect(() => {
        if (filterMode === 'all') {
            setFilteredEpisodes(episodes);
        } else if (filterMode === 'classic') {
            setFilteredEpisodes(episodes.filter(ep => isClassicTkkg(ep.artistName)));
        } else {
            setFilteredEpisodes(episodes.filter(ep => !isClassicTkkg(ep.artistName)));
        }
    }, [filterMode, episodes]);

    return (
        <SeriesPage
            title="TKKG"
            episodes={filteredEpisodes}
            loading={loading}
            error={error}
            filterMode={filterMode}
            onFilterChange={setFilterMode}
        />
    );
}
