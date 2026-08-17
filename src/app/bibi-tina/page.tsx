'use client';

import SeriesView from '../../components/SeriesView';
import { useClassicSeries } from '../../hooks/useClassicSeries';

export default function BibiTinaPage() {
    const { filteredEpisodes, loading, filterMode, setFilterMode } = useClassicSeries('Bibi und Tina');

    return (
        <SeriesView
            title="Bibi & Tina"
            episodes={filteredEpisodes}
            loading={loading}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
        />
    );
}
