import { ANIME } from "@consumet/extensions";

const kai = new ANIME.AnimeKai();

async function test() {
  console.log("Testing AnimeKai search...");
  try {
    const res = await kai.search("One Piece");
    console.log("Results:", res.results.length);
    if (res.results.length > 0) {
      console.log("First ID:", res.results[0].id);
      const info = await kai.fetchAnimeInfo(res.results[0].id);
      console.log("Episodes:", info.episodes.length);
    }
  } catch (e) {
    console.error("AnimeKai failed:", e.message);
  }
}

test();
