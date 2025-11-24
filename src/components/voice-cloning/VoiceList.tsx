import { useState, useEffect } from 'react';
import { Trash2, User, Sparkles, Play, MoreVertical, CheckCircle, Calendar, Volume2, Settings, Star } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { getVoices, deleteVoice, Voice, CustomVoice } from '../../services/voiceCloningApi';
import { toast } from 'react-toastify';

interface VoiceListProps {
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
  selectedVoiceId?: string;
  onVoicesUpdated: () => void;
}

const VoiceList = ({ onVoiceSelect, selectedVoiceId, onVoicesUpdated }: VoiceListProps) => {
  const [defaultVoices, setDefaultVoices] = useState<Voice[]>([]);
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState<string | null>(null);
  const [expandedVoiceId, setExpandedVoiceId] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getVoices();
      
      if (result.success) {
        setDefaultVoices(result.voices.default || []);
        setCustomVoices(result.voices.custom || []);
      } else {
        setError('Failed to load voices');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load voices';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoice = async (voiceId: string, voiceName: string, isCustom: boolean) => {
    if (!isCustom) {
      toast.error('Cannot delete default voices', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${voiceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingVoiceId(voiceId);
      await deleteVoice(voiceId);
      
      toast.success(`Voice "${voiceName}" deleted successfully`, {
        position: 'top-right',
        autoClose: 3000,
      });
      
      setCustomVoices(customVoices.filter(v => v.voice_id !== voiceId));
      onVoicesUpdated();
      
      // If the deleted voice was selected, clear selection
      if (selectedVoiceId === voiceId) {
        onVoiceSelect('', '');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete voice';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setDeletingVoiceId(null);
    }
  };

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    onVoiceSelect(voiceId, voiceName);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Your Voice Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading your voices...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Your Voice Library
          </div>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
            {defaultVoices.length + customVoices.length} voice{defaultVoices.length + customVoices.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <span className="font-medium">Error loading voices</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Custom Voices Section */}
        {customVoices.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2 text-purple-600" />
              Your Custom Voices ({customVoices.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customVoices.map((voice) => {
                const voiceId = voice.voice_id;
                const isSelected = selectedVoiceId === voiceId;
                const isDeleting = deletingVoiceId === voiceId;
                
                return (
                  <div
                    key={voiceId}
                    className={`group relative bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                      isSelected
                        ? 'border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {voice.voice_name}
                            </h4>
                            <span className="px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              <Star className="h-3 w-3 inline mr-1" />
                              Custom
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(voice.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVoiceSelect(voiceId, voice.voice_name)}
                          variant={isSelected ? 'primary' : 'outline'}
                          size="sm"
                          className="flex-1"
                          disabled={isDeleting}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Use Voice
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteVoice(voiceId, voice.voice_name, true)}
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 px-3"
                        >
                          {isDeleting ? (
                            <div className="h-4 w-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Default Voices Section */}
        {defaultVoices.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
              Default Voices ({defaultVoices.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {defaultVoices.map((voice) => {
                const voiceId = (voice as any).voice_id || voice.voiceId;
                const isSelected = selectedVoiceId === voiceId;
                
                return (
                  <div
                    key={voiceId}
                    className={`group relative bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                      isSelected
                        ? 'border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {voice.name}
                            </h4>
                            <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              Default
                            </span>
                          </div>
                          
                          {voice.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {voice.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVoiceSelect(voiceId, voice.name)}
                          variant={isSelected ? 'primary' : 'outline'}
                          size="sm"
                          className="flex-1"
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Use Voice
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {defaultVoices.length === 0 && customVoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No voice clones yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first voice clone to get started with AI speech generation
            </p>
            <Button 
              onClick={() => onVoicesUpdated()} 
              variant="outline"
              className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Voice Clone
            </Button>
          </div>
        ) : null}

        {/* Quick Actions */}
        {(defaultVoices.length > 0 || customVoices.length > 0) && (
          <div className="flex justify-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              onClick={loadVoices}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Refresh Voices
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceList;
