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
                // Fetch a large number to ensure we cover everything, including re-releases
                const results = await searchArtist('Benjamin Blümchen', 600);

                if (results && results.length > 0) {
                    // 1. Deduplicate by Collection ID first (basic safety)
                    const uniqueById = Array.from(new Map(results.map(item => [item.collectionId, item])).values());

                    // 2. Separate into potential Classics and Specials for more refined processing
                    const classicsMap = new Map<number, ItunesCollection>();
                    const specials: ItunesCollection[] = [];
                    const others: ItunesCollection[] = [];

                    uniqueById.forEach(item => {
                        const name = item.collectionName;
                        const match = name.match(/Folge\s+(\d+)/i);

                        // Exclusion list for things that look like episodes but aren't core series
                        const isSpecial = /Minis|Gute\s*-?\s*Nacht|Schäfchenwolken|Lieder|Box|Weihnacht/i.test(name);

                        if (match && !isSpecial) {
                            const episodeNum = parseInt(match[1], 10);

                            // 3. Strict Deduplication for Classics: One per Episode Number
                            // If we already have this episode number, check if the new one is "better"
                            // Preference: "Hörspiele" genre > others, then maybe newer release date (remastered)
                            const existing = classicsMap.get(episodeNum);
                            if (!existing) {
                                classicsMap.set(episodeNum, item);
                            } else {
                                // Conflict resolution: Prefer "Hörspiele" genre
                                if (item.primaryGenreName === 'Hörspiele' && existing.primaryGenreName !== 'Hörspiele') {
                                    classicsMap.set(episodeNum, item);
                                }
                                // Refine this logic if users want specific versions
                            }
                        } else {
                            if (isSpecial) {
                                specials.push(item);
                            } else {
                                others.push(item); // "Alle" view might want everything, but deduplicated by name?
                            }
                        }
                    });

                    // 4. Sort Classics Numerically
                    const sortedClassics = Array.from(classicsMap.values()).sort((a, b) => {
                        const getNum = (name: string) => parseInt(name.match(/Folge\s+(\d+)/i)![1], 10);
                        return getNum(a.collectionName) - getNum(b.collectionName);
                    });

                    // 5. Store results
                    // For "All", we might want classics + specials, but distinct. 
                    // Let's keep "episodes" as the source of truth, but maybe pre-processed?
                    // Actually, let's just use the clean lists.
                    // But wait, "All" filter currently shows `episodes`. 
                    // Let's reconstruct `episodes` to be the clean set of Classics + Specials + Others (deduped by name)

                    const uniqueOthers = others.filter((item, index, self) =>
                        index === self.findIndex(t => t.collectionName === item.collectionName)
                    );
                    const uniqueSpecials = specials.filter((item, index, self) =>
                        index === self.findIndex(t => t.collectionName === item.collectionName)
                    );

                    const cleanList = [...sortedClassics, ...uniqueSpecials, ...uniqueOthers];

                    // Sort the master list by Release Date (newest first) for the "Alle" view? 
                    // Or keep it mixed? The UI has sort buttons? No, just grid/table.
                    // The user wants "Sorting / Categorizing" to be good.
                    // Let's default "Sort" to release date for the main list, but let filters override.

                    const sortedAll = cleanList.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

                    setEpisodes(sortedAll);

                    // Update the state for filtered views to usage these pre-calculated good lists?
                    // The current `filterMode` effect filters `episodes`.
                    // To support the strict "Classic" view, filters should use the same logic.
                    // We can embed a property or just rely on the effect to re-run the `isClassic` check
                    // BUT: `isClassic` in the effect won't know about the "One per Episode" rule we enforced here.
                    // SO: We must ensure `episodes` ONLY contains the "One per Episode" version of classics.
                    // The code above does exactly that: `cleanList` includes only `sortedClassics`.
                    setFilteredEpisodes(sortedAll);
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
            const isSpecial = /Minis|Gute\s*-?\s*Nacht|Schäfchenwolken|Lieder|Box|Weihnacht/i.test(name);

            return hasFolge && !isSpecial;
        };

        if (filterMode === 'all') {
            setFilteredEpisodes(episodes);
        } else if (filterMode === 'classic') {
            const classics = episodes.filter(ep => isClassic(ep.collectionName));
            // Sort classics by Episode Number
            const sortedClassics = classics.sort((a, b) => {
                const getNum = (name: string) => {
                    const match = name.match(/Folge\s+(\d+)/i);
                    return match ? parseInt(match[1], 10) : 999999;
                };
                return getNum(a.collectionName) - getNum(b.collectionName);
            });
            setFilteredEpisodes(sortedClassics);
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
