import Link from 'next/link';
import AudioPlayCard from './AudioPlayCard';

import { ItunesCollection } from '../services/musickit';

interface SectionProps {
    title: string;
    items: ItunesCollection[];
    href?: string;
}

export default function Section({ title, items, href }: SectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {href && (
                    <Link href={href} className="text-sm font-medium text-blue-400 hover:text-blue-300">
                        Alle anzeigen &rarr;
                    </Link>
                )}
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {items.map((item) => (
                    <AudioPlayCard key={item.collectionId} album={item} />
                ))}
            </div>
        </section>
    );
}
