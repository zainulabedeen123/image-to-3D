import { NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

if (!process.env.FAL_KEY) {
  throw new Error('FAL_KEY is not set in environment variables');
}

fal.config({
  credentials: process.env.FAL_KEY
});

export async function POST(request: Request) {
  try {
    const { imageUrl, settings } = await request.json();

    const result = await fal.subscribe("fal-ai/triposr", {
      input: {
        image_url: imageUrl,
        ...settings
      },
      logs: true,
    });

    if (!result.data?.model_mesh?.url) {
      throw new Error('No model URL in response');
    }

    const modelResponse = await fetch(result.data.model_mesh.url);
    if (!modelResponse.ok) {
      throw new Error('Failed to fetch model file');
    }

    const modelData = await modelResponse.arrayBuffer();
    
    return new NextResponse(modelData, {
      headers: {
        'Content-Type': result.data.model_mesh.content_type || 'model/gltf-binary',
        'Content-Disposition': `attachment; filename="${result.data.model_mesh.file_name || 'model.glb'}"`,
      },
    });
  } catch (error) {
    console.error('Error in convert route:', error);
    return NextResponse.json(
      { error: 'Failed to convert image' },
      { status: 500 }
    );
  }
} 