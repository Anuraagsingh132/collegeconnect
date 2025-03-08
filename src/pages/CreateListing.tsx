import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ID } from "appwrite";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ImagePlus, X } from "lucide-react";
import Navbar from "@/components/Navbar";

// Services and Context
import { useAuth } from "@/lib/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { 
  APPWRITE_DATABASE_ID,
  APPWRITE_LISTINGS_COLLECTION_ID,
  APPWRITE_LISTINGS_BUCKET_ID 
} from "@/lib/config";
import { createListing } from "@/lib/listingService";

const listingFormSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  price: z
    .string()
    .min(1, { message: 'Price is required' })
    .regex(/^\d+(\.\d{1,2})?$/, { message: 'Invalid price format' })
    .refine((val) => parseFloat(val) >= 0, { message: 'Price must be positive' })
    .refine((val) => parseFloat(val) <= 1000000, { message: 'Price must be less than ₹10,00,000' }),
  category: z.enum(['Books', 'Electronics', 'Fashion', 'Sports', 'Furniture', 'Food', 'Other'], {
    required_error: 'Please select a category',
  }),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor'], {
    required_error: 'Please select a condition',
  }),
  description: z
    .string()
    .max(2000, { message: 'Description must be less than 2000 characters' }),
});

const categories = [
  { value: 'Books', label: 'Books' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Food', label: 'Food' },
  { value: 'Other', label: 'Other' },
] as const;

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
] as const;

