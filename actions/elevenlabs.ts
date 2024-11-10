"use server";

import { ElevenLabsClient } from "elevenlabs";
import { v4 as uuid } from "uuid";

import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error("ELEVENLABS_API_KEY is not set in environment variables");
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export async function getTextToSpeech(text: string) {
  try {
    const audioStream = await client.generate({
      voice: "Rachel",
      model_id: "eleven_turbo_v2_5",
      text,
    });

    // Debug logging
    console.log("Stream received:", !!audioStream);

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    return audioBuffer.toString("base64");
  } catch (error: any) {
    // More detailed error logging
    console.error("ElevenLabs API error details:", {
      message: error.message,
      status: error.statusCode,
      body: error.body,
      stack: error.stack,
    });

    if (error.statusCode === 401) {
      throw new Error("Authentication failed. Please check your API key.");
    }

    throw new Error(`Failed to convert text to speech: ${error.message}`);
  }
}
