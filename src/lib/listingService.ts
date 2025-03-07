import { supabase } from './supabase';
import { User } from '@supabase/auth-js';

export type ListingData = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: 'draft' | 'active' | 'sold' | 'deleted';
  seller_id: string;
  location?: string | null;
};

/**
 * Creates a new listing in the database
 * @param listingData The listing data to create
 * @param images The images to upload
 * @param user The current user
 * @returns The created listing or null if there was an error
 */
export async function createListing(
  listingData: Omit<ListingData, 'id' | 'images' | 'seller_id'>,
  images: File[],
  user: User
): Promise<ListingData | null> {
  // Generate a unique ID for the listing
  const listingId = crypto.randomUUID();
  console.log('Creating listing with ID:', listingId);
  
  try {
    // Step 1: Upload images if any
    const imageUrls = await uploadListingImages(images, user.id, listingId);
    console.log('Uploaded image URLs:', imageUrls);
    
    // Step 2: Create the listing in the database
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          id: listingId,
          seller_id: user.id,
          images: imageUrls,
          ...listingData,
          status: 'active' // Ensure status is set
        }
      ])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating listing:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Listing created successfully:', data);
    return data as ListingData;
  } catch (error: any) {
    console.error('Error in createListing:', error);
    return null;
  }
}

/**
 * Uploads images for a listing to Supabase storage
 * @param images The image files to upload
 * @param userId The user ID who is uploading
 * @param listingId The listing ID to associate the images with
 * @returns An array of image URLs
 */
export async function uploadListingImages(
  images: File[],
  userId: string,
  listingId: string
): Promise<string[]> {
  if (!images.length) return [];
  
  // Ensure the bucket exists
  try {
    await supabase.storage.createBucket('listings', {
      public: true,
    }).catch(() => {
      console.log('Bucket already exists or error creating bucket');
    });
  } catch (error) {
    console.error('Error checking bucket:', error);
  }
  
  // Upload images one by one
  const uploadedUrls: string[] = [];
  
  for (let i = 0; i < images.length; i++) {
    try {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${listingId}/${i}.${fileExt}`;
      
      console.log(`Uploading image ${i+1}/${images.length}: ${filePath}`);
      
      const { data, error } = await supabase.storage
        .from('listings')
        .upload(filePath, file, { upsert: true });
      
      if (error) {
        console.error(`Error uploading image ${i}:`, error);
        continue;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('listings')
        .getPublicUrl(filePath);
      
      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    } catch (e) {
      console.error(`Error processing image ${i}:`, e);
    }
  }
  
  return uploadedUrls;
}
