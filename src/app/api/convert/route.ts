import { NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

const FAL_KEY = process.env.FAL_KEY;

if (!FAL_KEY) {
  console.warn('FAL_KEY environment variable is not set. API calls will fail.');
}

// Configure fal.ai client only if we have a key
if (FAL_KEY) {
  fal.config({
    credentials: FAL_KEY
  });
}

export async function POST(request: Request) {
  try {
    if (!FAL_KEY) {
      return NextResponse.json(
        { error: 'FAL_KEY environment variable is not set' },
        { status: 500 }
      );
    }

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