import AudioPlayCard from './AudioPlayCard';

import { ItunesCollection } from '../services/musickit';

interface SectionProps {
    title: string;
    items: ItunesCollection[];
}

export default function Section({ title, items }: SectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {items.map((item) => (
                    <AudioPlayCard key={item.collectionId} album={item} />
                ))}
            </div>
        </section>
    );
}
