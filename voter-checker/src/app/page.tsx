'use client'

import { useState, useRef } from 'react'
import VoterForm from '@/components/VoterForm'
import VoterDetails from '@/components/VoterDetails'
import ConnectWallet from '@/components/ConnectWallet'

// Helper function to update aggregated voter demographics
function updateVoterDemographics(gender: string | null, age: number | null) {
  if (typeof window === 'undefined') return
  
  try {
    // Get existing demographics
    const existingStr = localStorage.getItem('voterDemographics')
    let demographics = existingStr ? JSON.parse(existingStr) : { male: 0, female: 0, other: 0, ages: [] }
    
    // Update gender count
    if (gender) {
      if (gender === 'M' || gender === 'Male') {
        demographics.male = (demographics.male || 0) + 1
      } else if (gender === 'F' || gender === 'Female') {
        demographics.female = (demographics.female || 0) + 1
      } else {
        demographics.other = (demographics.other || 0) + 1
      }
    }
    
    // Update age list
    if (age) {
      if (!demographics.ages) demographics.ages = []
      demographics.ages.push(age)
    }
    
    localStorage.setItem('voterDemographics', JSON.stringify(demographics))
  } catch (error) {
    console.error('Error updating demographics:', error)
  }
}

export default function Home() {
  const [voterData, setVoterData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVerification, setShowVerification] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const verificationRef = useRef<HTMLDivElement>(null)

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address)
  }

  const handleCastVote = () => {
    if (!walletAddress) {
      alert("Please connect your MetaMask wallet to proceed.")
      return
    }

    setShowVerification(true)
    setTimeout(() => {
      verificationRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

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
        // Store EPIC number and voter demographics in localStorage for voting
        if (typeof window !== 'undefined' && epicNumber) {
          localStorage.setItem('voterEpicNumber', epicNumber.toUpperCase())
          // Store voter data (gender, age) for results page
          const voterData = {
            epicNumber: epicNumber.toUpperCase(),
            gender: data.data.gender || data.data.Gender || null,
            age: data.data.age || data.data.Age || null,
          }
          localStorage.setItem('voterData', JSON.stringify(voterData))
          
          // Also update aggregated demographics
          updateVoterDemographics(voterData.gender, voterData.age)
        }
      } else {
        setError(data.message || 'No voter details found')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Nishpaksh</span>
                <p className="text-[10px] text-blue-400 tracking-wider font-semibold">DIGITAL INDIA INITIATIVE</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Security</a>
              <a href="#" className="hover:text-white transition-colors">How it Works</a>
              <a href="#" className="hover:text-white transition-colors">FAQs</a>
              <a href="#" className="hover:text-white transition-colors">Whitepaper</a>
            </div>

            <div className="flex items-center gap-4">
              <ConnectWallet onConnect={handleWalletConnect} />
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-bold tracking-wider mb-8">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                NETWORK LIVE: PHASE III ELECTIONS
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                India's First <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-500">Blockchain</span> <br />
                Voting System
              </h1>

              <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
                Secure. Transparent. Immutable. Empowering the world's largest democracy with decentralized technology. Your vote, secured by the blockchain.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCastVote}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Cast Your Vote
                </button>

              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-900/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 z-0"></div>
                {/* Decorative UI elements mimicking the image */}
                <div className="p-8 relative z-10 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-48 h-48 relative mb-8">
                    {/* Abstract Cube/Ballot Box Graphic */}
                    <div className="absolute inset-0 border-2 border-blue-500/30 rounded-lg transform rotate-12 scale-90"></div>
                    <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg transform -rotate-6 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-400/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                      <span className="text-4xl font-mono font-bold text-cyan-300">8A 88</span>
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-end border-t border-gray-700 pt-6">
                    <div>
                      <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">Live Node Map</p>
                      <p className="text-xl font-bold text-white">New Delhi, India</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">Active Validators</p>
                      <p className="text-2xl font-bold text-cyan-400">14,202</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect behind */}
              <div className="absolute -inset-4 bg-blue-600/30 blur-3xl -z-10 rounded-full opacity-50"></div>
            </div>

          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 p-6 rounded-2xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-orange-500 rounded-r-lg"></div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-sm font-medium">Blocks Validated</p>
                <span className="text-orange-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">1.2M+</p>
              <p className="text-green-400 text-xs font-bold flex items-center gap-1">
                <span className="text-green-500">↗</span> +12% Efficiency
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 p-6 rounded-2xl relative overflow-hidden group hover:border-white transition-colors">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-white rounded-r-lg"></div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-sm font-medium">Total Votes Cast</p>
                <span className="text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">450M+</p>
              <p className="text-green-400 text-xs font-bold flex items-center gap-1">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" /></svg> Real-time Verified
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-green-500 rounded-r-lg"></div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-sm font-medium">Network Uptime</p>
                <span className="text-green-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">99.9%</p>
              <p className="text-cyan-400 text-xs font-bold flex items-center gap-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Zero Downtime Recorded
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Section (Hidden by default or scrolled to) */}
      <section ref={verificationRef} className="py-24 bg-gray-900 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-700 transform ${showVerification ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-50'}`}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Verify Your Identity to Vote</h2>
              <p className="text-gray-400">Enter your official EPIC details to access the secure voting terminal.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-1 shadow-2xl border border-gray-700">
              <div className="bg-gray-900 rounded-xl p-6 sm:p-10">
                <VoterForm onSearch={handleSearch} loading={loading} />

                {error && (
                  <div className="mt-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-red-400 font-medium">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {voterData && (
                  <div className="mt-8 border-t border-gray-800 pt-8">
                    <VoterDetails data={voterData} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
