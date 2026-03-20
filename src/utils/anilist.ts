import type { Anime, Manga } from "@/types";

const mockAnime = (id: number, title: string, score: number): Anime => ({
  id,
  title: { romaji: title, english: title, native: "アニメ" },
  coverImage: { large: `https://picsum.photos/seed/anime${id}/300/450`, extraLarge: `https://picsum.photos/seed/anime${id}/600/900`, color: "#667eea" },
  bannerImage: `https://picsum.photos/seed/banner${id}/1200/400`,
  description: `An exciting anime series that takes you on an incredible journey through ${title}. Follow the protagonists as they discover their destiny and face powerful enemies.`,
  episodes: Math.floor(Math.random() * 24) + 12,
  duration: 24,
  status: "RELEASING",
  genres: ["Action", "Adventure", "Fantasy"].slice(0, Math.floor(Math.random() * 3) + 1),
  averageScore: score,
  format: "TV",
  season: "WINTER",
  seasonYear: 2024,
  studios: { nodes: [{ name: "Studio Ghibli" }] },
  trailer: { id: "dQw4w9WgXcQ", site: "youtube" },
  nextAiringEpisode: { episode: 5, timeUntilAiring: 86400 },
});

const mockManga = (id: number, title: string, score: number): Manga => ({
  id,
  title: { romaji: title, english: title },
  coverImage: { large: `https://picsum.photos/seed/manga${id}/300/450` },
  chapters: Math.floor(Math.random() * 200) + 20,
  volumes: Math.floor(Math.random() * 20) + 1,
  averageScore: score,
  format: "MANGA",
  status: "RELEASING",
  genres: ["Action", "Drama", "Romance"].slice(0, Math.floor(Math.random() * 3) + 1),
  countryOfOrigin: "JP",
});

const animeNames = ["Demon Slayer", "Attack on Titan", "Jujutsu Kaisen", "One Piece", "My Hero Academia", "Chainsaw Man", "Spy x Family", "Bleach", "Naruto", "Dragon Ball"];
const mangaNames = ["One Punch Man", "Berserk", "Vagabond", "Solo Leveling", "Tokyo Ghoul", "Death Note", "Fullmetal Alchemist", "Hunter x Hunter", "Black Clover", "Blue Lock"];

export const getTrendingAnime = async (): Promise<Anime[]> => {
  await new Promise(r => setTimeout(r, 800));
  return animeNames.map((n, i) => mockAnime(i + 1, n, 80 + Math.floor(Math.random() * 15)));
};

export const getTrendingManga = async (): Promise<Manga[]> => {
  await new Promise(r => setTimeout(r, 800));
  return mangaNames.map((n, i) => mockManga(i + 100, n, 75 + Math.floor(Math.random() * 20)));
};

export const getRecentAnime = async (): Promise<Anime[]> => {
  await new Promise(r => setTimeout(r, 600));
  return animeNames.map((n, i) => mockAnime(i + 20, n, 70 + Math.floor(Math.random() * 25)));
};

export const getRecentManga = async (): Promise<Manga[]> => {
  await new Promise(r => setTimeout(r, 600));
  return mangaNames.map((n, i) => mockManga(i + 200, n, 70 + Math.floor(Math.random() * 25)));
};

export const searchAnime = async (_query: string): Promise<Anime[]> => {
  await new Promise(r => setTimeout(r, 500));
  return animeNames.slice(0, 5).map((n, i) => mockAnime(i + 50, n, 80));
};

export const getMediaDetails = async (id: number): Promise<Anime> => {
  await new Promise(r => setTimeout(r, 500));
  return mockAnime(id, animeNames[id % animeNames.length], 85);
};

export const getRecommendations = async (_id: number): Promise<Anime[]> => {
  await new Promise(r => setTimeout(r, 500));
  return animeNames.slice(0, 6).map((n, i) => mockAnime(i + 60, n, 78));
};
