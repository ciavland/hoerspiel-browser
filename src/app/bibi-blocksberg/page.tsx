'use client';

import SeriesPage from '../../components/SeriesPage';
import { useClassicSeries } from '../../hooks/useClassicSeries';

export default function BibiBlocksbergPage() {
    const { filteredEpisodes, loading, error, filterMode, setFilterMode } = useClassicSeries('Bibi Blocksberg');

    return (
        <SeriesPage
            title="Bibi Blocksberg"
            episodes={filteredEpisodes}
            loading={loading}
            error={error}
            filterMode={filterMode}
            onFilterChange={setFilterMode}
        />
    );
}
