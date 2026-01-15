import { NextRequest, NextResponse } from 'next/server'

// Disable caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// FastAPI backend URL - adjust if needed
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voter_id, image, full_name } = body

    if (!voter_id || !image) {
      return NextResponse.json(
        { success: false, error: 'voter_id and image are required' },
        { status: 400 }
      )
    }

    // Forward request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/face/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voter_id,
        image,
        full_name,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || data.message || 'Registration failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      ...data,
    })
  } catch (error: any) {
    console.error('Face registration error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

