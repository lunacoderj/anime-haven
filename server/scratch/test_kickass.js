import { ANIME } from "@consumet/extensions";

const kickass = new ANIME.KickAssAnime();

async function test() {
  console.log("Testing KickAssAnime search...");
  try {
    const res = await kickass.search("One Piece");
    console.log("KickAssAnime Results:", res.results.length);
    if (res.results.length > 0) {
      console.log("First result:", res.results[0].title);
      const info = await kickass.fetchAnimeInfo(res.results[0].id);
      console.log("Episodes:", info.episodes.length);
    }
  } catch (e) {
    console.error("KickAssAnime failed:", e.message);
  }
}

test();
