import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateCurrentAffairs = async (category: string = 'random', count: number = 10) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let prompt = '';
    if (category === 'random') {
      prompt = `Generate ${count} current affairs articles about recent global events. 
                For each article, provide a title, a short summary (about 100 words), and a detailed article (about 500 words). 
                Format the response as valid JSON with this exact structure: 
                { 
                  "articles": [
                    { "title": "Article Title 1", "summary": "Brief summary here", "fullContent": "Full article content here" },
                    { "title": "Article Title 2", "summary": "Brief summary here", "fullContent": "Full article content here" },
                    // ... more articles
                  ]
                }
                Do not include any additional text, explanations, or markdown formatting like backticks.`;
    } else {
      prompt = `Generate ${count} current affairs articles about ${category}. 
                For each article, provide a title, a short summary (about 100 words), and a detailed article (about 500 words). 
                Format the response as valid JSON with this exact structure: 
                { 
                  "articles": [
                    { "title": "Article Title 1", "summary": "Brief summary here", "fullContent": "Full article content here" },
                    { "title": "Article Title 2", "summary": "Brief summary here", "fullContent": "Full article content here" },
                    // ... more articles
                  ]
                }
                Do not include any additional text, explanations, or markdown formatting like backticks.`;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```/, '');
    }
    
    // Parse the JSON
    try {
      const parsedResponse = JSON.parse(cleanedText);
      return parsedResponse.articles || [];
    } catch (parseError) {
      console.error('Failed to parse JSON response:', cleanedText);
      
      // Fallback: Try to extract JSON from the text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          return parsedResponse.articles || [];
        } catch (secondParseError) {
          console.error('Failed to parse extracted JSON:', jsonMatch[0]);
          throw new Error('Invalid JSON format in response');
        }
      } else {
        // If no JSON found, create a fallback response
        console.warn('No JSON found in response, using fallback');
        return [{
          title: "Current Affairs Article",
          summary: "An error occurred while generating the content. Please try again.",
          fullContent: "We encountered an issue while generating the current affairs content. Please try your request again. If the problem persists, check your API key and network connection."
        }];
      }
    }
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    
    // Return a fallback response instead of throwing
    return [{
      title: "Current Affairs Article",
      summary: "An error occurred while generating the content. Please try again.",
      fullContent: "We encountered an issue while generating the current affairs content. Please try your request again. If the problem persists, check your API key and network connection."
    }];
  }
};