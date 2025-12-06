import { GoogleGenAI } from "@google/genai";

export const generateTexture = async (prompt: string, apiKey: string, referenceImage?: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Using gemini-2.5-flash-image for image generation
  const model = 'gemini-2.5-flash-image';

  try {
    const parts: any[] = [];
    
    // Add reference image if available
    if (referenceImage) {
      // Expecting data:image/png;base64,....
      const base64Data = referenceImage.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: base64Data
          }
        });
      }
    }

    // Add text prompt
    parts.push({
      text: `Seamless texture pattern, top down view, high quality, suitable for car wrap. Style: ${prompt}`,
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data received from Gemini.");

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};