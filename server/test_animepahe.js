import { ANIME } from "@consumet/extensions";

const provider = new ANIME.AnimePahe();

async function test() {
    try {
        console.log("Searching for 'One Piece' using AnimePahe...");
        const results = await provider.search("One Piece");
        console.log("Results:", JSON.stringify(results, null, 2));
    } catch (err) {
        console.error("Test Error:", err);
    }
}

test();
