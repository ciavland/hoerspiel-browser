'use client';

import { useEffect, useState } from 'react';
import { searchArtist, ItunesCollection } from '../../services/musickit';
import AudioPlayCard from '../../components/AudioPlayCard';
import Link from 'next/link';
import { ArrowLeft, Grid, List as ListIcon, Filter, ExternalLink } from 'lucide-react';

export default function BenjaminBluemchenPage() {
    const [episodes, setEpisodes] = useState<ItunesCollection[]>([]);
    const [filteredEpisodes, setFilteredEpisodes] = useState<ItunesCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [filterMode, setFilterMode] = useState<'all' | 'classic' | 'special'>('all');

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                const results = await searchArtist('Benjamin Blümchen', 200);

                if (results && results.length > 0) {
                    const sorted = results.sort((a, b) => {
                        const getEpisodeNumber = (name: string) => {
                            const match = name.match(/Folge\s+(\d+)/i);
                            return match ? parseInt(match[1], 10) : 999999;
                        };
                        const numA = getEpisodeNumber(a.collectionName);
                        const numB = getEpisodeNumber(b.collectionName);
                        return numA - numB;
                    });
                    setEpisodes(sorted);
                    setFilteredEpisodes(sorted);
                }
            } catch (error) {
                console.error('Failed to fetch episodes', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEpisodes();
    }, []);

    useEffect(() => {
        const isClassic = (name: string) => {
            // Must contain "Folge X" 
            const hasFolge = /Folge\s+\d+/.test(name);

            // AND NOT contain "Minis" or "Gute Nacht" (various spellings)
            // Covers: "Benjamin Minis", "Gute-Nacht-Geschichten", "Schäfchenwolken" (Folge 30 special)
            const isSpecial = /Minis|Gute\s*-?\s*Nacht|Schäfchenwolken/i.test(name);

            return hasFolge && !isSpecial;
        };

        if (filterMode === 'all') {
            setFilteredEpisodes(episodes);
        } else if (filterMode === 'classic') {
            setFilteredEpisodes(episodes.filter(ep => isClassic(ep.collectionName)));
        } else if (filterMode === 'special') {
            setFilteredEpisodes(episodes.filter(ep => !isClassic(ep.collectionName)));
        }
    }, [filterMode, episodes]);

    return (
        <div className="space-y-8">
            <header className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors w-fit">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Zurück
                    </Link>

                    <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <ListIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">
                            Benjamin Blümchen
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {filteredEpisodes.length} Folgen gefunden
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <button
                                onClick={() => setFilterMode('all')}
                                className={`text-sm font-medium transition-colors ${filterMode === 'all' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Alle
                            </button>
                            <span className="text-gray-600">|</span>
                            <button
                                onClick={() => setFilterMode('classic')}
                                className={`text-sm font-medium transition-colors ${filterMode === 'classic' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Klassiker
                            </button>
                            <span className="text-gray-600">|</span>
                            <button
                                onClick={() => setFilterMode('special')}
                                className={`text-sm font-medium transition-colors ${filterMode === 'special' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Specials
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-800"></div>
                    ))}
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {filteredEpisodes.map((episode) => (
                                <div key={episode.collectionId} className="w-full">
                                    <AudioPlayCard album={episode} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-gray-800 text-xs uppercase text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 w-16">Cover</th>
                                        <th scope="col" className="px-4 py-3">Titel</th>
                                        <th scope="col" className="px-4 py-3 hidden sm:table-cell">Erschienen</th>
                                        <th scope="col" className="px-4 py-3 text-right">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredEpisodes.map((episode) => (
                                        <tr key={episode.collectionId} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-800">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={episode.artworkUrl100}
                                                        alt={episode.collectionName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-white text-base">
                                                {episode.collectionName}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                                                {new Date(episode.releaseDate).getFullYear()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <a
                                                    href={episode.collectionViewUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-400 hover:text-blue-300"
                                                >
                                                    <span className="mr-2 hidden sm:inline">Apple Music</span>
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
