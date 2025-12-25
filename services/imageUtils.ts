
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const sanitizeFilename = (filename: string): string => {
  // 1. Remove extension to process base name
  let name = filename.replace(/\.png$/i, '');
  
  // 2. Allow only Alphanumeric, underscores, dashes, spaces (Tesla Requirement)
  name = name.replace(/[^a-zA-Z0-9_\- ]/g, '_');
  
  // 3. Truncate to 26 chars to leave room for .png (Max 30 chars total)
  if (name.length > 26) {
      name = name.substring(0, 26);
  }
  
  return `${name}.png`;
};

export const processAndDownloadImage = async (
  base64Data: string, 
  rawFilename: string, 
  maxSizeBytes: number = 1000 * 1024, // 1MB limit
  targetMaxDimension: number = 1024 // Max 1024x1024 for wraps
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Data;
    
    img.onload = async () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      const finalFilename = sanitizeFilename(rawFilename);
      
      // 1. Enforce Max Resolution (Downscale if needed)
      // Tesla wraps should be between 512 and 1024.
      if (width > targetMaxDimension || height > targetMaxDimension) {
          const ratio = width / height;
          if (width > height) {
              width = targetMaxDimension;
              height = Math.round(width / ratio);
          } else {
              height = targetMaxDimension;
              width = Math.round(height * ratio);
          }
      }

      let blob: Blob | null = null;
      let attempts = 0;
      const maxAttempts = 10;

      // 2. Compression Loop (Resize until fits in 1MB)
      while (attempts < maxAttempts) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            reject(new Error("Failed to create canvas context"));
            return;
        }

        // Use high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
            blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
        } catch (e) {
            reject(e);
            return;
        }

        if (!blob) {
            reject(new Error("Failed to create image blob"));
            return;
        }

        // Check Size
        if (blob.size <= maxSizeBytes) {
            break; // It fits!
        }

        // If too big, scale down by 10% and try again
        width = Math.floor(width * 0.9);
        height = Math.floor(height * 0.9);
        attempts++;
        
        // Hard safety floor (Tesla min is technically 512, but we prioritize file size if needed)
        // However, we stop at 256 to avoid destroying the image completely.
        if (width < 256 || height < 100) break;
      }

      if (blob) {
          console.log(`Processed: ${finalFilename}, Size: ${(blob.size / 1024).toFixed(2)}KB, Dims: ${width}x${height}`);
          downloadBlob(blob, finalFilename);
          resolve();
      } else {
          reject(new Error("Optimization failed: Could not compress image below 1MB"));
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for processing"));
    };
  });
};
