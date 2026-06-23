import { META } from "@consumet/extensions";

const anilist = new META.Anilist();

async function test() {
  const res = await anilist.search("One Piece");
  console.log(JSON.stringify(res.results[0], null, 2));
}

test();
