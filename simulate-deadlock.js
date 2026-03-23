const { performance } = require('perf_hooks');

const queryCache = new Map();
let activeRequests = 0;
const MAX_CONCURRENT = 5;
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const searchAudioPlays = async (term, limit = 600) => {
    const termsToSearch = [term];
    if (limit > 200) {
        for (let i = 1; i <= 9; i++) termsToSearch.push(`${term} Folge ${i}`);
        for (let i = 10; i <= 25; i++) termsToSearch.push(`${term} Folge ${i}`);
    }

    const fetchSearch = async (searchQuery) => {
        while (activeRequests >= MAX_CONCURRENT) {
            await delay(50 + Math.random() * 50);
        }
        activeRequests++;
        try {
            await delay(100); // Simulate API latency
            return [1];
        } finally {
            activeRequests--;
        }
    };

    const allChunkResults = await Promise.all(termsToSearch.map(fetchSearch));
    return allChunkResults.flat();
};

async function run() {
    console.log("Start");
    const start = performance.now();
    await Promise.all([
        searchAudioPlays('TKKG', 600),
        searchAudioPlays('Benjamin', 600),
        searchAudioPlays('Bibi', 600),
        searchAudioPlays('Tina', 600)
    ]);
    console.log("Done in", performance.now() - start, "ms");
}
run();
