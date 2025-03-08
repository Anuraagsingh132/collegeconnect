import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { 
  BookOpen, 
  Laptop, 
  Shirt, 
  DumbbellIcon, 
  Sofa, 
  Utensils, 
  Home, 
  Music, 
  Car,
  Briefcase,
  Shapes
} from 'lucide-react';

const categories = [
  {
    id: 'books',
    name: 'Books',
    description: 'Textbooks, study guides, literature and more',
    icon: BookOpen,
    color: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Laptops, phones, gaming and accessories',
    icon: Laptop,
    color: 'bg-purple-100 dark:bg-purple-950',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Clothing, shoes, accessories and jewelry',
    icon: Shirt,
    color: 'bg-pink-100 dark:bg-pink-950',
    textColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Sports equipment, fitness gear and outdoor items',
    icon: DumbbellIcon,
    color: 'bg-green-100 dark:bg-green-950',
    textColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Dorm furniture, desks, chairs and storage solutions',
    icon: Sofa,
    color: 'bg-amber-100 dark:bg-amber-950',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'food',
    name: 'Food',
    description: 'Homemade food, meal prep and snacks',
    icon: Utensils,
    color: 'bg-red-100 dark:bg-red-950',
    textColor: 'text-red-600 dark:text-red-400'
  },
  {
    id: 'housing',
    name: 'Housing',
    description: 'Apartments, roommate search and housing items',
    icon: Home,
    color: 'bg-cyan-100 dark:bg-cyan-950',
    textColor: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    id: 'music',
    name: 'Music',
    description: 'Instruments, equipment, lessons and accessories',
    icon: Music,
    color: 'bg-violet-100 dark:bg-violet-950',
    textColor: 'text-violet-600 dark:text-violet-400'
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Bikes, scooters, ride shares and accessories',
    icon: Car,
    color: 'bg-indigo-100 dark:bg-indigo-950',
    textColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Tutoring, repairs, delivery and more',
    icon: Briefcase,
    color: 'bg-teal-100 dark:bg-teal-950',
    textColor: 'text-teal-600 dark:text-teal-400'
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other items not fitting into the categories above',
    icon: Shapes,
    color: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-600 dark:text-gray-400'
  }
];

const Categories: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="container px-6 mx-auto">
          <h1 className="text-3xl font-display font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground mb-12">Browse items by category to find exactly what you need</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link 
                  key={category.id} 
                  to={`/explore/${category.name}`}
                  className="group block p-6 rounded-xl border border-border hover:border-primary transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${category.color}`}>
                      <Icon className={`h-6 w-6 ${category.textColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Categories; 