import { X, Edit, Trash2, Mail, User as UserIcon, Shield, CheckCircle2, XCircle, Calendar, BarChart3, Mic, BrainCircuit, Image, Video } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';
import { AdminUser, GetUserResponse } from '../../services/adminService';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  userDetail: GetUserResponse | null;
  loading: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const UserDetailModal = ({ isOpen, onClose, user, userDetail, loading, onEdit, onDelete }: UserDetailModalProps) => {
  if (!isOpen) return null;

  const stats = userDetail?.statistics;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* User Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{user.email}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
                      <div className="flex items-center gap-2 mt-1">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{user.username}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {user.role === 'admin' && <Shield className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                        {user.isVerified && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">Verified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </span>
                      </div>
                    </div>
                    {user.lastLogin && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {new Date(user.lastLogin).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              {stats && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <BrainCircuit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-blue-700 dark:text-blue-400">Interviews</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{stats.interviews}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <BrainCircuit className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-700 dark:text-green-400">Memories</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-300">{stats.memories}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Mic className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm text-purple-700 dark:text-purple-400">Voices</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">{stats.voices}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Image className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm text-orange-700 dark:text-orange-400">Avatars</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">{stats.avatars}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subscription Info */}
              {stats?.subscription && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</label>
                        <p className="text-gray-900 dark:text-white mt-1 capitalize font-medium">
                          {stats.subscription.plan}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <p className="text-gray-900 dark:text-white mt-1 capitalize font-medium">
                          {stats.subscription.status}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Period Start</label>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {new Date(stats.subscription.current_period_start).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Period End</label>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {new Date(stats.subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                      {stats.subscription.cancel_at_period_end && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-orange-600 dark:text-orange-400">
                            ⚠️ Subscription will cancel at period end
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <Button
                  variant="outline"
                  onClick={onDelete}
                  className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;

