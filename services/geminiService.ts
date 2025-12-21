import { GoogleGenAI } from "@google/genai";

export const generateTexture = async (
  prompt: string, 
  referenceImage?: string, 
  userApiKey?: string,
  userUploadImages?: string[],
  modelId: string = 'gemini-2.5-flash-image'
): Promise<string> => {
  const apiKey = userApiKey || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

  if (!apiKey) {
    throw new Error("API Key is missing. Please enter your Gemini API Key in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Clean up model ID if passed with descriptions or extra spaces
  const cleanModelId = modelId.trim();

  try {
    const parts: any[] = [];
    
    // Helper to get mime type from data URL
    const getMimeType = (dataUrl: string) => {
        const match = dataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        return match ? match[1] : 'image/png';
    };

    // 1. Add the Tesla Template (Context)
    if (referenceImage) {
      const base64Data = referenceImage.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: getMimeType(referenceImage),
            data: base64Data
          }
        });
      }
    }

    // 2. Add the User's Style/Logo References (Optional)
    let referenceInstruction = "";
    if (userUploadImages && userUploadImages.length > 0) {
      userUploadImages.forEach((img) => {
          const base64Data = img.split(',')[1];
          if (base64Data) {
            parts.push({
              inlineData: {
                mimeType: getMimeType(img),
                data: base64Data
              }
            });
          }
      });
      referenceInstruction = `Secondary reference images have been provided. Use these images as primary sources for style, pattern, or logo placement.`;
    }

    const systemPrompt = `You are an expert Tesla Paint Shop Expert.
    
    CONTEXT:
    The first image provided is the official Tesla "Paint Shop" template.
    1. PRINTABLE AREAS: WHITE areas represent the car body.
    2. NON-PRINTABLE: Transparent/Black areas are void.
    3. ORIENTATION: Top is Front, Bottom is Back.
    
    ${userUploadImages && userUploadImages.length > 0 ? 'Subsequent images are User Reference Images (logos, patterns, or styles).' : ''}
    
    TASK:
    Generate a texture applied to the WHITE areas of the template.
    
    INSTRUCTIONS:
    - Maintain strict geometry of the first image (template).
    - Apply the style described in the prompt to the template.
    - ${referenceInstruction}
    - Style Theme: "${prompt}".
    - Output: A high-fidelity, 1:1 square composite image.`;

    parts.push({ text: systemPrompt });

    // Configuration depends on the model
    let imageConfig: any = {
      aspectRatio: "1:1",
    };

    // Gemini 3 Pro supports explicit size, Flash Image does not (it defaults)
    if (cleanModelId === 'gemini-3-pro-image-preview') {
      imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: cleanModelId,
      contents: { parts: parts },
      config: {
        imageConfig: imageConfig
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