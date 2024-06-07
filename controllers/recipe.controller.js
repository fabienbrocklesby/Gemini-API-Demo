import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const api_key = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(api_key);

const getRecipe = async (c) => {
	const {
		recipeName,
		calories,
		servingSize,
		budget,
		bodybuilderStyle,
		bodybuilderOption,
	} = await c.req.parseBody();

	let prompt = `Provide a detailed recipe`;
	if (recipeName) {
		prompt += ` for "${recipeName}"`;
	}
	if (calories) {
		prompt += ` with approximately ${calories} calories`;
	}
	if (servingSize) {
		prompt += ` that serves for ${servingSize} people`;
	}
	if (budget) {
		prompt += ` that can be made for under ${budget} dollars`;
	}
	if (bodybuilderStyle) {
		prompt += ` that is suitable for a bodybuilder's diet`;
		if (bodybuilderOption) {
			prompt += ` with a focus on ${bodybuilderOption}`;
		}
	}
	prompt += `. Please format the response as a JSON object with the following properties: "servingSize", "nutritionalInformation", "ingredients", "directions", and "estimatedPrice". The "servingSize" property should be a number representing the number of servings. The "nutritionalInformation" property should be an object with properties for "calories", "protein", "carbohydrates", and "fat". The "ingredients" property should be an array of objects, each with properties for "name", "quantity", and "price". The "directions" property should be an array of strings, each representing a step in the cooking instructions. The "estimatedPrice" property should be a number representing the total price estimate of all ingredients.`;

	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		const response = await model.generateContent(prompt);
		const text = response.response.text();

		let cleanedText = text
			.replace(/```json\n|```.*$/gs, "")
			.replace(/(\d+)g/g, "$1")
			.trim();

		if (cleanedText) {
			try {
				const json = JSON.parse(cleanedText);

				fs.appendFile(
					"./correct_responses.json",
					JSON.stringify(json) + ",\n",
					(err) => {
						if (err) {
							console.error("Failed to write to file", err);
						} else {
							console.log("Saved JSON response to file");
						}
					}
				);

				return c.json(JSON.stringify(json));
			} catch (error) {
				fs.appendFile(
					"./incorrect_responses.txt",
					cleanedText + ",\n",
					(err) => {
						if (err) {
							console.error("Failed to write to file", err);
						} else {
							console.log("Saved JSON response to file");
						}
					}
				);
				console.error("Failed to parse text as JSON:", cleanedText);
			}
		}

		return c.text(cleanedText);
	} catch (error) {
		console.error("Failed to generate content:", error);
		return c.text("Failed to generate content.");
	}
};

export { getRecipe };
