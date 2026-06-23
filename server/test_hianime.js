import { ANIME } from "@consumet/extensions";

const hianime = new ANIME.Hianime();

async function test() {
    try {
        console.log("Searching for 'One Piece'...");
        const results = await hianime.search("One Piece");
        console.log("Results:", JSON.stringify(results, null, 2));
    } catch (err) {
        console.error("Test Error:", err);
    }
}

test();
