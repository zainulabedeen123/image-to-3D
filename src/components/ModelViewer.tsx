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
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-gray-400 text-sm">Generating 3D model...</p>
        </div>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Your 3D model will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      <Script 
        type="module" 
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
      />
      <div className="flex-1 relative">
        <ModelViewerContent modelUrl={modelUrl} />
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <a 
          href={modelUrl} 
          download 
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white font-medium w-full"
        >
          <Download className="w-4 h-4" />
          Download Model
        </a>
      </div>
    </div>
  );
} 