export default function CreateListing() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  type ListingFormValues = z.infer<typeof listingFormSchema>;

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      price: "",
      category: "Other",
      condition: "good",
      description: "",
    },
  });

  const MAX_IMAGES = 8;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateImage = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    console.log(`Validating image: ${file.name}, type: ${file.type}`);
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log(`Image validation failed: ${file.name} - Invalid type ${file.type}`);
      return { valid: false, error: 'Only JPG, PNG and WebP images are allowed' };
    }

    return { valid: true };
  };

  const compressImage = async (file: File): Promise<File> => {
    try {
      const imageCompression = await import('browser-image-compression');
      
      console.log(`Compressing image: ${file.name}, original size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type, // Preserve original file type
      };
      
      // Get compressed blob
      const compressedBlob = await imageCompression.default(file, options);
      
      // Convert blob to array buffer
      const arrayBuffer = await compressedBlob.arrayBuffer();
      
      // Create new File with array buffer
      const compressedFile = new File(
        [arrayBuffer],
        file.name,
        {
          type: file.type,
          lastModified: Date.now(),
        }
      );
      
      console.log(`Compression complete: ${file.name}, new size: ${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB`);
      
      return compressedFile;
    } catch (error) {
      console.error("Image compression failed:", error);
      return file; // Return original file if compression fails
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const newFiles = Array.from(event.target.files);
    
    if (images.length + newFiles.length > MAX_IMAGES) {
      toast({
        title: 'Too many images',
        description: `You can only upload up to ${MAX_IMAGES} images`,
        variant: 'destructive',
      });
      return;
    }

    setUploadingImages(true);
    
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    for (const file of newFiles) {
      const validation = await validateImage(file);
      if (validation.valid) {
        try {
          if (file.size > 2 * 1024 * 1024) {
            toast({
              title: "Compressing image",
              description: `Optimizing ${file.name} for upload...`,
            });
          }
          
          const compressedFile = await compressImage(file);
          validFiles.push(compressedFile);
        } catch (err) {
          console.error("Compression error:", err);
          validFiles.push(file);
        }
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      toast({
        title: 'Some images could not be added',
        description: errors.join('\n'),
        variant: 'destructive',
      });
    }

    if (validFiles.length > 0) {
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...validFiles]);
      setImageUrls(prev => [...prev, ...newUrls]);
    }

    setUploadingImages(false);
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const uploadImages = async (listingId: string) => {
    setUploadingImages(true);
    const uploadedImageIds: string[] = [];
    
    try {
        for (const file of images) {
            const fileId = ID.unique();
            await storage.createFile(
                APPWRITE_LISTINGS_BUCKET_ID,
                fileId,
                file
            );
            uploadedImageIds.push(fileId);
        }
        
        await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_LISTINGS_COLLECTION_ID,
            listingId,
            { images: uploadedImageIds }
        );
        
        return uploadedImageIds;
    } catch (error) {
        console.error('Error uploading images:', error);
        throw error;
    } finally {
        setUploadingImages(false);
    }
  };
  
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const onSubmit = async (values: z.infer<typeof listingFormSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing.",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (isLoading) {
      console.log('Submission already in progress, preventing double submission');
      return;
    }
    
    setIsLoading(true);
    console.log('Form submission started with values:', values);
    
    try {
      const price = parseFloat(values.price);
      if (isNaN(price)) {
        throw new Error("Invalid price format");
      }
      
      const listingData = {
        title: values.title.trim(),
        price: price,
        category: values.category,
        condition: values.condition,
        description: values.description.trim(),
        status: 'active' as const,
      };
      
      console.log('Prepared listing data:', listingData);
      console.log(`Attempting to upload ${images.length} images and create listing...`);
      
      const result = await createListing(
        listingData,
        images,
        user
      );
      
      if (!result) {
        throw new Error("Failed to create listing. Please try again.");
      }
      
      console.log('SUCCESS! Listing created successfully:', result);
      
      form.reset();
      setImages([]);
      setImageUrls([]);
      
      toast({
        title: "Success!",
        description: "Your listing has been created successfully.",
      });
      
      setTimeout(() => {
        console.log('Navigating to marketplace...');
        setIsLoading(false);
        navigate('/marketplace');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Please sign in to create a listing</h1>
          <Button className="mt-4" onClick={() => navigate("/signin")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Create New Listing</CardTitle>
              <CardDescription>
                Fill out the form below to create a new listing on the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter a descriptive title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {conditions.map((condition) => (
                                  <SelectItem key={condition.value} value={condition.value}>
                                    {condition.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about your item" 
                              className="min-h-32 resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>Images</FormLabel>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {imageUrls.map((url, index) => {
                          const fileId = `${index}-${images[index].name}`;
                          const progress = uploadProgress[fileId] || 0;
                          const isUploading = uploadingImages && progress < 100;
                          
                          return (
                            <div key={index} className="group relative aspect-square rounded-md border border-border overflow-hidden bg-muted">
                              <img
                                src={url}
                                alt={`Preview ${index}`}
                                className={`h-full w-full object-cover transition-opacity duration-200 ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                              />
                              {isUploading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="rounded-full bg-background/80 p-2 text-foreground hover:bg-background"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                              )}
                              {index === 0 && (
                                <div className="absolute left-2 top-2 rounded-md bg-primary/90 px-2 py-1">
                                  <span className="text-xs font-medium text-primary-foreground">Cover</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {images.length < MAX_IMAGES && (
                          <label 
                            className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed
                              ${uploadingImages 
                                ? 'border-muted cursor-not-allowed bg-muted/20' 
                                : 'border-primary/20 bg-muted/10 hover:border-primary/50 hover:bg-muted/20'}
                              transition-colors duration-200`}
                          >
                            <ImagePlus className={`h-8 w-8 mb-2 ${uploadingImages ? 'text-muted-foreground' : 'text-primary'}`} />
                            <span className={`text-xs ${uploadingImages ? 'text-muted-foreground' : 'text-primary'}`}>
                              Add Image
                            </span>
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                              disabled={uploadingImages}
                            />
                          </label>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <p>
                          {images.length} of {MAX_IMAGES} images added
                        </p>
                        <p>
                          Accepts JPG, PNG and WebP · Up to 5MB each
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || uploadingImages}
                  >
                    {(isLoading || uploadingImages) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Listing
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
