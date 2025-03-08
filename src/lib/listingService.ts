import { ID, Models } from 'appwrite';
import { databases, storage } from './appwrite';
import { 
    APPWRITE_DATABASE_ID,
    APPWRITE_LISTINGS_COLLECTION_ID,
    APPWRITE_LISTINGS_BUCKET_ID 
} from './config';
import { toast } from '@/components/ui/use-toast';

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
    user: Models.User<Models.Preferences>
): Promise<ListingData | null> {
    // Generate a unique ID for the listing
    const listingId = ID.unique();
    console.log('Creating listing with ID:', listingId);
    
    try {
        // Step 1: Upload images if any
        const imageIds = await uploadListingImages(images);
        console.log('Uploaded image IDs:', imageIds);
        
        // Step 2: Create the listing in the database
        const response = await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_LISTINGS_COLLECTION_ID,
            listingId,
            {
                seller_id: user.$id,
                images: imageIds,
                title: listingData.title,
                description: listingData.description,
                price: listingData.price,
                category: listingData.category,
                condition: listingData.condition,
                status: 'active', // Ensure status is set
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        );
        
        console.log('Listing created successfully:', response);
        return {
            id: response.$id,
            seller_id: response.seller_id,
            images: response.images,
            title: response.title,
            description: response.description,
            price: response.price,
            category: response.category,
            condition: response.condition,
            status: response.status
        };
    } catch (error: any) {
        console.error('Error in createListing:', error);
        return null;
    }
}

/**
 * Updates an existing listing in the database
 * @param listingId The ID of the listing to update
 * @param listingData The updated listing data
 * @returns The updated listing or null if there was an error
 */
export async function updateListing(
    listingId: string,
    listingData: Partial<Omit<ListingData, 'id' | 'images' | 'seller_id'>>
): Promise<ListingData | null> {
    console.log('Updating listing with ID:', listingId);
    
    try {
        // Update the listing in the database
        const response = await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_LISTINGS_COLLECTION_ID,
            listingId,
            {
                ...listingData,
                updated_at: new Date().toISOString()
            }
        );
        
        console.log('Listing updated successfully:', response);
        return {
            id: response.$id,
            seller_id: response.seller_id,
            images: response.images || [],
            title: response.title,
            description: response.description,
            price: response.price,
            category: response.category,
            condition: response.condition,
            status: response.status
        };
    } catch (error: any) {
        console.error('Error in updateListing:', error);
        throw error; // Throw the error to be handled by the caller
    }
}

/**
 * Check if a bucket exists by trying to list files
 */
async function checkBucketExists(bucketId: string): Promise<boolean> {
    try {
        await storage.listFiles(bucketId);
        return true;
    } catch (error: any) {
        if (error?.code === 404) {
            return false;
        }
        throw error;
    }
}

/**
 * Displays a helpful error message about missing buckets
 */
function showBucketSetupInstructions() {
    toast({
        title: "Storage setup needed",
        description: "The storage bucket for images doesn't exist. Please create it in the Appwrite Console with ID: " + APPWRITE_LISTINGS_BUCKET_ID,
        variant: "destructive",
        duration: 10000,
    });
    
    console.error(`
⚠️ MISSING STORAGE BUCKET ⚠️
The listings bucket (${APPWRITE_LISTINGS_BUCKET_ID}) is missing. Please create it in the Appwrite Console:

1. Go to Appwrite Console > Storage
2. Create a bucket with ID: "${APPWRITE_LISTINGS_BUCKET_ID}" and name: "Listings"
3. Set file extensions to: .jpg, .jpeg, .png, .webp
4. Set appropriate permissions
   - Users should have read access
   - Authenticated users should have write access

After creating the bucket, try again.
    `);
}

/**
 * Uploads images for a listing to Appwrite storage
 * @param images The image files to upload
 * @returns An array of image IDs
 */
export async function uploadListingImages(images: File[]): Promise<string[]> {
    if (!images.length) return [];
    
    // First check if the bucket exists
    const bucketExists = await checkBucketExists(APPWRITE_LISTINGS_BUCKET_ID);
    
    if (!bucketExists) {
        showBucketSetupInstructions();
        return [];
    }
    
    // Upload images one by one
    const uploadedIds: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
        try {
            const file = images[i];
            const fileId = ID.unique();
            
            console.log(`Uploading image ${i+1}/${images.length}: ${file.name}`);
            
            const response = await storage.createFile(
                APPWRITE_LISTINGS_BUCKET_ID,
                fileId,
                file
            );
            
            uploadedIds.push(response.$id);
        } catch (e) {
            console.error(`Error processing image ${i}:`, e);
        }
    }
    
    return uploadedIds;
}
