import React, { useState, useRef } from 'react';
import { AnalysisSource } from '../types';
import { Youtube, FileAudio, Upload, Music, Loader2 } from './Icons';

interface AnalysisInputProps {
  onAnalyze: (source: AnalysisSource, data: string | File) => void;
  isLoading: boolean;
}

export const AnalysisInput: React.FC<AnalysisInputProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<AnalysisSource>(AnalysisSource.YOUTUBE);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/')) {
        setFile(droppedFile);
        setActiveTab(AnalysisSource.FILE);
      } else {
        alert("Please upload an audio file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === AnalysisSource.YOUTUBE) {
      if (url.trim()) onAnalyze(AnalysisSource.YOUTUBE, url);
    } else {
      if (file) onAnalyze(AnalysisSource.FILE, file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-2 shadow-2xl">
      <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-4">
        <button
          onClick={() => setActiveTab(AnalysisSource.YOUTUBE)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === AnalysisSource.YOUTUBE
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Youtube size={18} />
          <span>YouTube Link</span>
        </button>
        <button
          onClick={() => setActiveTab(AnalysisSource.FILE)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === AnalysisSource.FILE
              ? 'bg-secondary text-white shadow-lg shadow-secondary/25'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileAudio size={18} />
          <span>Upload File</span>
        </button>
      </div>

      <div className="p-4">
        {activeTab === AnalysisSource.YOUTUBE ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              disabled={isLoading || !url}
              type="submit"
              className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Music size={20} />}
              Analyze
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-secondary bg-secondary/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${file ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-gray-400'}`}>
                  {file ? <Music size={32} /> : <Upload size={32} />}
                </div>
                <div>
                  <p className="font-medium text-white mb-1">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-sm text-gray-500">MP3, WAV, M4A (Max 10MB)</p>
                </div>
              </div>
            </div>
            
            {file && (
               <button
               onClick={() => onAnalyze(AnalysisSource.FILE, file)}
               disabled={isLoading}
               className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {isLoading ? <Loader2 className="animate-spin" /> : <Music size={20} />}
               Analyze Audio File
             </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};