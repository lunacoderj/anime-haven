export interface Anime {
  id: number;
  title: { romaji: string; english: string; native: string };
  coverImage: { large: string; extraLarge: string; color: string };
  bannerImage: string;
  description: string;
  episodes: number;
  duration: number;
  status: string;
  genres: string[];
  averageScore: number;
  format: string;
  season: string;
  seasonYear: number;
  studios: { nodes: { name: string }[] };
  trailer: { id: string; site: string };
  nextAiringEpisode: { episode: number; timeUntilAiring: number } | null;
}

export interface Manga {
  id: number;
  title: { romaji: string; english: string };
  coverImage: { large: string };
  chapters: number;
  volumes: number;
  averageScore: number;
  format: string;
  status: string;
  genres: string[];
  countryOfOrigin: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
}

export interface Message {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: Date;
  room: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: Date;
  likes: number;
  mediaId: number;
}
