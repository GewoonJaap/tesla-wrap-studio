
import { createClient } from '@supabase/supabase-js';
import { GalleryItem } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const uploadWrapToSupabase = async (
  base64Image: string,
  metadata: {
    title: string;
    author: string;
    carModelId: string;
    tags: string[];
    userId: string;
  }
): Promise<GalleryItem | null> => {
  try {
    // 1. Convert Base64 to Blob
    const res = await fetch(base64Image);
    const blob = await res.blob();
    // Unique filename: userId/timestamp_random.png
    const fileName = `${metadata.userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.png`;

    // 2. Upload to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wrap-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wrap-images')
      .getPublicUrl(fileName);

    // 4. Insert Metadata into DB
    const { data: insertData, error: insertError } = await supabase
      .from('wraps')
      .insert({
        title: metadata.title,
        author: metadata.author, // Display name
        car_model_id: metadata.carModelId,
        tags: metadata.tags,
        image_url: publicUrl,
        user_id: metadata.userId,
        likes: 0,
        downloads: 0
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Convert snake_case DB response to camelCase GalleryItem
    return {
        id: insertData.id,
        title: insertData.title,
        author: insertData.author,
        userId: insertData.user_id,
        likes: insertData.likes,
        downloads: insertData.downloads,
        imageUrl: insertData.image_url,
        carModelId: insertData.car_model_id,
        createdAt: insertData.created_at,
        tags: insertData.tags
    };

  } catch (error) {
    console.error("Supabase Upload Error:", error);
    throw error;
  }
};

export const fetchWraps = async (): Promise<GalleryItem[]> => {
  const { data, error } = await supabase
    .from('wraps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching wraps:", error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    author: item.author,
    userId: item.user_id,
    likes: item.likes,
    downloads: item.downloads,
    imageUrl: item.image_url,
    carModelId: item.car_model_id,
    createdAt: item.created_at,
    tags: item.tags || []
  }));
};

export const deleteWrap = async (wrapId: string, imageUrl: string): Promise<void> => {
    // 1. Delete from Database
    const { error: dbError } = await supabase
        .from('wraps')
        .delete()
        .eq('id', wrapId);

    if (dbError) throw dbError;

    // 2. Delete from Storage
    // We need to extract the path relative to the bucket.
    // URL format: .../storage/v1/object/public/wrap-images/USER_ID/FILENAME.png
    try {
        const urlObj = new URL(imageUrl);
        // Split by the bucket name to get the path
        const pathParts = urlObj.pathname.split('/wrap-images/');
        if (pathParts.length > 1) {
            const relativePath = decodeURIComponent(pathParts[1]);
            const { error: storageError } = await supabase.storage
                .from('wrap-images')
                .remove([relativePath]);
            
            if (storageError) console.warn("Storage deletion warning:", storageError);
        }
    } catch (e) {
        console.warn("Could not parse image URL for storage deletion", e);
    }
};

// --- Favorites Logic ---

export const getUserFavorites = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('wrap_id')
    .eq('user_id', userId);

  if (error) {
    console.warn("Error fetching favorites:", error);
    return [];
  }
  return data.map((item: any) => item.wrap_id);
};

export const toggleFavoriteInDb = async (userId: string, wrapId: string): Promise<{ liked: boolean, newCount: number }> => {
    // Uses a Database RPC function to safely handle the transaction and permissions
    const { data, error } = await supabase.rpc('toggle_like', { 
        p_user_id: userId, 
        p_wrap_id: wrapId 
    });

    if (error) {
        console.error("Error toggling like:", error);
        throw error;
    }

    return { liked: data.is_liked, newCount: data.new_count };
};
