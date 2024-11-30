'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, RefreshCw } from 'lucide-react';
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

interface ConversionResult {
  data: {
    model_mesh: {
      url: string;
      content_type: string;
      file_name: string;
      file_size: number;
    };
  };
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
    <main className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Image to 3D Converter</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Image Upload Section */}
            <div className="bg-[#2a2a2a] rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Image</h2>
                  <div className="flex gap-2">
                    <button className="text-[#4d9eff] hover:text-[#3a7acc] transition-colors">
                      Examples
                    </button>
                    <button className="text-[#4d9eff] hover:text-[#3a7acc] transition-colors">
                      Tutorials
                    </button>
                  </div>
                </div>

                <div 
                  {...getRootProps()} 
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragActive 
                      ? 'border-[#4d9eff] bg-[#4d9eff]/10' 
                      : 'border-gray-600 hover:border-gray-500 hover:bg-[#353535]'
                    }
                    ${preview ? 'aspect-square' : 'aspect-video'}
                  `}
                >
                  <input {...getInputProps()} />
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-gray-400">Drag & drop an image here, or click to select</p>
                    </div>
                  )}
                </div>

                {preview && (
                  <button
                    onClick={() => {
                      setPreview('');
                      setFile(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#353535] hover:bg-[#404040] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Re-upload
                  </button>
                )}
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-[#2a2a2a] rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Output Format:</label>
                  <select 
                    value={settings.output_format}
                    onChange={(e) => setSettings(s => ({ ...s, output_format: e.target.value as 'glb' | 'obj' }))}
                    className="px-3 py-1.5 rounded-lg bg-[#353535] border border-gray-600 focus:border-[#4d9eff] outline-none"
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
                    <div className="w-11 h-6 bg-[#353535] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4d9eff]"></div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className={`w-full py-3 px-4 rounded-xl font-medium text-white mt-6
                  ${loading 
                    ? 'bg-[#4d9eff]/70 cursor-not-allowed' 
                    : 'bg-[#4d9eff] hover:bg-[#3a7acc] transition-colors'
                  }
                  disabled:opacity-50`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Converting...
                  </span>
                ) : 'Convert to 3D'}
              </button>

              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>

          {/* 3D Model Viewer */}
          <div className="bg-[#2a2a2a] rounded-xl overflow-hidden">
            <ModelViewer modelUrl={modelUrl} loading={loading} />
          </div>
        </div>
      </div>
    </main>
  );
}
