'use client';

import { useEffect, useState } from 'react';

interface ModelViewerContentProps {
  modelUrl: string;
}

export default function ModelViewerContent({ modelUrl }: ModelViewerContentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* @ts-ignore */}
      <model-viewer
        src={modelUrl}
        alt="3D model"
        camera-controls
        auto-rotate
        orientation="0deg 0deg 0deg"
        camera-orbit="0deg 75deg 4m"
        field-of-view="45deg"
        min-camera-orbit="auto 0deg auto"
        max-camera-orbit="auto 180deg 6m"
        min-field-of-view="25deg"
        max-field-of-view="60deg"
        auto-rotate-delay={0}
        rotation-per-second="30deg"
        interaction-prompt="none"
        camera-target="0m 1m 0m"
        bounds="tight"
        auto-scale
        scale="1 1 1"
        
        // Lighting and environment settings
        exposure="1.2"
        environment-image="legacy"
        skybox-image="legacy"
        environment-intensity="2"
        stage-light-intensity="3"
        shadow-intensity="1.5"
        shadow-softness="0.75"
        
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#2a2a2a',
        }}
      />
    </>
  );
} 