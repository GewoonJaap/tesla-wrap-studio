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

    // Enhanced prompt logic to support UV mapping / template filling
    let textPrompt;
    if (referenceImage) {
      textPrompt = `You are a professional vehicle wrap designer.
      
      INPUT IMAGE: A UV template or existing wrap design for a Tesla.
      TASK: Apply the design concept "${prompt}" to this specific car layout.
      
      CRITICAL INSTRUCTIONS:
      1. STRICT ALIGNMENT: The input image defines the exact shape of the car panels. You must maintain these shapes and positions perfectly.
      2. FILL PANELS: Apply the requested texture/graphic ONLY inside the panel boundaries.
      3. PRESERVE LAYOUT: Do not distort the wireframe or panel outlines. The result must overlay the original template perfectly.
      4. STYLE: "${prompt}".
      
      OUTPUT: A high-resolution image matching the input dimensions and UV layout.`;
    } else {
      // Fallback if no reference for some reason (though app should always provide composite)
      textPrompt = `Generate a seamless texture pattern suitable for a car wrap.
      View: Top-down.
      Quality: High.
      Style: "${prompt}"`;
    }

    console.log("Generating with prompt:", textPrompt);

    parts.push({
      text: textPrompt,
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