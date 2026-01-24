import { NextRequest, NextResponse } from 'next/server'

// Disable caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// FastAPI backend URL - adjust if needed
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voter_id, image } = body

    if (!voter_id || !image) {
      return NextResponse.json(
        { success: false, error: 'voter_id and image are required' },
        { status: 400 }
      )
    }

    // Forward request to FastAPI backend
    // Face recognition can take 90-120 seconds on Render free tier (ML model loading + processing)
    const response = await fetch(`${FASTAPI_URL}/face/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voter_id,
        image,
      }),
      signal: AbortSignal.timeout(180000), // 180 second (3 minute) timeout for ML processing
    })

    // Check if response has content
    const contentType = response.headers.get('content-type')
    const text = await response.text()
    
    // Handle empty response
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Backend returned empty response. The service might be starting up. Please try again in a moment.' },
        { status: response.status || 500 }
      )
    }

    // Try to parse JSON
    let data: any
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('Failed to parse backend response:', text.substring(0, 200))
      return NextResponse.json(
        { success: false, error: `Backend returned invalid response: ${text.substring(0, 100)}` },
        { status: response.status || 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || data.message || data.error || 'Verification failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      ...data,
    })
  } catch (error: any) {
    console.error('Face verification error:', error)
    
    // Handle timeout errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timed out. Face recognition processing is taking longer than expected. This can happen on the first request (backend spinning up) or with large images. Please try again - subsequent requests should be faster.' 
        },
        { status: 504 }
      )
    }
    
    // Handle network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return NextResponse.json(
        { success: false, error: 'Unable to connect to backend service. Please check if the service is running.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

