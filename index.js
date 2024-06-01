import dotenv from "dotenv";

import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = new Hono();

const port = process.env.PORT || 3000;
const api_key = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(api_key);

app.post("/", async (c) => {
	const { prompt } = await c.req.parseBody();
	const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

	return c.text((await model.generateContent(prompt)).response.text());
});

serve({
	fetch: app.fetch,
	port: port,
});

console.log("Server is running on port 3000 🚀");
