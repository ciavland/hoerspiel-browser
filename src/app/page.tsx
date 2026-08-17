'use client';

import { useEffect, useState } from 'react';
import AudioPlayCard from '../components/AudioPlayCard';
import { searchArtist, ItunesCollection } from '../services/musickit';
import Link from 'next/link';

export default function Home() {
  const [tkkg, setTkkg] = useState<ItunesCollection[]>([]);
  const [benjamin, setBenjamin] = useState<ItunesCollection[]>([]);
  const [bibi, setBibi] = useState<ItunesCollection[]>([]);
  const [bibiTina, setBibiTina] = useState<ItunesCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching
        const [tkkgResults, tkkgRetroResults, benjaminResults, bibiResults, bibiTinaResults] = await Promise.all([
          searchArtist('TKKG', 200),
          searchArtist('TKKG Retro-Archiv', 200),
          searchArtist('Benjamin Blümchen', 200),
          searchArtist('Bibi Blocksberg', 200),
          searchArtist('Bibi und Tina', 200)
        ]);

        // Merge and deduplicate TKKG results
        const allTkkg = [...(tkkgResults || []), ...(tkkgRetroResults || [])];
        const tkkgMerged = Array.from(new Map(allTkkg.map(item => [item.collectionId, item])).values());

        const isClassicTkkg = (name: string) => {
          // TKKG uses "TKKG 183 - Title" or "Folge 183" format
          return /(?:TKKG|Folge)\s+\d+/.test(name);
        };

        const isClassic = (name: string) => {
          const hasFolge = /Folge\s+\d+/.test(name);
          const isSpinOff = /Minis|Gute\s*-?\s*Nacht|Schäfchenwolken|Box/i.test(name);
          return hasFolge && !isSpinOff;
        };

        const getEpisodeNum = (name: string) => {
          // Handle "TKKG 183 - ..." format first
          const matchTkkg = name.match(/TKKG\s+(\d+)/i);
          if (matchTkkg) return parseInt(matchTkkg[1], 10);
          // Standard "Folge 183"
          const matchFolge = name.match(/Folge\s+(\d+)/i);
          if (matchFolge) return parseInt(matchFolge[1], 10);
          return 0;
        };

        if (tkkgMerged) {
          const sortedTkkg = tkkgMerged
            .filter((item) => isClassicTkkg(item.collectionName))
            .sort((a, b) => getEpisodeNum(b.collectionName) - getEpisodeNum(a.collectionName))
            .slice(0, 20);
          setTkkg(sortedTkkg);
        } else {
          setTkkg([]);
        }

        if (benjaminResults) {
          const sortedBenjamin = benjaminResults
            .filter((item) => isClassic(item.collectionName))
            .sort((a, b) => getEpisodeNum(b.collectionName) - getEpisodeNum(a.collectionName))
            .slice(0, 20);
          setBenjamin(sortedBenjamin);
        } else {
          setBenjamin([]);
        }

        if (bibiResults) {
          const sortedBibi = bibiResults
            .filter((item) => isClassic(item.collectionName))
            .sort((a, b) => getEpisodeNum(b.collectionName) - getEpisodeNum(a.collectionName))
            .slice(0, 20);
          setBibi(sortedBibi);
        } else {
          setBibi([]);
        }

        if (bibiTinaResults) {
          const sortedBibiTina = bibiTinaResults
            .filter((item) => isClassic(item.collectionName))
            .sort((a, b) => getEpisodeNum(b.collectionName) - getEpisodeNum(a.collectionName))
            .slice(0, 20);
          setBibiTina(sortedBibiTina);
        } else {
          setBibiTina([]);
        }
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
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">TKKG</h2>
              <Link href="/tkkg" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                Alle anzeigen &rarr;
              </Link>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {tkkg.map((item) => (
                <AudioPlayCard key={item.collectionId} album={item} />
              ))}
            </div>
          </div>

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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Bibi Blocksberg</h2>
              <Link href="/bibi-blocksberg" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                Alle anzeigen &rarr;
              </Link>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {bibi.map((item) => (
                <AudioPlayCard key={item.collectionId} album={item} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Bibi & Tina</h2>
              <Link href="/bibi-tina" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                Alle anzeigen &rarr;
              </Link>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {bibiTina.map((item) => (
                <AudioPlayCard key={item.collectionId} album={item} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
