import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ArrowRight, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const posts = await base44.entities.BlogPost.filter({ published: true }, '-published_date');
      return posts;
    },
    initialData: []
  });

  const categories = [
    { value: "all", label: "All Posts" },
    { value: "compliance", label: "Compliance" },
    { value: "best-practices", label: "Best Practices" },
    { value: "regulations", label: "Regulations" },
    { value: "inspections", label: "Inspections" },
    { value: "engineering", label: "Engineering" },
    { value: "case-studies", label: "Case Studies" }
  ];

  const filteredPosts = selectedCategory === "all"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-white mb-6 pt-40 text-5xl font-bold md:text-6xl">
            Insights & Updates
          </h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
            Expert guidance, industry insights, and the latest updates in stormwater compliance, structural engineering, and construction best practices.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <ScrollFadeSection>
        <section className="py-12 px-6 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className={`${
                    selectedCategory === cat.value
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  } px-6`}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="py-20 px-6 text-center">
          <p className="text-xl text-gray-600">No blog posts published yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {selectedCategory === "all" && featuredPost && (
            <ScrollFadeSection>
              <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-8">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Featured Article
                    </span>
                  </div>
                  
                  <div className="cursor-pointer"  onClick={() => alert('Blog post detail view coming soon')}>
                    <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
                      <div className="grid lg:grid-cols-2 gap-0">
                        {featuredPost.featured_image && (
                          <div className="relative h-96 lg:h-auto overflow-hidden">
                            <img
                              src={featuredPost.featured_image}
                              alt={featuredPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        )}
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex items-center gap-4 mb-4">
                            <Badge className="bg-blue-100 text-blue-700 capitalize">
                              {featuredPost.category.replace('-', ' ')}
                            </Badge>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(featuredPost.published_date)}</span>
                            </div>
                          </div>
                          
                          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                            {featuredPost.seo_optimized_title || featuredPost.title}
                          </h2>
                          
                          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                            {featuredPost.meta_description || featuredPost.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              <span className="text-sm">{featuredPost.author}</span>
                            </div>
                            {featuredPost.read_time && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{featuredPost.read_time}</span>
                              </div>
                            )}
                          </div>
                          
                          {featuredPost.tags && featuredPost.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {featuredPost.tags.slice(0, 4).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto group-hover:bg-blue-700">
                            Read Full Article
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </section>
            </ScrollFadeSection>
          )}

          {/* Blog Grid */}
          {regularPosts.length > 0 && (
            <ScrollFadeSection>
              <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                    Latest Articles
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post) => (
                      <div
                        key={post.id}
                        className="cursor-pointer"
                        onClick={() => alert('Blog post detail view coming soon')}
                      >
                        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                          {post.featured_image && (
                            <div className="relative h-56 overflow-hidden">
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-white/90 backdrop-blur-sm capitalize">
                                  {post.category.replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 text-gray-600 text-sm mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(post.published_date)}</span>
                              </div>
                              {post.read_time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{post.read_time}</span>
                                </div>
                              )}
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {post.seo_optimized_title || post.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                              {post.meta_description || post.excerpt}
                            </p>
                            
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.slice(0, 3).map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <User className="w-4 h-4" />
                                <span>{post.author}</span>
                              </div>
                              
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-transform">
                                Read More
                                <ArrowRight className="ml-1 w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </ScrollFadeSection>
          )}
        </>
      )}

      {/* Newsletter CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Stay Informed
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Subscribe to receive the latest updates on compliance regulations, best practices, and industry insights delivered to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-12 w-full rounded-md border border-input bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Have Questions?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Our team is here to help you navigate compliance requirements and find the right solutions for your project.
            </p>
            
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
                Get in Touch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>
  );
}