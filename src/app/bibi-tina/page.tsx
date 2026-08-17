'use client';

import SeriesPage from '../../components/SeriesPage';
import { useClassicSeries } from '../../hooks/useClassicSeries';

export default function BibiTinaPage() {
    const { filteredEpisodes, loading, error, filterMode, setFilterMode } = useClassicSeries('Bibi und Tina');

    return (
        <SeriesPage
            title="Bibi & Tina"
            episodes={filteredEpisodes}
            loading={loading}
            error={error}
            filterMode={filterMode}
            onFilterChange={setFilterMode}
        />
    );
}
