'use client';

import { useEffect, useState } from 'react';
import Section from '../components/Section';
import { searchArtist, ItunesCollection } from '../services/musickit';
import { parseFolgeNumber } from '../lib/episodeUtils';

interface SeriesConfig {
    key: string;
    title: string;
    href: string;
    fetchTerms: string[];
    isClassic: (name: string) => boolean;
}

// TKKG uses "TKKG 183 - Title" or "Folge 183" format
const isClassicTkkg = (name: string) => /(?:TKKG|Folge)\s+\d+/.test(name);

const isSpinOff = (name: string) => /Minis|Gute\s*-?\s*Nacht|Schäfchenwolken|Box/i.test(name);
const isClassic = (name: string) => /Folge\s+\d+/.test(name) && !isSpinOff(name);

const getEpisodeNum = (name: string) => {
    // Handle "TKKG 183 - ..." format first
    const matchTkkg = name.match(/TKKG\s+(\d+)/i);
    if (matchTkkg) return parseInt(matchTkkg[1], 10);
    // Standard "Folge 183"
    return parseFolgeNumber(name) ?? 0;
};

const SERIES: SeriesConfig[] = [
    { key: 'tkkg', title: 'TKKG', href: '/tkkg', fetchTerms: ['TKKG', 'TKKG Retro-Archiv'], isClassic: isClassicTkkg },
    { key: 'benjamin', title: 'Benjamin Blümchen', href: '/benjamin-bluemchen', fetchTerms: ['Benjamin Blümchen'], isClassic },
    { key: 'bibi', title: 'Bibi Blocksberg', href: '/bibi-blocksberg', fetchTerms: ['Bibi Blocksberg'], isClassic },
    { key: 'bibitina', title: 'Bibi & Tina', href: '/bibi-tina', fetchTerms: ['Bibi und Tina'], isClassic },
];

export default function Home() {
    const [seriesEpisodes, setSeriesEpisodes] = useState<Record<string, ItunesCollection[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetching, one entry per series
                const entries = await Promise.all(
                    SERIES.map(async ({ key, fetchTerms, isClassic: isSeriesClassic }) => {
                        const results = await Promise.all(fetchTerms.map((term) => searchArtist(term, 200)));
                        const merged = Array.from(
                            new Map(results.flat().map((item) => [item.collectionId, item])).values()
                        );
                        const sorted = merged
                            .filter((item) => isSeriesClassic(item.collectionName))
                            .sort((a, b) => getEpisodeNum(b.collectionName) - getEpisodeNum(a.collectionName))
                            .slice(0, 20);
                        return [key, sorted] as const;
                    })
                );
                setSeriesEpisodes(Object.fromEntries(entries));
            } catch (err) {
                console.error(err);
                setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex flex-col space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                    Hörspiele entdecken
                </h1>
                <p className="text-gray-400">
                    Die besten deutschen Hörspiele an einem Ort.
                </p>
            </header>

            {error && (
                <div className="rounded-lg bg-red-900/50 p-4 text-red-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="mb-4 h-8 w-48 rounded bg-gray-800"></div>
                            <div className="flex space-x-4 overflow-hidden">
                                {[1, 2, 3, 4, 5].map((j) => (
                                    <div key={j} className="h-40 w-40 flex-shrink-0 rounded-lg bg-gray-800"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                SERIES.map(({ key, title, href }) => (
                    <Section key={key} title={title} href={href} items={seriesEpisodes[key] || []} />
                ))
            )}
        </div>
    );
}
