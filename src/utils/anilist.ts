import axios from "axios";
import type { Anime, Manga } from "@/types";

const ANILIST = "https://graphql.anilist.co";

const stripHtml = (text: string | null | undefined): string =>
  text ? text.replace(/<[^>]*>/g, "") : "";

const query = async (q: string, variables: Record<string, unknown> = {}) => {
  try {
    const { data } = await axios.post(ANILIST, { query: q, variables });
    return data?.data;
  } catch (e) {
    console.error("AniList API error:", e);
    return null;
  }
};

const ANIME_FIELDS = `
  id title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage description episodes duration status
  genres averageScore format season seasonYear
  studios { nodes { name } }
  trailer { id site thumbnail }
  nextAiringEpisode { episode timeUntilAiring }
`;

const MANGA_FIELDS = `
  id title { romaji english }
  coverImage { large }
  chapters volumes averageScore format status
  genres countryOfOrigin description
  startDate { year }
`;

export const getTrendingAnime = async (): Promise<Anime[]> => {
  const data = await query(`
    query { Page(perPage: 20) { media(sort: TRENDING_DESC, status: RELEASING, type: ANIME) { ${ANIME_FIELDS} } } }
  `);
  return (data?.Page?.media ?? []).map((m: Anime) => ({ ...m, description: stripHtml(m.description) }));
};

export const getTrendingManga = async (): Promise<Manga[]> => {
  const data = await query(`
    query { Page(perPage: 20) { media(sort: TRENDING_DESC, type: MANGA) { ${MANGA_FIELDS} } } }
  `);
  return (data?.Page?.media ?? []).map((m: Manga & { description?: string }) => ({
    ...m,
    description: stripHtml(m.description),
  }));
};

export const getRecentAnime = async (): Promise<Anime[]> => {
  const data = await query(`
    query { Page(perPage: 50) { media(sort: START_DATE_DESC, type: ANIME, isAdult: false) { ${ANIME_FIELDS} } } }
  `);
  return (data?.Page?.media ?? []).map((m: Anime) => ({ ...m, description: stripHtml(m.description) }));
};

export const getRecentManga = async (): Promise<Manga[]> => {
  const data = await query(`
    query { Page(perPage: 50) { media(sort: START_DATE_DESC, type: MANGA, isAdult: false) { ${MANGA_FIELDS} } } }
  `);
  return (data?.Page?.media ?? []).map((m: Manga & { description?: string }) => ({
    ...m,
    description: stripHtml(m.description),
  }));
};

export const searchAnime = async (searchQuery: string): Promise<Anime[]> => {
  if (!searchQuery.trim()) return [];
  const data = await query(`
    query($q: String) {
      Page(perPage: 10) {
        media(search: $q, type: ANIME) {
          id title { romaji english userPreferred }
          coverImage { large medium } format status
          episodes averageScore genres description
        }
      }
    }
  `, { q: searchQuery });
  return (data?.Page?.media ?? []).map((m: Anime) => ({ ...m, description: stripHtml(m.description) }));
};

export const getMediaDetails = async (id: number): Promise<Anime | null> => {
  const data = await query(`
    query($id: Int) {
      Media(id: $id) {
        id type title { romaji english native userPreferred }
        description bannerImage
        coverImage { extraLarge large color }
        format status episodes chapters volumes duration
        genres averageScore meanScore popularity favourites
        season seasonYear source countryOfOrigin isAdult
        startDate { year month day }
        endDate { year month day }
        studios { edges { isMain node { name siteUrl } } }
        staff { edges { role node { id name { full native } image { large } } } }
        trailer { id site thumbnail }
        characters { edges { role node { id name { full native } image { large } } voiceActors { id name { full native } image { large } language } } }
        recommendations { edges { node { mediaRecommendation { id title { userPreferred } coverImage { large } format averageScore type status episodes chapters } } } }
        nextAiringEpisode { airingAt timeUntilAiring episode }
      }
    }
  `, { id });
  if (!data?.Media) return null;
  return { ...data.Media, description: stripHtml(data.Media.description) };
};

export const getRecommendations = async (id: number): Promise<Anime[]> => {
  const details = await getMediaDetails(id);
  if (!details) return [];
  const recs = (details as any).recommendations?.edges ?? [];
  return recs
    .slice(0, 12)
    .map((e: any) => e.node?.mediaRecommendation)
    .filter(Boolean);
};

export interface SearchFilters {
  genres?: string[];
  status?: string;
  year?: number;
  type?: string;
  sort?: string;
  format?: string;
}

const SORT_MAP: Record<string, string> = {
  Trending: "TRENDING_DESC",
  Popular: "POPULARITY_DESC",
  "Highest Rated": "SCORE_DESC",
  Newest: "START_DATE_DESC",
  Oldest: "START_DATE",
};

export const searchWithFilters = async (filters: SearchFilters): Promise<Anime[]> => {
  const vars: Record<string, unknown> = { perPage: 50 };
  const varDefs: string[] = ["$perPage: Int"];
  const args: string[] = ["perPage: $perPage"];

  if (filters.genres?.length) {
    vars.genres = filters.genres;
    varDefs.push("$genres: [String]");
    args.push("genre_in: $genres");
  }
  if (filters.status) {
    vars.status = filters.status.toUpperCase().replace(/ /g, "_");
    varDefs.push("$status: MediaStatus");
    args.push("status: $status");
  }
  if (filters.year) {
    vars.seasonYear = filters.year;
    varDefs.push("$seasonYear: Int");
    args.push("seasonYear: $seasonYear");
  }
  if (filters.type) {
    const t = filters.type.toUpperCase();
    vars.type = t === "ANIME" || t === "MANGA" ? t : "ANIME";
    varDefs.push("$type: MediaType");
    args.push("type: $type");
  }
  if (filters.sort) {
    vars.sort = SORT_MAP[filters.sort] || "TRENDING_DESC";
    varDefs.push("$sort: [MediaSort]");
    args.push("sort: [$sort]");
  }
  if (filters.format) {
    vars.format = filters.format.toUpperCase();
    varDefs.push("$format: MediaFormat");
    args.push("format: $format");
  }

  const data = await query(`
    query(${varDefs.join(", ")}) {
      Page(${args.slice(0, 1).join(", ")}) {
        media(${args.slice(1).join(", ")}) {
          ${ANIME_FIELDS}
        }
      }
    }
  `, vars);

  return (data?.Page?.media ?? []).map((m: Anime) => ({ ...m, description: stripHtml(m.description) }));
};
