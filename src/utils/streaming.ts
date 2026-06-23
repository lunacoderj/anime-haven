import axios from "axios";
import API_URL from "@/config/api";

export interface StreamingResult {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate: string | null;
  subOrDub: "sub" | "dub";
}

export interface StreamingEpisode {
  id: string;
  number: number;
  url: string;
}

export interface StreamingSource {
  url: string;
  isM3U8: boolean;
  quality: string;
}

export interface StreamingData {
  headers: {
    Referer: string;
  };
  sources: StreamingSource[];
  download: string;
}

export const searchStreamingAnime = async (query: string): Promise<StreamingResult[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/api/anime/search/${encodeURIComponent(query)}`);
    return data.results || [];
  } catch (error) {
    console.error("Search streaming anime error:", error);
    return [];
  }
};

export const getStreamingEpisodes = async (id: string): Promise<StreamingEpisode[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/api/anime/${id}/episodes`);
    return data || [];
  } catch (error) {
    console.error("Get streaming episodes error:", error);
    return [];
  }
};

export const getStreamingLinks = async (episodeId: string): Promise<StreamingData | null> => {
  try {
    const { data } = await axios.get(`${API_URL}/api/anime/watch/${episodeId}`);
    return data || null;
  } catch (error) {
    console.error("Get streaming links error:", error);
    return null;
  }
};
