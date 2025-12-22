import { GoogleGenAI } from "@google/genai";

export const generateTexture = async (
  prompt: string, 
  maskImageBase64: string,
  sketchImageBase64?: string,
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

    // 1. Add the Tesla Template Mask (Primary Context)
    if (maskImageBase64) {
      const base64Data = maskImageBase64.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: getMimeType(maskImageBase64),
            data: base64Data
          }
        });
      }
    }

    // 2. Add the User's Sketch/Current Canvas (Secondary Context)
    if (sketchImageBase64) {
        const base64Data = sketchImageBase64.split(',')[1];
        if (base64Data) {
          parts.push({
            inlineData: {
              mimeType: getMimeType(sketchImageBase64),
              data: base64Data
            }
          });
        }
    }

    // 3. Add the User's Uploaded References (Style/Logo)
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
    }

    const systemPrompt = `I have this car wrap template, I want you to only replace the red parts of the image. Top is front of the car, bottom is back of the car. Left is the left side of the car, most left is bottom left side to up, same for the right, so most right is the bottom of the right side of the car, going up.
I also provided the tesla logos so you get a feeling of the oriention. It is very important you use the right orientation for the sides. So that objects always appear from top to bottom, so left to right, or right to left depending on the side of the image. Also make sure you fill up only and all of the white parts. Don't leave anything red and don't show the tesla logs in your results from the provided input!

Now I want you to make a Tesla car wrap of: ${prompt}

Additional Instructions:
- The first image provided is the mask/template described above.
- If a second image is provided, it is a sketch/drawing from the user on top of the car. Use it as a loose reference for placement and color.
- If other images are provided, use them as style references or logos to include.`;

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