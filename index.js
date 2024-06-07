import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

const port = process.env.PORT || 3000;

import { getRecipe } from "./controllers/recipe.controller.js";

app.post("/recipe", async (c) => await getRecipe(c));

serve({
	fetch: app.fetch,
	port: port,
});

console.log("Server is running on port 3000 🚀");
