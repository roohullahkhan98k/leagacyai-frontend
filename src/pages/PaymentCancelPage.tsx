import { useEffect, useState } from 'react';
import { XCircle, Sparkles, ArrowRight, Home, RefreshCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

const PaymentCancelPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen overflow-hidden flex items-center justify-center">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-2 border-orange-500/50 dark:border-orange-500/50 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {/* Cancel Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                  <div className="relative p-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl">
                    <XCircle className="h-16 w-16" />
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Payment Cancelled
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  Payment Cancelled
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                Your payment was not processed
              </p>

              {/* Description */}
              <div className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl p-6 mb-8 border border-orange-200/50 dark:border-orange-800/50">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your payment process was cancelled. No charges have been made to your account.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  If you encountered any issues during checkout or have questions about our pricing plans, please don't hesitate to contact our support team.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl shadow-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <RefreshCcw className="h-5 w-5 mr-2" />
                    Try Again
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Go to Home
                  </Button>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help? <Link to="/" className="text-orange-600 dark:text-orange-400 hover:underline">Contact Support</Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentCancelPage;

