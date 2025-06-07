
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ArticlePublisher {
  publisher: {
    id: string;
    name: string;
  };
  cost: number;
}

interface Article {
  id: string;
  title: string;
  total_cost: number;
  article_publishers: ArticlePublisher[];
}

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(2)}`;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const articleId = location.state?.articleId;
    if (!articleId) {
      navigate('/select-publisher');
      return;
    }

    fetchArticle(articleId);
  }, [user, location.state, navigate]);

  const fetchArticle = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          total_cost,
          article_publishers(
            cost,
            publisher:publishers(id, name)
          )
        `)
        .eq('id', articleId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setArticle(data as Article);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Error",
        description: "Failed to load article. Please try again.",
        variant: "destructive",
      });
      navigate('/select-publisher');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!article) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update article status to published
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          status: 'published',
          payment_status: 'paid',
          draft_stage: 'published'
        })
        .eq('id', article.id);

      if (updateError) throw updateError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          article_id: article.id,
          publisher_id: article.article_publishers[0]?.publisher.id, // First publisher for backward compatibility
          amount: article.total_cost,
          status: 'completed',
          total_publishers: article.article_publishers.length,
          publisher_breakdown: article.article_publishers.map(ap => ({
            publisher_id: ap.publisher.id,
            publisher_name: ap.publisher.name,
            cost: ap.cost
          }))
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Payment Successful!",
        description: `Your article has been published to ${article.article_publishers.length} publisher${article.article_publishers.length > 1 ? 's' : ''} successfully.`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToDrafts = async () => {
    if (!article) return;

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          draft_stage: 'payment',
          status: 'draft'
        })
        .eq('id', article.id);

      if (error) throw error;

      toast({
        title: "Saved to Drafts",
        description: "Your article has been saved. You can complete payment later from your dashboard.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving to drafts:', error);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container max-w-2xl py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payment details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!article) return null;

  return (
    <>
      <Header />
      <div className="container max-w-2xl py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/preview-article', { state: { articleId: article.id } })}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Preview
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CreditCard className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
            <CardDescription>
              You're almost done! Pay to publish your article to {article.article_publishers.length} publisher{article.article_publishers.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Article: "{article.title}"</span>
                </div>
                
                <div className="border-t pt-2 space-y-2">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Publishing to:</h4>
                  {article.article_publishers.map((ap, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{ap.publisher.name}</span>
                      <Badge variant="outline">{formatPrice(ap.cost)}</Badge>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Total ({article.article_publishers.length} publisher{article.article_publishers.length > 1 ? 's' : ''}):</span>
                  <span>{formatPrice(article.total_cost)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                <li>• Your article will be published to all {article.article_publishers.length} selected publisher{article.article_publishers.length > 1 ? 's' : ''} immediately</li>
                <li>• You'll receive a confirmation email</li>
                <li>• The article will appear in your dashboard</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={handleSaveToDrafts}
                className="flex-1"
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Save to Drafts
              </Button>
              
              <Button 
                onClick={handlePayment}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Pay {formatPrice(article.total_cost)}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              This is a demo payment. In production, this would integrate with Stripe or similar payment processor.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Payment;
