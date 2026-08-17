import { ItunesCollection } from '../services/musickit';

// Spin-off titles use "Folge X" too, but aren't part of the numbered classic series.
const SPIN_OFF_PATTERN = /Minis|Gute\s*-?\s*Nacht|Schäfchenwolken|Box/i;
const FOLGE_PATTERN = /Folge\s+(\d+)/i;

export const isSpinOffTitle = (name: string) => SPIN_OFF_PATTERN.test(name);

export const isClassicTitle = (name: string) => FOLGE_PATTERN.test(name) && !isSpinOffTitle(name);

export const parseFolgeNumber = (name: string): number | null => {
    const match = name.match(FOLGE_PATTERN);
    return match ? parseInt(match[1], 10) : null;
};

export const dedupeById = (items: ItunesCollection[]): ItunesCollection[] =>
    Array.from(new Map(items.map((item) => [item.collectionId, item])).values());

export const dedupeByName = (items: ItunesCollection[]): ItunesCollection[] =>
    items.filter((item, index, self) => index === self.findIndex((t) => t.collectionName === item.collectionName));
