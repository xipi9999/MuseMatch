import React, { useState } from 'react';
import { MusicAnalysis, ScoredItem } from '../types';
import { Copy, Check, Music, Wand2, Mic2, FileText, Activity, Radio, Play } from './Icons';

interface ResultCardProps {
  data: MusicAnalysis;
}

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-surface border border-white/10 hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      {label || (copied ? "Copied" : "Copy")}
    </button>
  );
};

const ScoredList = ({ items }: { items: ScoredItem[] }) => (
  <div className="flex flex-wrap gap-x-1 text-sm text-gray-300">
    {items.map((item, idx) => (
      <span key={idx}>
        {item.name} <span className="text-secondary/80">({item.score})</span>
        {idx < items.length - 1 && ","}
      </span>
    ))}
  </div>
);

const SectionBlock = ({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
  <div className={`mb-4 ${className}`}>
    <h4 className="text-primary text-sm font-semibold mb-1">{title}</h4>
    {children}
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Top Header & Player */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
            <div className="flex items-center justify-center gap-4 text-secondary mb-2">
                <Activity size={24} className="animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
                  {data.songTitle ? `${data.artist} - ${data.songTitle}` : "Track Analysis"}
                </h2>
                <Activity size={24} className="animate-pulse" />
            </div>
        </div>

        {/* Video Embed */}
        {data.videoId && (
            <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black">
               <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${data.videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
        )}
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lyrics Analysis Column */}
        <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <FileText className="text-orange-400" size={24} />
                <h3 className="text-xl font-bold text-gray-200 tracking-wide uppercase">Lyrics Analysis</h3>
            </div>

            <SectionBlock title="Summary">
                <p className="text-sm text-gray-300 leading-relaxed">{data.lyricsSummary}</p>
            </SectionBlock>

            <SectionBlock title="Moods">
                <ScoredList items={data.lyricsMoods} />
            </SectionBlock>

            <SectionBlock title="Themes">
                <ScoredList items={data.lyricsThemes} />
            </SectionBlock>

            <div className="grid grid-cols-2 gap-4">
                <SectionBlock title="Language">
                    <p className="text-sm text-gray-300">{data.language}</p>
                </SectionBlock>
                <SectionBlock title="Explicit">
                    <p className="text-sm text-gray-300">{data.explicit}</p>
                </SectionBlock>
            </div>
        </div>

        {/* Music Analysis Column */}
        <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <Radio className="text-pink-500" size={24} />
                <h3 className="text-xl font-bold text-gray-200 tracking-wide uppercase">Music Analysis</h3>
            </div>

            <SectionBlock title="Genres">
                <ScoredList items={data.genres} />
            </SectionBlock>

            <SectionBlock title="Subgenres">
                <ScoredList items={data.subgenres} />
            </SectionBlock>

            <SectionBlock title="Moods">
                 <ScoredList items={data.musicMoods} />
            </SectionBlock>

            <SectionBlock title="Instruments">
                <p className="text-sm text-gray-300">{data.instruments.join(", ")}</p>
            </SectionBlock>
            
            <div className="grid grid-cols-2 gap-4">
                <SectionBlock title="BPM & Key">
                    <p className="text-sm text-gray-300">{data.bpm}, {data.key}</p>
                </SectionBlock>
                <SectionBlock title="Vocals">
                    <p className="text-sm text-gray-300">{data.vocals}</p>
                </SectionBlock>
            </div>
        </div>
      </div>

      {/* Sources (if any) */}
      {data.sources && data.sources.length > 0 && (
         <div className="bg-surface/30 rounded-xl p-4 border border-white/5">
             <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Information Sources</p>
             <div className="flex flex-wrap gap-2">
                 {data.sources.map((source, idx) => (
                     <a 
                         key={idx} 
                         href={source.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
                     >
                         {source.title}
                     </a>
                 ))}
             </div>
         </div>
       )}

      {/* Suno Prompts */}
      <div className="space-y-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 mb-4">
            <Wand2 className="text-yellow-400" size={28} />
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">Suno Prompts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.sunoPrompts.map((prompt, idx) => (
                <div key={idx} className="flex flex-col bg-gradient-to-b from-surface to-background hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 rounded-xl p-6 shadow-lg group">
                    <div className="mb-4">
                        <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors text-center">
                            {prompt.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2 text-center italic">{prompt.explanation}</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="bg-black/40 rounded-lg p-3 border border-white/5 relative">
                            <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Prompt</span>
                            <p className="text-gray-200 text-xs leading-relaxed font-mono">
                                {prompt.prompt}
                            </p>
                            <div className="mt-2 flex justify-end">
                                <CopyButton text={prompt.prompt} />
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-lg p-3 border border-white/5 relative">
                             <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Tags</span>
                            <p className="text-accent text-xs font-medium font-mono">
                                {prompt.tags}
                            </p>
                            <div className="mt-2 flex justify-end">
                                <CopyButton text={prompt.tags} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};