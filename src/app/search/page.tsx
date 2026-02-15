'use client';

import { useState } from 'react';
import Section from '../../components/Section';
import { searchAudioPlays } from '../../services/musickit';
import { Search } from 'lucide-react';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const data = await searchAudioPlays(query);
            setResults(data || []);
        } catch (err) {
            console.error(err);
            // Handle error gracefully
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-white">Suche</h1>
                <form onSubmit={handleSearch} className="relative max-w-xl">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Was suchst du?"
                        className="w-full rounded-full bg-gray-800 px-6 py-4 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </form>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {searched && results.length === 0 ? (
                        <p className="text-gray-400">Keine Ergebnisse gefunden.</p>
                    ) : (
                        <Section title={searched ? `Ergebnisse für "${query}"` : ''} items={results} />
                    )}
                </>
            )}
        </div>
    );
}
