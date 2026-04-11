import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
);

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function askGemini(
  userMessage: string,
  pageContext: string,
  history: ChatMessage[]
): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return 'Gemini API key not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file to enable AI responses.';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are the Tampa Energy Intelligence AI assistant. Help city planners understand district energy data and make smart optimization decisions. Be concise and data-driven. Reference Tampa districts by name. Keep responses under 150 words unless a detailed breakdown is specifically requested.`;

    // Map history to Gemini format — exclude the last user message (sent separately)
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    });

    // Prepend system prompt + page context to the user message on first turn
    const fullMessage =
      history.length === 0
        ? `${systemPrompt}\n\n${pageContext}\n\nUser question: ${userMessage}`
        : `${pageContext}\n\nUser question: ${userMessage}`;

    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    if (message.includes('API_KEY_INVALID') || message.includes('401')) {
      return 'Invalid API key. Please check your NEXT_PUBLIC_GEMINI_API_KEY in .env.local.';
    }
    if (message.includes('quota') || message.includes('429')) {
      return 'API quota exceeded. Please wait a moment and try again.';
    }
    return 'I encountered an error processing your request. Please try again in a moment.';
  }
}
