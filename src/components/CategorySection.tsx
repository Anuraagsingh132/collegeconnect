
import React from 'react';
import { Book, Laptop, Coffee, Backpack, Shirt, Home, Music, Bike, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryItemProps {
  icon: React.ReactNode;
  name: string;
  color: string;
  index: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ icon, name, color, index }) => {
  return (
    <Link 
      to={`/explore?category=${name.toLowerCase()}`}
      className="flex flex-col items-center group"
      style={{ '--index': index } as React.CSSProperties}
    >
      <div 
        className={`w-16 h-16 sm:w-20 sm:h-20 ${color} rounded-2xl flex items-center justify-center mb-3 card-hover group-hover:scale-105 transition-all duration-300`}
      >
        {icon}
      </div>
      <span className="text-sm font-medium">{name}</span>
    </Link>
  );
};

const CategorySection: React.FC = () => {
  const categories = [
    { icon: <Book className="h-7 w-7 text-foreground" />, name: 'Books', color: 'bg-blue-100' },
    { icon: <Laptop className="h-7 w-7 text-foreground" />, name: 'Electronics', color: 'bg-purple-100' },
    { icon: <Coffee className="h-7 w-7 text-foreground" />, name: 'Food', color: 'bg-orange-100' },
    { icon: <Backpack className="h-7 w-7 text-foreground" />, name: 'Essentials', color: 'bg-green-100' },
    { icon: <Shirt className="h-7 w-7 text-foreground" />, name: 'Clothing', color: 'bg-pink-100' },
    { icon: <Home className="h-7 w-7 text-foreground" />, name: 'Housing', color: 'bg-amber-100' },
    { icon: <Music className="h-7 w-7 text-foreground" />, name: 'Music', color: 'bg-red-100' },
    { icon: <Bike className="h-7 w-7 text-foreground" />, name: 'Transport', color: 'bg-cyan-100' },
    { icon: <Zap className="h-7 w-7 text-foreground" />, name: 'Services', color: 'bg-indigo-100' },
  ];

  return (
    <section className="py-20">
      <div className="container px-6 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need from our wide range of categories tailored for college life.
          </p>
        </div>
        
        <div className="staggered-grid grid grid-cols-3 md:grid-cols-9 gap-6">
          {categories.map((category, i) => (
            <CategoryItem
              key={category.name}
              icon={category.icon}
              name={category.name}
              color={category.color}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
