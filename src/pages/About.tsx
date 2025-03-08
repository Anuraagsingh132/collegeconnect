import React from 'react';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, BookOpen, MessageCircle, DollarSign, ShieldCheck } from 'lucide-react';

const features = [
  {
    title: 'Campus-Focused Marketplace',
    description: 'CollegeMate is specifically designed for college students to buy, sell, and trade items within their campus community.',
    icon: BookOpen,
  },
  {
    title: 'Safe Messaging',
    description: 'Our built-in messaging system allows you to communicate safely with buyers and sellers without sharing personal contact information.',
    icon: MessageCircle,
  },
  {
    title: 'Great Deals',
    description: 'Find textbooks, electronics, furniture, and more at student-friendly prices, or make some extra cash by selling items you no longer need.',
    icon: DollarSign,
  },
  {
    title: 'Secure Transactions',
    description: 'Our platform is designed with safety in mind, featuring user verification and secure in-person exchange recommendations.',
    icon: ShieldCheck,
  },
];

const steps = [
  {
    number: 1,
    title: 'Create an Account',
    description: 'Sign up with your college email to join your campus marketplace community.',
  },
  {
    number: 2,
    title: 'Browse or List Items',
    description: 'Search for items you need or list items you want to sell with photos and descriptions.',
  },
  {
    number: 3,
    title: 'Connect with Buyers/Sellers',
    description: 'Use our secure messaging system to discuss details and arrange a meeting.',
  },
  {
    number: 4,
    title: 'Complete the Transaction',
    description: 'Meet in a safe campus location to exchange the item and payment.',
  },
];

const faq = [
  {
    question: 'Is CollegeMate free to use?',
    answer: 'Yes, CollegeMate is completely free for college students. There are no fees for listing items or contacting other users.',
  },
  {
    question: 'How do I know if an item is still available?',
    answer: 'All active listings are marked as "Available." If you\'re interested in an item, you can message the seller directly to confirm availability.',
  },
  {
    question: 'Is it safe to meet with strangers?',
    answer: 'We recommend meeting in public places on campus during daylight hours, such as the library, student center, or campus coffee shops. Let a friend know where you\'re going and consider bringing someone along.',
  },
  {
    question: 'What payment methods are recommended?',
    answer: 'Cash is the simplest for in-person exchanges. Mobile payment apps are also popular. Never use wire transfers or non-protected payment methods with people you don\'t know.',
  },
  {
    question: 'What items are prohibited?',
    answer: 'Illegal items, weapons, alcohol, drugs, and counterfeit goods are prohibited. See our Terms of Service for a complete list.',
  },
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="container px-6 mx-auto">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">How CollegeMate Works</h1>
            <p className="text-xl text-muted-foreground mb-8">
              The simplest way to buy and sell within your college community
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/explore">Browse Listings</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/create-listing">Create Listing</Link>
              </Button>
            </div>
          </div>
          
          {/* Features Section */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-10 text-center">Why Use CollegeMate?</h2>
            <div className="grid md:grid-cols-2 gap-10">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0 bg-primary/10 rounded-xl p-3 h-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* How It Works Section */}
          <section className="mb-20 relative">
            <div className="absolute left-1/2 top-10 bottom-10 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-10 text-center">Getting Started</h2>
            <div className="space-y-12 relative">
              {steps.map((step, index) => (
                <div key={index} className="md:grid md:grid-cols-2 md:gap-8 items-center relative">
                  <div className={`mb-4 md:mb-0 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div className="glass p-4 rounded-xl relative">
                      <div className="absolute -left-3 md:left-auto md:-right-3 top-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className="h-40 bg-muted rounded-xl flex items-center justify-center">
                      <span className="text-6xl font-display font-bold text-primary/20">Step {step.number}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-10 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-8">
              {faq.map((item, index) => (
                <div key={index} className="glass p-5 rounded-xl">
                  <h3 className="text-lg font-medium mb-2 flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item.question}</span>
                  </h3>
                  <p className="text-muted-foreground pl-7">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students at your campus who are already buying and selling on CollegeMate.
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">Create an Account</Link>
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About; 