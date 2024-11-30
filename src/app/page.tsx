'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, Download } from 'lucide-react';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
});

interface ConversionSettings {
  output_format: 'glb' | 'obj';
  do_remove_background: boolean;
  foreground_ratio: number;
  mc_resolution: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const [settings, setSettings] = useState<ConversionSettings>({
    output_format: 'glb',
    do_remove_background: true,
    foreground_ratio: 0.9,
    mc_resolution: 256,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  });

  const handleConvert = async () => {
    if (!file || !preview) return;

    try {
      setLoading(true);
      setError('');
      setModelUrl('');

      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: preview,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setModelUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0E0E0E] text-white">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Image to 3D Converter</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Image Section */}
            <div className="bg-[#1A1A1A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Image</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-md transition-colors">
                    Examples
                  </button>
                  <button className="px-3 py-1 text-sm bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-md transition-colors">
                    Tutorials
                  </button>
                </div>
              </div>

              <div 
                {...getRootProps()} 
                className={`relative border border-dashed rounded-lg transition-all
                  ${isDragActive 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                  }
                  ${preview ? 'aspect-square' : 'aspect-video'}
                `}
              >
                <input {...getInputProps()} />
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-gray-400 text-center text-sm">
                      Drag & drop an image here, or click to select
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-[#1A1A1A] rounded-lg p-6">
              <h2 className="text-xl mb-6">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Output Format:</label>
                  <select 
                    value={settings.output_format}
                    onChange={(e) => setSettings(s => ({ ...s, output_format: e.target.value as 'glb' | 'obj' }))}
                    className="px-3 py-1.5 rounded bg-[#2A2A2A] border border-gray-700 focus:border-blue-500 outline-none"
                  >
                    <option value="glb">GLB</option>
                    <option value="obj">OBJ</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Remove Background:</label>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.do_remove_background}
                      onChange={(e) => setSettings(s => ({ ...s, do_remove_background: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className={`w-full py-2.5 px-4 rounded-lg font-medium mt-6
                  ${loading 
                    ? 'bg-blue-500/50 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                  }
                  disabled:opacity-50 transition-colors`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Converting...
                  </span>
                ) : 'Convert to 3D'}
              </button>

              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>

          {/* Right Column - 3D Viewer */}
          <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
            <ModelViewer modelUrl={modelUrl} loading={loading} />
          </div>
        </div>
      </div>
    </main>
  );
}
