import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

// Disable caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Prefer a standard Next.js `public/ward-data.geojson` if present,
    // otherwise fall back to the existing file at the repo level.
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'ward-data.geojson'),
      path.join(process.cwd(), '..', '2025-ward-data (1).geojson'),
    ]

    let raw: string | null = null
    for (const p of candidatePaths) {
      try {
        raw = await readFile(p, 'utf8')
        break
      } catch {
        // keep trying
      }
    }

    if (!raw) {
      return NextResponse.json(
        { error: 'Ward GeoJSON not found on server' },
        { status: 404 }
      )
    }

    const json = JSON.parse(raw)

    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('ward-data error:', error)
    return NextResponse.json(
      { error: 'Failed to load ward data' },
      { status: 500 }
    )
  }
}

