'use client';

import { useEffect } from 'react';
import { Loader2, Download } from 'lucide-react';
import Script from 'next/script';
import dynamic from 'next/dynamic';

const ModelViewerContent = dynamic(() => import('./ModelViewerContent'), {
  ssr: false,
});

interface ModelViewerProps {
  modelUrl: string | null;
  loading: boolean;
}

export default function ModelViewer({ modelUrl, loading }: ModelViewerProps) {
  useEffect(() => {
    return () => {
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#4d9eff]" />
          <p className="text-gray-400">Generating 3D model...</p>
        </div>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center">
        <p className="text-gray-400">Your 3D model will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Script 
        type="module" 
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
      />
      <div className="flex-1 relative min-h-[550px]">
        <ModelViewerContent modelUrl={modelUrl} />
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <a 
          href={modelUrl} 
          download 
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#4d9eff] hover:bg-[#3a7acc] transition-colors text-white font-medium w-full"
        >
          <Download className="w-4 h-4" />
          Download Model
        </a>
      </div>
    </div>
  );
} 