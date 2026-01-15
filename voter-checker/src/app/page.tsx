'use client'

import { useState, useRef } from 'react'
import VoterForm from '@/components/VoterForm'
import VoterDetails from '@/components/VoterDetails'

export default function Home() {
  const [voterData, setVoterData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<any>(null)

  const handleSearch = async (epicNumber: string, state: string, captchaText: string, captchaId: string) => {
    setLoading(true)
    setError(null)
    setVoterData(null)

    try {
      const response = await fetch('/api/search-voter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({
          epicNumber,
          state,
          captchaText,
          captchaId,
        }),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch voter details')
      }

      if (data.success) {
        setVoterData(data.data)
      } else {
        setError(data.message || 'No voter details found')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      
      // Auto-refresh CAPTCHA on error (likely wrong CAPTCHA)
      if (err.message.includes('CAPTCHA') || err.message.includes('400')) {
        console.log('Auto-refreshing CAPTCHA due to error')
        // The form component will handle the refresh
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Voter ID Checker
          </h1>
          <p className="text-lg text-gray-600">
            Check your voter details from Election Commission of India
          </p>
        </div>

        <VoterForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
                {error.includes('CAPTCHA') && (
                  <p className="text-red-600 text-sm mt-2">
                    Please refresh the CAPTCHA and try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {voterData && <VoterDetails data={voterData} />}
      </div>
    </main>
  )
}

