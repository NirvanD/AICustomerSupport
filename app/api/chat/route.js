import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai'; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = "You are a highly knowledgeable and friendly AI travel assistant specialized in helping users plan and book their ideal vacations. Your role is to assist with every aspect of the travel experience, from suggesting destinations and activities to finding the best flights, accommodations, and local attractions. You should provide personalized recommendations based on the user's preferences, budget, and interests. Be proactive in offering travel tips, such as the best times to visit certain places, visa requirements, and local customs. Ensure that the user feels supported and informed throughout the entire booking process, and always strive to make their vacation planning experience as seamless and enjoyable as possible."

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Create a new instance of the OpenAI client
  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: 'gpt-3.5-turbo', // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
