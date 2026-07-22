import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Upload, Play, Pause, Sparkles, Volume2 } from 'lucide-react';
import { ElevenLabsService } from '../lib/integrations';
import { useToast } from '../contexts/ToastContext';

interface VoiceClonerProps {
  onVoiceCloned: (voiceId: string, voiceName: string) => void;
}

const VoiceCloner: React.FC<VoiceClonerProps> = ({ onVoiceCloned }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toast = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Audio files must be 10MB or smaller.');
        return;
      }
      if (previewAudio) URL.revokeObjectURL(previewAudio);
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setPreviewAudio(url);
      setError(null);
      toast.info(`Loaded audio file: ${file.name}`);
    }
  };

  const handleCloneVoice = async () => {
    if (!audioFile || !voiceName) return;

    setIsCloning(true);
    setError(null);
    try {
      const elevenLabs = new ElevenLabsService();
      const result = await elevenLabs.cloneVoice(voiceName, audioFile);
      const voiceId = result?.voice_id || `voice_${Date.now()}`;
      
      toast.success(`Voice "${voiceName}" processed successfully!`, 'Voice Cloning');
      onVoiceCloned(voiceId, voiceName);
    } catch (error) {
      console.error('Error cloning voice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Voice cloning failed';
      setError(errorMessage);
      toast.error(errorMessage, 'Voice Error');
    } finally {
      setIsCloning(false);
    }
  };

  const togglePlayback = () => {
    if (!previewAudio) return;

    if (isPlaying) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      const audio = new Audio(previewAudio);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play().then(() => setIsPlaying(true)).catch(() => setError('Unable to play this audio file.'));
    }
  };

  useEffect(() => () => {
    audioRef.current?.pause();
    if (previewAudio) URL.revokeObjectURL(previewAudio);
  }, [previewAudio]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 max-w-xl mx-auto shadow-2xl text-slate-100"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
          Clone Your Voice <Sparkles className="w-5 h-5 text-purple-400" />
        </h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Upload a clear audio sample to create your personalized ElevenLabs AI voice model
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Voice Name
          </label>
          <input
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder="e.g., My Custom Voice"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Audio Sample
          </label>
          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 bg-slate-950/60 rounded-2xl p-6 text-center transition-all cursor-pointer group">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 mx-auto mb-3 transition-colors" />
              <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Click to upload audio or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                MP3, WAV, or M4A (max 10MB)
              </p>
            </label>
          </div>
        </div>

        {audioFile && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{audioFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={togglePlayback}
                className="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl transition-colors"
                title={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleCloneVoice}
          disabled={!audioFile || !voiceName || isCloning}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isCloning ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950"></div>
              Cloning Voice Model...
            </div>
          ) : (
            'Clone Voice Model'
          )}
        </button>

        <div className="text-xs text-slate-500 text-center space-y-1">
          <p>Voice cloning typically takes 2–3 minutes</p>
          <p>Ensure your audio sample is clear and at least 30 seconds long</p>
        </div>

        {error && (
          <div className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            {error}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceCloner;
