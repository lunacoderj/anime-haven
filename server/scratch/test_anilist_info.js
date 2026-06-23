import { META } from "@consumet/extensions";

const anilist = new META.Anilist();

async function test() {
  console.log("Fetching info for One Piece (id: 21)...");
  try {
    const info = await anilist.fetchAnimeInfo("21");
    console.log("Title:", info.title.english);
    console.log("Episodes:", info.episodes.length);
    if (info.episodes.length > 0) {
      console.log("First episode ID:", info.episodes[0].id);
    }
  } catch (e) {
    console.error("Anilist fetchInfo failed:", e.message);
  }
}

test();
