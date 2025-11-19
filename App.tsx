import React, { useState } from 'react';
import { CameraView } from './components/CameraView';
import { ResultOverlay } from './components/ResultOverlay';
import { analyzeImage } from './services/geminiService';
import { AppState, AnalysisResult, AnalysisMode } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CAMERA);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.CM_SCALE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setAppState(AppState.PREVIEW);
    setErrorMessage(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeImage(capturedImage, mode);
      setAnalysisResult(result);
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error(error);
      setErrorMessage("Có lỗi xảy ra khi phân tích ảnh. Vui lòng thử lại.");
      setAppState(AppState.PREVIEW);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setAppState(AppState.CAMERA);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-30 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">BioCount AI</h1>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-700">
            <button 
              onClick={() => setMode(AnalysisMode.CM_SCALE)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mode === AnalysisMode.CM_SCALE ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              2-3cm
            </button>
            <button 
              onClick={() => setMode(AnalysisMode.MM_SCALE)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mode === AnalysisMode.MM_SCALE ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Micro
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow relative flex flex-col">
        {appState === AppState.CAMERA && (
          <CameraView onCapture={handleCapture} />
        )}

        {(appState === AppState.PREVIEW || appState === AppState.ANALYZING || appState === AppState.RESULT) && capturedImage && (
          <div className="flex flex-col h-full">
            {/* Image View Area */}
            <div className="flex-grow bg-black flex items-center justify-center relative overflow-hidden p-4">
               <ResultOverlay imageData={capturedImage} result={analysisResult} />
               
               {appState === AppState.ANALYZING && (
                 <div className="absolute inset-0 bg-black/60 z-40 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-400 font-medium animate-pulse">Đang đếm số lượng cá thể...</p>
                 </div>
               )}
            </div>

            {/* Controls & Results Panel */}
            <div className="bg-gray-800 border-t border-gray-700 p-4 sm:p-6 z-30">
               <div className="container mx-auto max-w-2xl">
                  
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  {appState === AppState.RESULT && analysisResult ? (
                    <div className="mb-6 grid grid-cols-2 gap-4">
                       <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
                          <span className="text-gray-400 text-sm mb-1">Tổng số lượng</span>
                          <span className="text-4xl font-bold text-green-400">{analysisResult.count}</span>
                       </div>
                       <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
                          <span className="text-gray-400 text-sm mb-1">Kích thước ước tính</span>
                          <span className="text-lg font-semibold text-blue-300 text-center">{analysisResult.estimatedSizeCategory || mode}</span>
                       </div>
                    </div>
                  ) : (
                     <div className="mb-4 text-center">
                        <p className="text-gray-400 text-sm">
                           {appState === AppState.PREVIEW 
                             ? "Kiểm tra ảnh trước khi phân tích. Đảm bảo ánh sáng tốt." 
                             : "Kết quả sẽ hiển thị tại đây."}
                        </p>
                     </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRetake}
                      disabled={appState === AppState.ANALYZING}
                      className="flex-1 max-w-[160px] bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Chụp lại
                    </button>
                    
                    {appState !== AppState.RESULT && (
                      <button
                        onClick={handleAnalyze}
                        disabled={appState === AppState.ANALYZING}
                        className="flex-1 max-w-[200px] bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-900/50 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Đếm ngay
                      </button>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
