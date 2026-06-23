import { ANIME, META } from "@consumet/extensions";

console.log("Available Anime Providers:", Object.keys(ANIME));
console.log("Available Meta Providers:", Object.keys(META || {}));

try {
  const anilist = new META.Anilist();
  console.log("Anilist initialized successfully");
} catch (e) {
  console.log("Anilist not found in META:", e.message);
}
