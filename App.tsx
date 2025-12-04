import React, { useState } from 'react';
import { AnalysisInput } from './components/AnalysisInput';
import { ResultCard } from './components/ResultCard';
import { analyzeAudioFile, analyzeYoutubeLink } from './services/geminiService';
import { AnalysisSource, MusicAnalysis } from './types';
import { Loader2, Music } from './components/Icons';

function App() {
  const [result, setResult] = useState<MusicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleAnalyze = async (source: AnalysisSource, data: string | File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let analysisResult: MusicAnalysis;

      if (source === AnalysisSource.FILE && data instanceof File) {
        setStatusMessage('Encoding audio data...');
        const base64 = await fileToBase64(data);
        const mimeType = data.type;
        
        setStatusMessage('Gemini is listening to your track...');
        analysisResult = await analyzeAudioFile(base64, mimeType);
      } else if (source === AnalysisSource.YOUTUBE && typeof data === 'string') {
        setStatusMessage('Analyzing song structure and metadata...');
        analysisResult = await analyzeYoutubeLink(data);
      } else {
        throw new Error("Invalid input");
      }

      setStatusMessage('Generating Suno prompts...');
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the Data-URI prefix (e.g. "data:audio/mp3;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <header className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Music className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold tracking-tight">MuseMatch</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">How it Works</a>
            <a href="#" className="hover:text-white transition-colors">Examples</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
        </nav>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
        {!result && !loading && (
             <div className="text-center max-w-3xl mb-12 animate-in fade-in zoom-in duration-700">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                Turn any song into <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary">Suno AI Magic</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Upload audio or paste a YouTube link. We analyze the mood, instruments, and style to generate perfect prompts for Suno.ai.
                </p>
            </div>
        )}

        <div className="w-full mb-12 relative z-20">
            {!result && (
                <AnalysisInput onAnalyze={handleAnalyze} isLoading={loading} />
            )}
        </div>

        {loading && (
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-xl opacity-50 animate-pulse"></div>
                    <div className="bg-surface border border-white/10 rounded-full p-6 relative z-10">
                        <Loader2 size={48} className="text-white animate-spin" />
                    </div>
                </div>
                <p className="mt-8 text-xl font-medium text-white">{statusMessage}</p>
                <p className="text-sm text-gray-500 mt-2">This usually takes about 10-20 seconds</p>
            </div>
        )}

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-200 mb-8 max-w-md text-center">
                {error}
                <button 
                    onClick={() => setError(null)}
                    className="block w-full mt-2 text-sm font-bold hover:underline"
                >
                    Try Again
                </button>
            </div>
        )}

        {result && (
            <div className="w-full">
                <div className="flex justify-center mb-8">
                     <button 
                        onClick={() => setResult(null)}
                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
                     >
                        ← Analyze Another Song
                     </button>
                </div>
                <ResultCard data={result} />
            </div>
        )}
      </main>

      <footer className="relative z-10 py-8 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} MuseMatch. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
}

export default App;