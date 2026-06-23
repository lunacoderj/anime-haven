import { ANIME } from "@consumet/extensions";

console.log("Available Anime Providers:");
Object.keys(ANIME).forEach(key => {
    console.log(`- ${key}`);
});
