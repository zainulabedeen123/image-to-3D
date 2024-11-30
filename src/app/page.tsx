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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-[hsl(var(--foreground))]">
          Image to 3D Converter
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Image Section */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Image</h2>
                <div className="flex gap-2">
                  <button className="btn hover:bg-[hsl(var(--card-foreground)/10%)]">
                    Examples
                  </button>
                  <button className="btn hover:bg-[hsl(var(--card-foreground)/10%)]">
                    Tutorials
                  </button>
                </div>
              </div>

              <div 
                {...getRootProps()} 
                className={`relative border border-dashed rounded-lg transition-all
                  ${isDragActive 
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10%]' 
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border))/80%]'
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
                    <Upload className="w-6 h-6 text-[hsl(var(--foreground)/60%)] mb-2" />
                    <p className="text-[hsl(var(--foreground)/60%)] text-center text-sm">
                      Drag & drop an image here, or click to select
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Section */}
            <div className="card p-6">
              <h2 className="text-xl mb-6">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[hsl(var(--foreground)/70%)]">Output Format:</label>
                  <select 
                    value={settings.output_format}
                    onChange={(e) => setSettings(s => ({ ...s, output_format: e.target.value as 'glb' | 'obj' }))}
                    className="input w-32"
                  >
                    <option value="glb">GLB</option>
                    <option value="obj">OBJ</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-[hsl(var(--foreground)/70%)]">Remove Background:</label>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.do_remove_background}
                      onChange={(e) => setSettings(s => ({ ...s, do_remove_background: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[hsl(var(--border))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(var(--primary))]"></div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className="btn btn-primary w-full mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Converting...
                  </span>
                ) : 'Convert to 3D'}
              </button>

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>

          {/* Right Column - 3D Viewer */}
          <div className="card overflow-hidden">
            <ModelViewer modelUrl={modelUrl} loading={loading} />
          </div>
        </div>
      </div>
    </main>
  );
}
