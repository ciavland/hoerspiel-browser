'use client';

import SeriesView from '../../components/SeriesView';
import { useClassicSeries } from '../../hooks/useClassicSeries';

export default function BibiBlocksbergPage() {
    const { filteredEpisodes, loading, filterMode, setFilterMode } = useClassicSeries('Bibi Blocksberg');

    return (
        <SeriesView
            title="Bibi Blocksberg"
            episodes={filteredEpisodes}
            loading={loading}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
        />
    );
}
