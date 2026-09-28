import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${PORT}`);
});