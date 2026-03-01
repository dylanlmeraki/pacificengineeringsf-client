import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Save, Eye, Trash2, Plus, X } from "lucide-react";
import AdminRoute from "../components/internal/AdminRoute";


export default function BlogEditor() {
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    seo_optimized_title: "",
    slug: "",
    excerpt: "",
    meta_description: "",
    content: "",
    category: "compliance",
    tags: [],
    keywords: [],
    author: "Pacific Engineering Team",
    featured_image: "",
    read_time: "",
    published: false,
    featured: false
  });
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date'),
    initialData: []
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.BlogPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      resetForm();
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, postData }) => base44.entities.BlogPost.update(id, postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      setSelectedPost(null);
      resetForm();
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      seo_optimized_title: "",
      slug: "",
      excerpt: "",
      meta_description: "",
      content: "",
      category: "compliance",
      tags: [],
      keywords: [],
      author: "Pacific Engineering Team",
      featured_image: "",
      read_time: "",
      published: false,
      featured: false
    });
    setSelectedPost(null);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const generateAIBlogContent = async () => {
    setIsGeneratingContent(true);
    try {
      const response = await base44.functions.invoke('generateBlogContent', { 
        category: formData.category,
        targetLength: "medium"
      });

      setFormData(prev => ({
        ...prev,
        title: response.data.blogData.title,
        excerpt: response.data.blogData.excerpt,
        content: response.data.blogData.content,
        featured_image: response.data.blogData.featured_image,
        author: response.data.blogData.author,
        read_time: response.data.blogData.read_time
      }));
    } catch (error) {
      console.error("Error generating blog content:", error);
      alert("Failed to generate blog content. Please try again.");
    }
    setIsGeneratingContent(false);
  };

  const generateSEOContent = async () => {
    if (!formData.title || !formData.content) {
      alert("Please enter a title and content first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Given this blog post:
Title: "${formData.title}"
Content: "${formData.content.substring(0, 1000)}..."
Category: ${formData.category}

Generate:
1. An SEO-optimized title (60 characters max, include keywords)
2. A compelling meta description (150-160 characters)
3. 5-7 relevant tags
4. 5-7 SEO keywords

Format as JSON:
{
  "seo_title": "...",
  "meta_description": "...",
  "tags": ["tag1", "tag2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            seo_title: { type: "string" },
            meta_description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            keywords: { type: "array", items: { type: "string" } }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        seo_optimized_title: response.seo_title,
        meta_description: response.meta_description,
        tags: response.tags,
        keywords: response.keywords,
        slug: generateSlug(formData.title),
        read_time: estimateReadTime(formData.content)
      }));
    } catch (error) {
      console.error("Error generating SEO content:", error);
      alert("Failed to generate SEO content. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      read_time: formData.read_time || estimateReadTime(formData.content),
      published_date: formData.published ? new Date().toISOString().split('T')[0] : null
    };

    if (selectedPost) {
      updatePostMutation.mutate({ id: selectedPost.id, postData });
    } else {
      createPostMutation.mutate(postData);
    }
  };

  const loadPost = (post) => {
    setSelectedPost(post);
    setFormData(post);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  return (
    <AdminRoute>
      
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog Post Editor</h1>
            <p className="text-gray-600 text-lg">
              Create and manage blog posts with AI-powered SEO optimization
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Posts List */}
              <div className="lg:col-span-1">
                <Card className="p-6 border-0 shadow-xl sticky top-40">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={resetForm}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        New
                      </Button>
                      <Button
                        onClick={generateAIBlogContent}
                        disabled={isGeneratingContent}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {isGeneratingContent ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-1" />
                        )}
                        Auto-Generate Content
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {blogPosts.map((post) => (
                        <div
                          key={post.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedPost?.id === post.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                          onClick={() => loadPost(post)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                              {post.title}
                            </h3>
                            {post.published && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                Published
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {post.category}
                            </Badge>
                            {post.featured && (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Editor Form */}
              <div className="lg:col-span-2">
                <Card className="p-8 border-0 shadow-xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <Label htmlFor="title" className="text-lg font-semibold text-gray-900 mb-3 block">
                        Post Title *
                      </Label>
                      <Input
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter post title..."
                        className="text-lg h-12"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="category" className="text-gray-700 font-medium mb-2 block">
                          Category *
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="best-practices">Best Practices</SelectItem>
                            <SelectItem value="regulations">Regulations</SelectItem>
                            <SelectItem value="inspections">Inspections</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="case-studies">Case Studies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="author" className="text-gray-700 font-medium mb-2 block">
                          Author
                        </Label>
                        <Input
                          id="author"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          placeholder="Author name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="excerpt" className="text-gray-700 font-medium mb-2 block">
                        Excerpt
                      </Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Brief summary of the post..."
                        className="h-24"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content" className="text-gray-700 font-medium mb-2 block">
                        Content *
                      </Label>
                      <Textarea
                        id="content"
                        required
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your blog post content..."
                        className="min-h-[300px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="featured_image" className="text-gray-700 font-medium mb-2 block">
                        Featured Image URL
                      </Label>
                      <Input
                        id="featured_image"
                        value={formData.featured_image}
                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* AI SEO Optimization */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">SEO Optimization</h3>
                        <Button
                          type="button"
                          onClick={generateSEOContent}
                          disabled={isGenerating || !formData.title || !formData.content}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Optimize SEO
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="seo_title" className="text-gray-700 font-medium mb-2 block">
                            SEO-Optimized Title
                          </Label>
                          <Input
                            id="seo_title"
                            value={formData.seo_optimized_title}
                            onChange={(e) => setFormData({ ...formData, seo_optimized_title: e.target.value })}
                            placeholder="SEO-friendly title (60 chars max)"
                            maxLength={60}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.seo_optimized_title.length}/60 characters
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="meta_description" className="text-gray-700 font-medium mb-2 block">
                            Meta Description
                          </Label>
                          <Textarea
                            id="meta_description"
                            value={formData.meta_description}
                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                            placeholder="SEO meta description (150-160 chars)"
                            maxLength={160}
                            className="h-20"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.meta_description.length}/160 characters
                          </p>
                        </div>

                        <div>
                          <Label className="text-gray-700 font-medium mb-2 block">
                            Tags
                          </Label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                              placeholder="Add a tag..."
                            />
                            <Button type="button" onClick={addTag} variant="outline">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-700 pr-1">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-2 hover:text-blue-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-gray-700 font-medium mb-2 block">
                            SEO Keywords
                          </Label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={newKeyword}
                              onChange={(e) => setNewKeyword(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                              placeholder="Add a keyword..."
                            />
                            <Button type="button" onClick={addKeyword} variant="outline">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.keywords.map((keyword, idx) => (
                              <Badge key={idx} className="bg-green-100 text-green-700 pr-1">
                                {keyword}
                                <button
                                  type="button"
                                  onClick={() => removeKeyword(keyword)}
                                  className="ml-2 hover:text-green-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="slug" className="text-gray-700 font-medium mb-2 block">
                              URL Slug
                            </Label>
                            <Input
                              id="slug"
                              value={formData.slug}
                              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                              placeholder="url-friendly-slug"
                            />
                          </div>

                          <div>
                            <Label htmlFor="read_time" className="text-gray-700 font-medium mb-2 block">
                              Read Time
                            </Label>
                            <Input
                              id="read_time"
                              value={formData.read_time}
                              onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                              placeholder="5 min read"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Publishing Options */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Publishing Options</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <span className="text-gray-700 font-medium">Publish this post</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <span className="text-gray-700 font-medium">Feature this post</span>
                        </label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={createPostMutation.isPending || updatePostMutation.isPending}
                      >
                        <Save className="w-5 h-5 mr-2" />
                        {selectedPost ? "Update Post" : "Create Post"}
                      </Button>

                      {selectedPost && (
                        <Button
                          type="button"
                          size="lg"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this post?")) {
                              deletePostMutation.mutate(selectedPost.id);
                              resetForm();
                            }
                          }}
                        >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Delete
                        </Button>
                      )}

                      {selectedPost && (
                        <Button
                          type="button"
                          size="lg"
                          variant="outline"
                          onClick={resetForm}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      
    </AdminRoute>
  );
}