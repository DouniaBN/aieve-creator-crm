import React from 'react'
import { X, Sparkles } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onSkipDemo: () => void
  onContinue: () => void
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSkipDemo,
  onContinue
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center space-y-6">
          {/* Welcome message */}
          <div className="space-y-4">
            <div className="text-xl font-semibold text-[#1c2d5a] leading-relaxed">
              <div className="flex items-center justify-center gap-2">
                <span>Hey! I'm Aieve, your admin BFF</span>
                <Sparkles className="w-5 h-5 text-[#1c2d5a]" />
              </div>
              <div className="mt-3">Let's take a quick tour...</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onSkipDemo}
              className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium"
            >
              Skip demo
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-6 py-3 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-all duration-200 font-medium shadow-lg shadow-[#E83F87]/25"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal