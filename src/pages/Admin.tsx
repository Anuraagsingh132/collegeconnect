import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Edit, Trash2, Eye, MoreHorizontal, Filter, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { databases } from "@/lib/appwrite";
import { Query } from 'appwrite';
import { 
  APPWRITE_DATABASE_ID,
  APPWRITE_LISTINGS_COLLECTION_ID 
} from "@/lib/config";

const ITEMS_PER_PAGE = 10;
const ADMIN_EMAIL = "anuraagsingh10a@gmail.com"; // Change this to the admin email

// List of categories
const categories = [
  'All Categories',
  'Books',
  'Electronics',
  'Furniture',
  'Clothing',
  'Food',
  'Housing',
  'Music',
  'Transport',
  'Services',
];

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if the current user is an admin
  const isAdmin = user && user.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!user) return;
    
    const fetchAllListings = async () => {
      setIsLoading(true);
      try {
        // Fetch all listings without filtering by seller
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          [
            Query.limit(100) // Limit to 100 for performance, adjust as needed
          ]
        );
        setListings(response.documents || []);
        setFilteredListings(response.documents || []);
      } catch (error: any) {
        console.error("Error fetching listings:", error);
        toast({
          title: "Error fetching listings",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchAllListings();
    }
  }, [user, toast, isAdmin]);

  // Apply filters, search, and sorting
  useEffect(() => {
    if (!listings.length) return;

    let result = [...listings];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.seller_id?.toLowerCase().includes(term) ||
          item.$id?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "All Categories") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortField === "price") {
        return sortDirection === "asc"
          ? a.price - b.price
          : b.price - a.price;
      } else if (sortField === "created_at") {
        return sortDirection === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        // Default to sort by title
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

    setFilteredListings(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [listings, searchTerm, statusFilter, categoryFilter, sortField, sortDirection]);

  // Handle deletion of a listing
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // Delete the listing
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LISTINGS_COLLECTION_ID,
        id
      );
      
      // Remove from state
      setListings(prev => prev.filter(listing => listing.$id !== id));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      toast({
        title: "Listing deleted",
        description: "The listing has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error deleting listing",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Update listing status
  const updateListingStatus = async (id: string, status: string) => {
    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LISTINGS_COLLECTION_ID,
        id,
        {
          status,
          updated_at: new Date().toISOString()
        }
      );
      
      // Update in state
      setListings(prev => 
        prev.map(listing => 
          listing.$id === id 
            ? { ...listing, status, updated_at: new Date().toISOString() } 
            : listing
        )
      );
      
      toast({
        title: "Status updated",
        description: `Listing status changed to ${status}.`,
      });
    } catch (error: any) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error updating listing",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'delete' | 'active' | 'sold') => {
    if (!selectedItems.size) return;
    
    setIsLoading(true);
    let successCount = 0;
    let failCount = 0;
    
    for (const id of Array.from(selectedItems)) {
      try {
        if (action === 'delete') {
          await databases.deleteDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_LISTINGS_COLLECTION_ID,
            id
          );
        } else {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_LISTINGS_COLLECTION_ID,
            id,
            {
              status: action,
              updated_at: new Date().toISOString()
            }
          );
        }
        successCount++;
      } catch {
        failCount++;
      }
    }
    
    // Update state based on the action
    if (action === 'delete') {
      setListings(prev => prev.filter(listing => !selectedItems.has(listing.$id)));
    } else {
      setListings(prev => 
        prev.map(listing => 
          selectedItems.has(listing.$id) 
            ? { ...listing, status: action, updated_at: new Date().toISOString() } 
            : listing
        )
      );
    }
    
    setSelectedItems(new Set());
    setIsLoading(false);
    
    toast({
      title: "Bulk action completed",
      description: `${successCount} items processed successfully. ${failCount} failures.`,
      variant: failCount ? "destructive" : "default",
    });
  };

  // Export selected listings as CSV
  const exportAsCSV = () => {
    const items = selectedItems.size 
      ? listings.filter(item => selectedItems.has(item.$id))
      : filteredListings;
      
    if (!items.length) return;
    
    const headers = ['ID', 'Title', 'Price', 'Category', 'Status', 'Created At', 'Seller ID'];
    const csvContent = [
      // Headers
      headers.join(','),
      // Data rows
      ...items.map(item => [
        item.$id,
        `"${item.title.replace(/"/g, '""')}"`, // Escape quotes in title
        item.price,
        item.category,
        item.status,
        item.created_at,
        item.seller_id
      ].join(','))
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `listings_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // If user is not authenticated or not an admin, redirect to home
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Please sign in to access this page</h1>
          <Button className="mt-4" onClick={() => navigate("/signin")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You don't have permission to access this page.</p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={exportAsCSV}
              disabled={filteredListings.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Listing Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
                  title={`Sort ${sortDirection === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>

            {selectedItems.size > 0 && (
              <div className="bg-muted/50 p-2 rounded-md flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-medium">{selectedItems.size} items selected</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('active')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Active
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('sold')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Sold
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete {selectedItems.size} listings. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBulkAction('delete')}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedItems(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {filteredListings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No listings found matching your filters
                    </p>
                    <Button onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setCategoryFilter("All Categories");
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox 
                                checked={paginatedListings.length > 0 && 
                                  paginatedListings.every(item => selectedItems.has(item.$id))}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedItems(prev => {
                                      const newSet = new Set(prev);
                                      paginatedListings.forEach(item => newSet.add(item.$id));
                                      return newSet;
                                    });
                                  } else {
                                    setSelectedItems(prev => {
                                      const newSet = new Set(prev);
                                      paginatedListings.forEach(item => newSet.delete(item.$id));
                                      return newSet;
                                    });
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Listing</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedListings.map((listing) => (
                            <TableRow key={listing.$id}>
                              <TableCell>
                                <Checkbox 
                                  checked={selectedItems.has(listing.$id)}
                                  onCheckedChange={(checked) => {
                                    setSelectedItems(prev => {
                                      const newSet = new Set(prev);
                                      if (checked) {
                                        newSet.add(listing.$id);
                                      } else {
                                        newSet.delete(listing.$id);
                                      }
                                      return newSet;
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {listing.images && listing.images[0] ? (
                                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                                      <img 
                                        src={listing.images[0]} 
                                        alt={listing.title} 
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 rounded-md flex items-center justify-center bg-muted text-muted-foreground text-xs">
                                      No img
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium truncate max-w-[200px]">
                                      {listing.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      ID: {listing.$id.substring(0, 8)}...
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{listing.category || 'None'}</TableCell>
                              <TableCell>₹{listing.price?.toFixed(2) || '0.00'}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  listing.status === 'active' ? 'default' :
                                  listing.status === 'sold' ? 'secondary' :
                                  listing.status === 'draft' ? 'outline' : 'destructive'
                                }>
                                  {listing.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(listing.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => navigate(`/product/${listing.$id}`)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/edit-listing/${listing.$id}`)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => updateListingStatus(listing.$id, 'active')}
                                      disabled={listing.status === 'active'}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateListingStatus(listing.$id, 'sold')}
                                      disabled={listing.status === 'sold'}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Sold
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete the listing "{listing.title}".
                                            This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(listing.$id)}>
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedListings.length} of {filteredListings.length} listings
            </div>
          </CardFooter>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.filter(l => l.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sold Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.filter(l => l.status === 'sold').length}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin; 