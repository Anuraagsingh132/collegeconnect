import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ImagePlus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";

// Services and Context
import { useAuth } from "@/lib/AuthContext";
import { databases } from "@/lib/appwrite";
import { 
  APPWRITE_DATABASE_ID,
  APPWRITE_LISTINGS_COLLECTION_ID
} from "@/lib/config";
import { updateListing } from "@/lib/listingService";

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
    .min(10, { message: 'Description must be at least 10 characters' })
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

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);
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

  // Fetch the listing data
  useEffect(() => {
    const fetchListing = async () => {
      if (!id || !user) return;

      try {
        const response = await databases.getDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          id
        );

        // Check if the current user is the owner of the listing
        if (response.seller_id !== user.$id) {
          setNotAuthorized(true);
          setIsLoading(false);
          return;
        }

        setListing(response);
        
        // Set form values
        form.reset({
          title: response.title,
          price: response.price.toString(),
          category: response.category || 'Other',
          condition: response.condition || 'good',
          description: response.description,
        });
      } catch (error) {
        console.error("Error fetching listing:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id, user, form]);

  const onSubmit = async (values: ListingFormValues) => {
    if (!user || !id) return;
    
    setIsSaving(true);
    
    try {
      console.log("Form submission started with values:", values);
      
      // Prepare listing data
      const listingData = {
        title: values.title,
        price: parseFloat(values.price),
        category: values.category,
        condition: values.condition,
        description: values.description,
        status: 'active', // Keep the status as active
      };
      
      console.log("Prepared listing data:", listingData);
      
      // Update the listing
      const result = await updateListing(id, listingData);
      
      console.log("SUCCESS! Listing updated successfully:", result);
      
      toast({
        title: "Success!",
        description: "Your listing has been updated.",
      });
      
      // Redirect to the listing page
      navigate(`/product/${id}`);
      
    } catch (error: any) {
      console.error("Error updating listing:", error);
      
      toast({
        title: "Error updating listing",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
          <p className="mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/my-listings')}>Go to My Listings</Button>
        </main>
      </div>
    );
  }

  if (notAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authorized</h1>
          <p className="mb-6">You don't have permission to edit this listing.</p>
          <Button onClick={() => navigate('/my-listings')}>Go to My Listings</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-32">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Your Listing</CardTitle>
            <CardDescription>
              Update your listing details. You can change any information except for the images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., MacBook Pro 2022" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="E.g., 15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
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
                  
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
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
                          placeholder="Describe your item in detail. Include information about its features, condition, and any other relevant details." 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/product/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 
