import { NextRequest, NextResponse } from 'next/server'

// Disable caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Establish session first with cache-busting
    const sessionResponse = await fetch(`https://electoralsearch.eci.gov.in/?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    })

    const cookies = sessionResponse.headers.get('set-cookie')

    // Generate CAPTCHA with cache-busting
    const captchaResponse = await fetch(
      `https://gateway-voters.eci.gov.in/api/v1/captcha-service/generateCaptcha?t=${Date.now()}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-IN,en;q=0.9',
          'applicationname': 'ELECTORAL-SEARCH',
          'appname': 'ELECTORAL-SEARCH',
          'channelidobo': 'ELECTORAL-SEARCH',
          'origin': 'https://electoralsearch.eci.gov.in',
          'referer': 'https://electoralsearch.eci.gov.in/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
          'cache-control': 'no-cache, no-store, must-revalidate',
          'pragma': 'no-cache',
          ...(cookies && { 'cookie': cookies }),
        },
        cache: 'no-store',
      }
    )

    const data = await captchaResponse.json()

    if (data.status === 'Success') {
      // Return response with no-cache headers
      return NextResponse.json(
        {
          success: true,
          captcha: data.captcha,
          id: data.id,
          timestamp: Date.now(), // Add timestamp to ensure uniqueness
        },
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      )
    } else {
      console.error('CAPTCHA generation failed:', data)
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to generate CAPTCHA' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('CAPTCHA API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

