
import React from 'react';
import { ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-1/4 -right-12 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-purple-300/20 dark:bg-purple-500/10 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container px-6 md:px-8 mx-auto">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <span className="glass px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-6 animate-fade-in flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-pulse-light text-primary" />
            <span>The #1 Marketplace for College Students</span>
            <Sparkles className="h-3 w-3 animate-pulse-light text-primary" />
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 animate-slide-up text-balance">
            Buy & Sell Effortlessly <br /> Within Your Campus
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up text-balance" style={{ animationDelay: '100ms' }}>
            Everything from textbooks to tech, furniture to food. A smarter way to save money and reduce waste.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button size="lg" className="w-full sm:w-auto group">
              <Rocket className="mr-2 h-4 w-4 group-hover:animate-bounce-gentle" />
              <span>Explore Listings</span>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto group"
            >
              <span>Post an Item</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="mt-16 flex items-center gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-primary/10 dark:bg-primary/20" />
              ))}
            </div>
            <div className="text-sm">
              <span className="text-foreground font-medium">1,200+ students</span>
              <span className="text-muted-foreground ml-1">using CollegeMate</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
