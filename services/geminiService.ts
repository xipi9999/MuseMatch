import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MusicAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    songTitle: { type: Type.STRING },
    artist: { type: Type.STRING },
    lyricsSummary: { type: Type.STRING, description: "Detailed summary of the lyrical content and story." },
    lyricsThemes: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { name: { type: Type.STRING }, score: { type: Type.INTEGER } } 
      },
      description: "Themes present in the lyrics with intensity score (0-100)"
    },
    lyricsMoods: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { name: { type: Type.STRING }, score: { type: Type.INTEGER } } 
      },
      description: "Emotional moods of the lyrics with intensity score (0-100)"
    },
    language: { type: Type.STRING },
    explicit: { type: Type.STRING, description: "Yes, No, or Clean" },
    
    genres: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { name: { type: Type.STRING }, score: { type: Type.INTEGER } } 
      },
      description: "Main genres with relevance score (0-100)"
    },
    subgenres: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { name: { type: Type.STRING }, score: { type: Type.INTEGER } } 
      },
      description: "Specific subgenres with relevance score (0-100)"
    },
    musicMoods: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { name: { type: Type.STRING }, score: { type: Type.INTEGER } } 
      },
      description: "Musical atmosphere/vibe with intensity score (0-100)"
    },
    instruments: { type: Type.ARRAY, items: { type: Type.STRING } },
    bpm: { type: Type.STRING },
    key: { type: Type.STRING },
    vocals: { type: Type.STRING, description: "Description of vocal style (e.g. Low/Mid pitch, gritty, choral)" },
    
    sunoPrompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A name for this prompt variation" },
          prompt: { type: Type.STRING, description: "The exact text to paste into Suno 'Song Description'" },
          tags: { type: Type.STRING, description: "Style tags to paste into Suno 'Style of Music'" },
          explanation: { type: Type.STRING, description: "Why this prompt works" }
        },
        required: ["title", "prompt", "tags", "explanation"]
      },
      description: "Generate 3 distinct prompt variations based on the analysis."
    }
  },
  required: [
    "lyricsSummary", "lyricsThemes", "lyricsMoods", "language", "explicit", 
    "genres", "subgenres", "musicMoods", "instruments", "bpm", "key", "vocals", 
    "sunoPrompts"
  ]
};

const SYSTEM_INSTRUCTION = `
You are a world-class Musicologist and Expert AI Audio Engineer specialized in Suno.ai.
Your task is to analyze music (either from audio files or YouTube metadata/audio) and generate highly effective prompts for reproducing similar styles in Suno.

Output details:
1. Provide scores (0-100) for genres, moods, and themes based on their prominence.
2. Separate Lyrical analysis from Musical analysis.
3. For Suno Prompts:
   - "Song Description" (prompt) should be descriptive.
   - "Style of Music" (tags) should be a comma-separated list.
   - Provide 3 variations: Faithful Recreation, Modern Twist, Experimental.
`;

function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const analyzeAudioFile = async (base64Data: string, mimeType: string): Promise<MusicAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this audio file. Extract detailed musical and lyrical characteristics (even if lyrics are inferred from vocals) and generate Suno.ai prompts."
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text) as MusicAnalysis;

  } catch (error) {
    console.error("Gemini Audio Analysis Error:", error);
    throw error;
  }
};

export const analyzeYoutubeLink = async (url: string): Promise<MusicAnalysis> => {
  try {
    const videoId = getYoutubeVideoId(url);
    
    const prompt = `Analyze the song associated with this YouTube URL: ${url}. 
      
    If you can identify the song, analyze its actual audio characteristics (tempo, instrumentation, production style) and lyrics based on your knowledge.
    
    IMPORTANT: Return the response in strictly valid raw JSON format without any markdown formatting. 
    The JSON must follow this exact structure:
    {
      "songTitle": "string",
      "artist": "string",
      "lyricsSummary": "string",
      "lyricsThemes": [{ "name": "string", "score": 0-100 }],
      "lyricsMoods": [{ "name": "string", "score": 0-100 }],
      "language": "string",
      "explicit": "string (Yes/No)",
      "genres": [{ "name": "string", "score": 0-100 }],
      "subgenres": [{ "name": "string", "score": 0-100 }],
      "musicMoods": [{ "name": "string", "score": 0-100 }],
      "instruments": ["string"],
      "bpm": "string",
      "key": "string",
      "vocals": "string",
      "sunoPrompts": [
        { "title": "string", "prompt": "string", "tags": "string", "explanation": "string" }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      },
    });

    if (!response.text) throw new Error("No response from Gemini");
    
    let jsonStr = response.text.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let analysis: MusicAnalysis;
    try {
      analysis = JSON.parse(jsonStr) as MusicAnalysis;
    } catch (e) {
      console.error("Failed to parse JSON response:", jsonStr);
      throw new Error("Failed to parse analysis results");
    }

    // Attach Video ID
    if (videoId) analysis.videoId = videoId;

    // Extract grounding chunks for sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const sources: { title: string; url: string }[] = [];
      groundingChunks.forEach(chunk => {
        if (chunk.web?.uri) {
           sources.push({
             title: chunk.web.title || new URL(chunk.web.uri).hostname,
             url: chunk.web.uri
           });
        }
      });
      if (sources.length > 0) {
        analysis.sources = sources;
      }
    }

    return analysis;

  } catch (error) {
    console.error("Gemini YouTube Analysis Error:", error);
    throw error;
  }
};