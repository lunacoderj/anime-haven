import axios from "axios";

async function test() {
  console.log("Testing local API episodes...");
  try {
    const res = await axios.get("http://localhost:5000/api/anime/21/episodes", { timeout: 30000 });
    console.log("Status:", res.status);
    console.log("Episodes count:", res.data?.length);
    if (res.data?.length > 0) {
      console.log("First episode ID:", res.data[0].id);
    }
  } catch (e) {
    console.error("API Episodes failed:", e.message);
  }
}

test();
