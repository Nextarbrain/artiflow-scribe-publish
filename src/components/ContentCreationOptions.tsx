
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, Sparkles, Upload, ArrowRight, Image as ImageIcon } from 'lucide-react';

const ContentCreationOptions = () => {
  const [selectedOption, setSelectedOption] = useState<'write' | 'ai' | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const resetSelection = () => {
    setSelectedOption(null);
    setAiPrompt('');
    setCustomTitle('');
    setCustomContent('');
    setUploadedImage(null);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your Content Creation Method
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start with your own article or let our AI generate one from your image or idea
          </p>
        </div>

        {!selectedOption ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Write Your Own Option */}
            <Card 
              className="p-8 cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg group"
              onClick={() => setSelectedOption('write')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <PenTool className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Write Your Own Article
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Have your content ready? Upload your own article and choose publishers to get it published quickly.
                </p>
                <Button variant="outline" className="w-full">
                  Start Writing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Generate with AI Option */}
            <Card 
              className="p-8 cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg group"
              onClick={() => setSelectedOption('ai')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Generate with AI
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Upload an image or describe your idea, and our AI will create a complete, SEO-optimized article for you.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Generate with AI
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={resetSelection}
              className="mb-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Options
            </Button>

            {selectedOption === 'write' && (
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Write Your Own Article
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Article Title
                    </label>
                    <Input
                      placeholder="Enter your article title..."
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Article Content
                    </label>
                    <Textarea
                      placeholder="Write your article content here..."
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      rows={12}
                      className="text-base"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!customTitle || !customContent}
                  >
                    Continue to Preview
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {selectedOption === 'ai' && (
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Generate Article with AI
                </h3>
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Image (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {uploadedImage ? (
                          <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                            <ImageIcon className="w-5 h-5" />
                            <span>{uploadedImage.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Click to upload an image or drag and drop
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* AI Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Describe your article idea
                    </label>
                    <Textarea
                      placeholder="Describe what you want your article to be about. For example: 'Write an article about sustainable fashion trends for young professionals, focusing on eco-friendly brands and styling tips...'"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={6}
                      className="text-base"
                    />
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!aiPrompt && !uploadedImage}
                  >
                    Generate Article with AI
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ContentCreationOptions;
