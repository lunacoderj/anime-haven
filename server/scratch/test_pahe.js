import { ANIME } from "@consumet/extensions";

const pahe = new ANIME.AnimePahe();

async function test() {
  console.log("Testing AnimePahe search...");
  try {
    const res = await pahe.search("One Piece");
    console.log("Results:", res.results.length);
    if (res.results.length > 0) {
      console.log("First ID:", res.results[0].id);
      console.log("Fetching info...");
      const info = await pahe.fetchAnimeInfo(res.results[0].id);
      console.log("Episodes:", info.episodes.length);
    }
  } catch (e) {
    console.error("AnimePahe failed:", e.message);
  }
}

test();
