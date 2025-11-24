import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, Check, HelpCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import FileUpload from '../ui/FileUpload';

interface ResumeUploaderProps {
  onUploadComplete: (resume: { name: string; file: File }) => void;
}

const ResumeUploader = ({ onUploadComplete }: ResumeUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [step, setStep] = useState<'upload' | 'details' | 'processing' | 'complete'>('upload');
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // Auto-extract a name from the file name by removing extension
    const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
    setName(fileName);
    setStep('details');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !name.trim()) return;
    
    setStep('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      setStep('complete');
      onUploadComplete({ name, file });
      
      // Reset form after a delay
      setTimeout(() => {
        setFile(null);
        setName('');
        setStep('upload');
      }, 2000);
    }, 1500);
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 flex items-start">
                <HelpCircle className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload your resume to help generate personalized interview answers based on your experience.
                </p>
              </div>
              
              <FileUpload
                accept=".pdf,.doc,.docx"
                maxSize={5}
                onFileSelect={handleFileSelect}
              />
            </motion.div>
          )}
          
          {step === 'details' && (
            <motion.form
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="resume-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resume Name
                  </label>
                  <input
                    type="text"
                    id="resume-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    bg-white dark:bg-gray-800"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Button
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      setFile(null);
                      setStep('upload');
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={!name.trim()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Process Resume
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
          
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <div className="inline-block p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Processing Resume</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Extracting information to personalize your interview experience</p>
            </motion.div>
          )}
          
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <div className="inline-block p-3 rounded-full bg-success-100 dark:bg-success-900/30 mb-4">
                <Check className="h-8 w-8 text-success-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Resume Uploaded</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your resume has been successfully processed</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ResumeUploader;