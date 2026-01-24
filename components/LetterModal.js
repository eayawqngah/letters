import { ArrowLeft, Edit, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Mood Options
const moodOptions = [
  { value: 'grateful', label: 'Grateful', icon: 'Heart', color: '#C66F80' },
  { value: 'sad', label: 'Sad', icon: 'Frown', color: '#6B7AA1' },
  { value: 'happy', label: 'Happy', icon: 'Smile', color: '#F4C430' },
  { value: 'anxious', label: 'Anxious', icon: 'Cloud', color: '#8B8680' },
  { value: 'angry', label: 'Angry', icon: 'Flame', color: '#D44D5C' },
  { value: 'peaceful', label: 'Peaceful', icon: 'Sun', color: '#9FAA74' },
  { value: 'lonely', label: 'Lonely', icon: 'Moon', color: '#B4A7D6' },
  { value: 'hopeful', label: 'Hopeful', icon: 'Wind', color: '#87CEEB' },
  { value: 'overwhelmed', label: 'Overwhelmed', icon: 'Droplets', color: '#5B9AA0' },
  { value: 'healing', label: 'Healing', icon: 'Heart', color: '#4A6644' }
]

// MoodSelector Component
function MoodSelector({ selectedMood, onMoodChange }) {
  return (
    <div className="mb-6">
      <label className="block text-lg font-semibold text-[#4A6644] mb-4">
        How are you feeling right now? <span className="text-[#C66F80]">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {moodOptions.map((option) => {
          const isSelected = selectedMood === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onMoodChange(option.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                isSelected
                  ? 'border-[#C66F80] bg-[#FCEBF1] shadow-md scale-105'
                  : 'border-[#F4C7D0] hover:border-[#C66F80] hover:bg-[#FCEBF1]'
              }`}
              style={isSelected ? { borderColor: option.color } : {}}
            >
              <span className="text-2xl">{getMoodEmoji(option.value)}</span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-[#4A6644]' : 'text-[#4A6644]/70'
                }`}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function getMoodEmoji(mood) {
  const emojiMap = {
    grateful: '💝',
    sad: '😢',
    happy: '😊',
    anxious: '☁️',
    angry: '🔥',
    peaceful: '☀️',
    lonely: '🌙',
    hopeful: '🌬️',
    overwhelmed: '💧',
    healing: '💚'
  }
  return emojiMap[mood] || '💌'
}

export default function LetterModal({ mode, letter, onClose, onSave, onDelete, userId }) {
  const [recipientName, setRecipientName] = useState(letter?.recipient_name || '')
  const [letterContent, setLetterContent] = useState(letter?.letter_content || '')
  const [mood, setMood] = useState(letter?.mood || '')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!letterContent.trim()) {
      alert('Please write your letter before saving.')
      return
    }

    if (!mood) {
      alert('Please select how you\'re feeling before saving.')
      return
    }

    setIsSaving(true)

    if (mode === 'edit' && letter) {
      // Update existing letter
      const { error } = await supabase
        .from('letters')
        .update({
          recipient_name: recipientName,
          letter_content: letterContent,
          mood: mood
        })
        .eq('id', letter.id)

      if (error) {
        alert('Error updating letter')
        setIsSaving(false)
      } else {
        alert('Letter updated! 💌')
        onSave()
      }
    } else {
      // Create new letter
      const { error } = await supabase
        .from('letters')
        .insert([
          {
            recipient_name: recipientName,
            letter_content: letterContent,
            mood: mood,
            user_id: userId
          }
        ])

      if (error) {
        alert('Error saving letter')
        setIsSaving(false)
      } else {
        alert('Letter saved (but never sent) 💌')
        onSave()
      }
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this letter?')) return

    const { error } = await supabase
      .from('letters')
      .delete()
      .eq('id', letter.id)

    if (error) {
      alert('Error deleting letter')
    } else {
      onDelete()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-[#F4C7D0] animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#F4C7D0] bg-[#FCEBF1]">
          <h2 className="text-2xl font-bold text-[#4A6644]">
            {mode === 'view' && `To: ${letter?.recipient_name || 'Untitled'}`}
            {mode === 'edit' && 'Edit Letter'}
            {mode === 'create' && 'Write a New Letter'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-all duration-300 transform hover:scale-110"
          >
            <X className="w-6 h-6 text-[#C66F80]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {mode === 'view' ? (
            // View Mode
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {letter.mood && (
                    <span className="px-4 py-2 bg-[#F4C7D0] text-[#C66F80] rounded-full text-sm font-medium">
                      {getMoodEmoji(letter.mood)} {letter.mood}
                    </span>
                  )}
                  <span className="text-sm text-[#4A6644]/60">
                    {new Date(letter.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-[#4A6644] whitespace-pre-wrap text-lg leading-relaxed">
                  {letter.letter_content}
                </p>
              </div>
            </div>
          ) : (
            // Edit/Create Mode
            <div>
              <MoodSelector selectedMood={mood} onMoodChange={setMood} />

              <input
                type="text"
                placeholder="To: (e.g., 'My younger self', 'Dad', 'My ex')"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full p-3 border-b-2 border-[#F4C7D0] mb-4 text-lg focus:outline-none focus:border-[#C66F80] text-[#4A6644] transition-all duration-300"
              />

              <textarea
                placeholder="Write your letter here... say everything you never could."
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                className="w-full p-4 border-2 border-[#F4C7D0] rounded min-h-96 focus:outline-none focus:border-[#C66F80] text-[#4A6644] transition-all duration-300 focus:shadow-md resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-[#F4C7D0] bg-gray-50">
          {mode === 'view' ? (
            <>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-[#C66F80] text-white rounded-lg hover:bg-[#b35e70] transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300 transform hover:scale-105"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Switch to edit mode - parent component should handle this
                    onClose()
                    // You'll need to add logic in parent to switch modes
                  }}
                  className="px-6 py-2 bg-[#4A6644] text-white rounded-lg hover:bg-[#3d5538] transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-[#C66F80] text-white rounded-lg hover:bg-[#b35e70] transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : mode === 'edit' ? 'Update Letter' : 'Save Letter (Never Send)'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}