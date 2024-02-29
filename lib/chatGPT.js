const OpenAI = require('openai');

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const chatGptHandler = async (weatherData) => {
	const inputText = `You are an expert outdoors-man, who guides novices in preparing for adventures. This user wants to go camping in ${weatherData[0].stateCode} with the following forecast data: ${JSON.stringify(weatherData)}. What should they do to prepare? Give 5 bullet point tips no more than 7 words each. With the introduction: Hi! Let's have S'more Fun! Judging by the forecast, here are some tips if you are going camping!`;

	try {
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{
					"role": "user",
					"content": inputText
				}
			],
			temperature: 1,
			max_tokens: 256,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		});

		console.log(response.choices[0].message)

		return response.choices[0].message.content;
	} catch (error) {
		console.error(error);
		return { error: 'Failed to fetch data from ChatGPT API' };
	}
};

module.exports = chatGptHandler;