'use client';

import { useEffect, useState } from 'react';
import Section from '../components/Section';
import AudioPlayCard from '../components/AudioPlayCard';
import { searchArtist } from '../services/musickit';
import Link from 'next/link';

export default function Home() {
  const [tkkg, setTkkg] = useState<any[]>([]);
  const [benjamin, setBenjamin] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching
        const [tkkgData, benjaminResults] = await Promise.all([
          searchArtist('TKKG'),
          searchArtist('Benjamin Blümchen', 100) // Fetch more to find the newest
        ]);

        setTkkg(tkkgData || []);

        if (benjaminResults) {
          const sortedBenjamin = benjaminResults
            .sort((a: any, b: any) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
            .slice(0, 20);
          setBenjamin(sortedBenjamin);
        } else {
          setBenjamin([]);
        }
      } catch (err: any) {
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
        <>
          <Section title="TKKG" items={tkkg} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Benjamin Blümchen</h2>
              <Link href="/benjamin-bluemchen" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                Alle anzeigen &rarr;
              </Link>
            </div>
            {/* Reuse Section but hide its title since we added a custom header above */}
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {benjamin.map((item) => (
                <AudioPlayCard key={item.collectionId} album={item} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
