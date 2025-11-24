// import { useState } from 'react';
// import { PlusCircle } from 'lucide-react';
// import Button from '../components/ui/Button';
// import PageContainer from '../components/layout/PageContainer';
// import ResumeUploader from '../components/resumes/ResumeUploader';
// import ResumeCard from '../components/resumes/ResumeCard';
// import ResumeEditor from '../components/resumes/ResumeEditor';
// import { Resume } from '../types';

// // Sample data for demonstration
// const sampleResumes: Resume[] = [
//   {
//     id: '1',
//     name: 'Software Engineer Resume',
//     file: null,
//     uploadDate: new Date('2023-04-15'),
//     content: {
//       personalInfo: {
//         name: 'Alex Johnson',
//         email: 'alex@example.com',
//         phone: '(555) 123-4567',
//         location: 'San Francisco, CA',
//         summary: 'Software engineer with 5 years of experience in full-stack development.'
//       },
//       experience: [
//         {
//           company: 'Tech Solutions Inc.',
//           position: 'Senior Developer',
//           startDate: 'Jan 2020',
//           endDate: 'Present',
//           description: 'Full-stack development for enterprise applications.',
//           achievements: [
//             'Reduced page load times by 40%',
//             'Implemented CI/CD pipeline',
//             'Mentored junior developers'
//           ]
//         }
//       ],
//       education: [
//         {
//           institution: 'University of California',
//           degree: 'Bachelor of Science',
//           field: 'Computer Science',
//           startDate: 'Sep 2014',
//           endDate: 'May 2018'
//         }
//       ],
//       skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker']
//     }
//   },
//   {
//     id: '2',
//     name: 'Product Manager Resume',
//     file: null,
//     uploadDate: new Date('2023-05-20'),
//     content: {
//       personalInfo: {
//         name: 'Sam Smith',
//         email: 'sam@example.com',
//         location: 'Austin, TX',
//         summary: 'Product manager with experience in SaaS products.'
//       },
//       experience: [
//         {
//           company: 'Product Innovations',
//           position: 'Product Manager',
//           startDate: 'Jun 2019',
//           endDate: 'Present',
//           description: 'Managing product lifecycle for B2B SaaS solutions.',
//           achievements: [
//             'Launched 3 new product features',
//             'Increased user retention by 25%'
//           ]
//         }
//       ],
//       education: [
//         {
//           institution: 'Michigan State University',
//           degree: 'MBA',
//           field: 'Business Administration',
//           startDate: 'Sep 2016',
//           endDate: 'May 2018'
//         }
//       ],
//       skills: ['Product Strategy', 'User Research', 'Agile', 'Roadmapping', 'Data Analysis']
//     }
//   }
// ];

// const ResumesPage = () => {
//   const [resumes, setResumes] = useState<Resume[]>(sampleResumes);
//   const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
//   const [showUploader, setShowUploader] = useState(false);
//   const [editingResume, setEditingResume] = useState<Resume | null>(null);

//   const handleUploadComplete = (resumeData: { name: string; file: File }) => {
//     const newResume: Resume = {
//       id: Date.now().toString(),
//       name: resumeData.name,
//       file: resumeData.file,
//       uploadDate: new Date(),
//       content: {
//         personalInfo: {
//           name: '',
//           email: '',
//           summary: 'Resume content would be extracted from the uploaded file.'
//         },
//         experience: [],
//         education: [],
//         skills: ['React', 'JavaScript', 'TypeScript', 'UI/UX']
//       }
//     };
    
//     setResumes(prev => [newResume, ...prev]);
//     setShowUploader(false);
//   };
  
//   const handleResumeSelect = (resume: Resume) => {
//     setActiveResumeId(resume.id);
//   };
  
//   const handleResumeEdit = (resume: Resume) => {
//     setEditingResume(resume);
//   };
  
//   const handleResumeDelete = (resume: Resume) => {
//     setResumes(prev => prev.filter(r => r.id !== resume.id));
//     if (activeResumeId === resume.id) {
//       setActiveResumeId(null);
//     }
//   };

//   const handleSaveEdit = (updatedResume: Resume) => {
//     setResumes(prev => prev.map(r => 
//       r.id === updatedResume.id ? updatedResume : r
//     ));
//     setEditingResume(null);
//   };
  
//   return (
//     <PageContainer 
//       title="Resume Management" 
//       description="Upload and manage your resumes to power personalized interview responses."
//     >
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <p className="text-gray-600 dark:text-gray-400">
//             {resumes.length === 0 
//               ? 'No resumes uploaded yet. Add your first resume to get started.' 
//               : `You have ${resumes.length} resume${resumes.length !== 1 ? 's' : ''}.`}
//           </p>
//         </div>
//         <Button onClick={() => setShowUploader(true)}>
//           <PlusCircle className="h-4 w-4 mr-1" />
//           Add Resume
//         </Button>
//       </div>
      
//       {showUploader ? (
//         <div className="mb-8">
//           <ResumeUploader 
//             onUploadComplete={handleUploadComplete} 
//           />
//           <div className="mt-4 text-center">
//             <Button variant="secondary" onClick={() => setShowUploader(false)}>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       ) : editingResume ? (
//         <ResumeEditor
//           resume={editingResume}
//           onSave={handleSaveEdit}
//           onCancel={() => setEditingResume(null)}
//         />
//       ) : (
//         resumes.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500 dark:text-gray-400 mb-4">
//               You haven't uploaded any resumes yet.
//             </p>
//             <Button onClick={() => setShowUploader(true)}>
//               Upload Your First Resume
//             </Button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {resumes.map(resume => (
//               <ResumeCard
//                 key={resume.id}
//                 resume={resume}
//                 onSelect={handleResumeSelect}
//                 onEdit={handleResumeEdit}
//                 onDelete={handleResumeDelete}
//                 isActive={activeResumeId === resume.id}
//               />
//             ))}
//           </div>
//         )
//       )}
//     </PageContainer>
//   );
// };

// export default ResumesPage;