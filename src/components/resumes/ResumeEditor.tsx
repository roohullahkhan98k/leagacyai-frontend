import { useState } from 'react';
import { Save, X, Plus, Trash } from 'lucide-react';
import Button from '../ui/Button';
import { Resume, Experience, Education } from '../../types';

interface ResumeEditorProps {
  resume: Resume;
  onSave: (resume: Resume) => void;
  onCancel: () => void;
}

const ResumeEditor = ({ resume, onSave, onCancel }: ResumeEditorProps) => {
  const [editedResume, setEditedResume] = useState<Resume>({
    ...resume,
    content: resume.content || {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
      },
      experience: [],
      education: [],
      skills: []
    }
  });

  const handlePersonalInfoChange = (field: string, value: string) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        personalInfo: {
          ...prev.content!.personalInfo,
          [field]: value
        }
      }
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        experience: prev.content!.experience.map((exp, i) => 
          i === index ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const handleExperienceAchievementChange = (expIndex: number, achievementIndex: number, value: string) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        experience: prev.content!.experience.map((exp, i) => 
          i === expIndex ? {
            ...exp,
            achievements: exp.achievements.map((ach, j) => 
              j === achievementIndex ? value : ach
            )
          } : exp
        )
      }
    }));
  };

  const addExperience = () => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        experience: [
          ...prev.content!.experience,
          {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: '',
            achievements: ['']
          }
        ]
      }
    }));
  };

  const removeExperience = (index: number) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        experience: prev.content!.experience.filter((_, i) => i !== index)
      }
    }));
  };

  const addAchievement = (experienceIndex: number) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        experience: prev.content!.experience.map((exp, i) => 
          i === experienceIndex ? {
            ...exp,
            achievements: [...exp.achievements, '']
          } : exp
        )
      }
    }));
  };

  const removeAchievement = (experienceIndex: number, achievementIndex: number) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        experience: prev.content!.experience.map((exp, i) => 
          i === experienceIndex ? {
            ...exp,
            achievements: exp.achievements.filter((_, j) => j !== achievementIndex)
          } : exp
        )
      }
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        education: prev.content!.education.map((edu, i) => 
          i === index ? { ...edu, [field]: value } : edu
        )
      }
    }));
  };

  const addEducation = () => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        education: [
          ...prev.content!.education,
          {
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: ''
          }
        ]
      }
    }));
  };

  const removeEducation = (index: number) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        education: prev.content!.education.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(Boolean);
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        skills
      }
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={editedResume.content?.personalInfo.name}
                onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={editedResume.content?.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={editedResume.content?.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={editedResume.content?.personalInfo.location}
                onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Professional Summary</label>
              <textarea
                value={editedResume.content?.personalInfo.summary}
                onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Experience</h3>
            <Button size="sm" onClick={addExperience}>
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </Button>
          </div>
          
          {editedResume.content?.experience.map((exp, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-md font-medium">Experience {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-error-600 hover:text-error-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="e.g., Jan 2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="e.g., Present"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Key Achievements</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addAchievement(index)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Achievement
                    </Button>
                  </div>
                  {exp.achievements.map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => handleExperienceAchievementChange(index, achievementIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                        placeholder="e.g., Increased sales by 25%"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAchievement(index, achievementIndex)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Education</h3>
            <Button size="sm" onClick={addEducation}>
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </Button>
          </div>
          
          {editedResume.content?.education.map((edu, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-md font-medium">Education {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                  className="text-error-600 hover:text-error-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                      placeholder="e.g., Sep 2018"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                      placeholder="e.g., May 2022"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              Skills (comma-separated)
            </label>
            <textarea
              value={editedResume.content?.skills.join(', ')}
              onChange={(e) => handleSkillsChange(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="e.g., JavaScript, React, Node.js, TypeScript"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedResume)}>
          <Save className="h-4 w-4 mr-1" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ResumeEditor;