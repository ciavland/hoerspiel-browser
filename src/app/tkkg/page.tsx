'use client';

import SeriesView from '../../components/SeriesView';
import { useTkkgEpisodes } from '../../hooks/useTkkgEpisodes';

export default function TkkgPage() {
    const { filteredEpisodes, loading, filterMode, setFilterMode } = useTkkgEpisodes();

    return (
        <SeriesView
            title="TKKG"
            episodes={filteredEpisodes}
            loading={loading}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
        />
    );
}
