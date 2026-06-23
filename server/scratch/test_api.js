import axios from "axios";

async function test() {
  console.log("Testing local API search...");
  try {
    const res = await axios.get("http://localhost:5000/api/anime/search/One%20Piece", { timeout: 10000 });
    console.log("Status:", res.status);
    console.log("Results count:", res.data.results?.length);
  } catch (e) {
    console.error("API Search failed:", e.message);
    if (e.response) {
      console.error("Response data:", e.response.data);
    }
  }
}

test();
