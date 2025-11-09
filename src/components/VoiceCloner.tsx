import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Upload, Play, Pause } from 'lucide-react';
import { ElevenLabsService } from '../lib/integrations';

interface VoiceClonerProps {
  onVoiceCloned: (voiceId: string, voiceName: string) => void;
}

const VoiceCloner: React.FC<VoiceClonerProps> = ({ onVoiceCloned }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setPreviewAudio(url);
    }
  };

  const handleCloneVoice = async () => {
    if (!audioFile || !voiceName) return;

    setIsCloning(true);
    try {
      const elevenLabs = new ElevenLabsService(import.meta.env.VITE_ELEVENLABS_API_KEY);
      const result = await elevenLabs.cloneVoice(voiceName, audioFile);
      
      if (result.voice_id) {
        onVoiceCloned(result.voice_id, voiceName);
      }
    } catch (error) {
      console.error('Error cloning voice:', error);
    } finally {
      setIsCloning(false);
    }
  };

  const togglePlayback = () => {
    if (!previewAudio) return;

    const audio = new Audio(previewAudio);
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Clone Your Voice</h3>
        <p className="text-gray-600 text-sm">
          Upload a clear audio sample to create your personalized AI voice
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice Name
          </label>
          <input
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder="My Custom Voice"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio Sample
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                MP3, WAV, or M4A (max 10MB)
              </p>
            </label>
          </div>
        </div>

        {audioFile && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{audioFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={togglePlayback}
                className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-purple-600" />
                ) : (
                  <Play className="w-4 h-4 text-purple-600" />
                )}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleCloneVoice}
          disabled={!audioFile || !voiceName || isCloning}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCloning ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Cloning Voice...
            </div>
          ) : (
            'Clone Voice'
          )}
        </button>

        <div className="text-xs text-gray-500 text-center">
          <p>Voice cloning typically takes 2-3 minutes</p>
          <p>Ensure your audio is clear and at least 30 seconds long</p>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceCloner;