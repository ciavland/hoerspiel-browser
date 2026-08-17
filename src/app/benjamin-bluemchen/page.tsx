'use client';

import SeriesView from '../../components/SeriesView';
import { useClassicSeries } from '../../hooks/useClassicSeries';

export default function BenjaminBluemchenPage() {
    const { filteredEpisodes, loading, filterMode, setFilterMode } = useClassicSeries('Benjamin Blümchen');

    return (
        <SeriesView
            title="Benjamin Blümchen"
            episodes={filteredEpisodes}
            loading={loading}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
        />
    );
}
