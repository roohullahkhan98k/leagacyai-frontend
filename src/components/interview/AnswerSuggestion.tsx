import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AnswerSuggestionProps {
  question: string;
  answer: string;
  category: 'technical' | 'behavioral' | 'situational' | 'general';
  isActive: boolean;
}

const AnswerSuggestion = ({
  question,
  answer,
  category,
  isActive,
}: AnswerSuggestionProps) => {
  const categoryColors = {
    technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    behavioral: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    situational: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 shadow-floating border border-gray-200 dark:border-gray-700 max-w-2xl w-full"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30">
          <Lightbulb className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              categoryColors[category]
            )}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Q: {question}
            </h4>
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
              <p className="whitespace-pre-line">{answer}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnswerSuggestion;