import { PORT } from "./src/config/index.js";
import { startServer } from "./src/server.js";
import { syncDB } from "./src/utils/db.js";

async function main() {
  try {
    const server = startServer();

    await syncDB();

    server.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
