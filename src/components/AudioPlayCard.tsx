import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { ItunesCollection } from '../services/musickit';

interface AudioPlayCardProps {
    album: ItunesCollection;
}

export default function AudioPlayCard({ album }: AudioPlayCardProps) {
    // Use high-res image if available
    const artworkUrl = album.artworkUrl100?.replace('100x100', '400x400');

    return (
        <div className="group relative w-40 flex-shrink-0 cursor-pointer snap-start transition-all hover:scale-105">
            <a
                href={album.collectionViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-800 shadow-lg">
                    <Image
                        src={artworkUrl || '/placeholder.png'}
                        alt={album.collectionName || 'Album Cover'}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-gray-200">
                            <ExternalLink className="h-6 w-6" />
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    <h3 className="truncate font-semibold text-white">
                        {album.collectionName}
                    </h3>
                    <p className="truncate text-sm text-gray-400">
                        {album.artistName}
                    </p>
                </div>
            </a>
        </div>
    );
}
