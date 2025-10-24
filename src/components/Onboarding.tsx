import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Users, Video, Instagram, Play, CheckCircle } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import logoImage from '../assets/no-bg-logo.png';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user, updateUserProfile } = useSupabase();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    preferred_name: '',
    creator_type: '' as 'ugc_creator' | 'content_creator' | 'both' | '',
    main_platform: '' as 'instagram' | 'tiktok' | 'youtube' | 'other' | ''
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Update user profile with onboarding data
      await updateUserProfile({
        preferred_name: formData.preferred_name,
        creator_type: formData.creator_type,
        main_platform: formData.main_platform,
        onboarding_complete: true,
        email: user?.email || ''
      });

      // Complete onboarding
      onComplete();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.preferred_name.trim().length > 0;
      case 2:
        return formData.creator_type !== '';
      case 3:
        return true; // Platform is optional
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#E83F87]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-[#E83F87]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your preferred name?</h2>
        <p className="text-gray-600">This is how we'll address you throughout AIEVE</p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={formData.preferred_name}
            onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
            placeholder="Enter your preferred name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200 text-lg"
            autoFocus
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#E83F87]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-[#E83F87]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Which best describes you?</h2>
        <p className="text-gray-600">Help us customize your experience</p>
      </div>

      <div className="space-y-3">
        {[
          { value: 'ugc_creator', label: 'UGC Creator', desc: 'I create user-generated content for brands' },
          { value: 'content_creator', label: 'Content Creator', desc: 'I create content for my own audience' },
          { value: 'both', label: 'Both', desc: 'I do both UGC and content creation' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFormData({ ...formData, creator_type: option.value as 'ugc_creator' | 'content_creator' | 'both' })}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 hover:border-[#E83F87]/50 ${
              formData.creator_type === option.value
                ? 'border-[#E83F87] bg-[#E83F87]/5'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </div>
              {formData.creator_type === option.value && (
                <CheckCircle className="w-5 h-5 text-[#E83F87]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#E83F87]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-[#E83F87]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your main platform?</h2>
        <p className="text-gray-600">Optional - you can always change this later</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'instagram', label: 'Instagram', icon: Instagram },
          { value: 'tiktok', label: 'TikTok', icon: Video },
          { value: 'youtube', label: 'YouTube', icon: Play },
          { value: 'other', label: 'Other', icon: Users }
        ].map((platform) => {
          const IconComponent = platform.icon;
          return (
            <button
              key={platform.value}
              onClick={() => setFormData({ ...formData, main_platform: platform.value as 'instagram' | 'tiktok' | 'youtube' | 'other' })}
              className={`p-4 border-2 rounded-xl transition-all duration-200 hover:border-[#E83F87]/50 ${
                formData.main_platform === platform.value
                  ? 'border-[#E83F87] bg-[#E83F87]/5'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <IconComponent className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-900">{platform.label}</span>
                {formData.main_platform === platform.value && (
                  <CheckCircle className="w-4 h-4 text-[#E83F87]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logoImage} alt="AIEVE" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900">Welcome to AIEVE!</h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#E83F87] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="transition-all duration-300">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors duration-200 ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-6 py-2 rounded-xl transition-colors duration-200 ${
                canProceed()
                  ? 'bg-[#E83F87] text-white hover:bg-[#d63577]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;