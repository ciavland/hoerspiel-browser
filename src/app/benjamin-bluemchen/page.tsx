'use client';

import SeriesPage from '../../components/SeriesPage';
import { useClassicSeries } from '../../hooks/useClassicSeries';

export default function BenjaminBluemchenPage() {
    const { filteredEpisodes, loading, error, filterMode, setFilterMode } = useClassicSeries('Benjamin Blümchen');

    return (
        <SeriesPage
            title="Benjamin Blümchen"
            episodes={filteredEpisodes}
            loading={loading}
            error={error}
            filterMode={filterMode}
            onFilterChange={setFilterMode}
        />
    );
}
