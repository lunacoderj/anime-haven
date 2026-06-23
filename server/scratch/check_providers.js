import { ANIME } from "@consumet/extensions";

console.log("Available Anime Providers:", Object.keys(ANIME));

try {
  const gogo = new ANIME.Gogoanime();
  console.log("Gogoanime initialized successfully");
} catch (e) {
  console.log("Gogoanime not found in ANIME:", e.message);
}
