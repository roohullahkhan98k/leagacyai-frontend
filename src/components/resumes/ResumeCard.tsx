import { File, Edit, Trash } from 'lucide-react';
import { Resume } from '../../types';
import Card, { CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

interface ResumeCardProps {
  resume: Resume;
  onSelect: (resume: Resume) => void;
  onEdit: (resume: Resume) => void;
  onDelete: (resume: Resume) => void;
  isActive?: boolean;
}

const ResumeCard = ({
  resume,
  onSelect,
  onEdit,
  onDelete,
  isActive = false,
}: ResumeCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <Card 
      variant="interactive"
      className={cn(
        'transition-all border-2',
        isActive 
          ? 'border-primary-400 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' 
          : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
      )}
      onClick={() => onSelect(resume)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-md flex-shrink-0">
            <File className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{resume.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uploaded on {formatDate(resume.uploadDate)}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 w-full">
          <Button 
            size="sm" 
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(resume);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="w-full text-error-600 border-error-200 hover:bg-error-50 dark:text-error-400 dark:border-error-800/50 dark:hover:bg-error-900/20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(resume);
            }}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResumeCard;