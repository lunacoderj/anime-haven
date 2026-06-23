import { META } from "@consumet/extensions";

const anilist = new META.Anilist();

async function test() {
    try {
        console.log("Searching for 'One Piece' using Meta.Anilist...");
        const results = await anilist.search("One Piece");
        console.log("Results (first 1):", JSON.stringify(results.results[0], null, 2));
        
        if (results.results.length > 0) {
            const animeId = results.results[0].id;
            console.log(`Fetching info for ID: ${animeId}...`);
            const info = await anilist.fetchAnimeInfo(animeId);
            console.log("Episodes count:", info.episodes.length);
        }
    } catch (err) {
        console.error("Test Error:", err);
    }
}

test();
