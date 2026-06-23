import { ANIME, META } from "@consumet/extensions";

const hianime = new ANIME.Hianime();
const animepahe = new ANIME.AnimePahe();
const anilist = new META.Anilist();

const query = "One Piece";

async function test() {
  console.log("--- Testing Hianime ---");
  try {
    const res = await hianime.search(query);
    console.log("Hianime Search Results:", res.results.length);
    if (res.results.length > 0) {
      const info = await hianime.fetchAnimeInfo(res.results[0].id);
      console.log("Hianime Info:", info.title);
    }
  } catch (e) {
    console.error("Hianime failed:", e.message);
  }

  console.log("\n--- Testing AnimePahe ---");
  try {
    const res = await animepahe.search(query);
    console.log("AnimePahe Search Results:", res.results.length);
    if (res.results.length > 0) {
      const info = await animepahe.fetchAnimeInfo(res.results[0].id);
      console.log("AnimePahe Info:", info.title);
    }
  } catch (e) {
    console.error("AnimePahe failed:", e.message);
  }

  console.log("\n--- Testing Anilist ---");
  try {
    const res = await anilist.search(query);
    console.log("Anilist Search Results:", res.results.length);
    if (res.results.length > 0) {
      // Anilist fetchAnimeInfo might take time as it tries to map to providers
      console.log("Anilist First result:", res.results[0].title.english || res.results[0].title.romaji);
    }
  } catch (e) {
    console.error("Anilist failed:", e.message);
  }
}

test();
