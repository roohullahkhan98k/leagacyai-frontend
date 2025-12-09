import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6">
          <FileQuestion className="h-16 w-16 text-primary-600 dark:text-primary-400" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{t('notFound.title')}</h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('notFound.description')}
        </p>
        
        <Link to="/">
          <Button size="lg">
            {t('notFound.returnHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;