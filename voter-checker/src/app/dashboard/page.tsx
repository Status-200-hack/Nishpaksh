'use client'

import { useState, useEffect } from 'react'

interface Candidate {
    id: string
    candidate_name: string
    party_name: string
    symbol: string
    ward_no: number
}

export default function Dashboard() {
    const [account, setAccount] = useState<string | null>(null)
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const [wardName, setWardName] = useState("Bandra - 100")

    useEffect(() => {
        const getAccount = async () => {
            if (typeof window !== 'undefined' && (window as any).ethereum) {
                try {
                    const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
                    if (accounts && accounts.length > 0) {
                        setAccount(accounts[0])
                    }
                } catch (error) {
                    console.error('Error fetching account', error)
                }
            }
        }

        const detectWardAndFetch = async () => {
            setLoading(true)
            let wardNo = 100 // Default fallback
            let detectedWardName = "Ward"

            // 1. Get Lat/Long from URL
            const searchParams = new URLSearchParams(window.location.search)
            const latlong = searchParams.get('latlong')

            if (latlong) {
                try {
                    const [latStr, longStr] = latlong.split(',')
                    const lat = parseFloat(latStr.trim())
                    const long = parseFloat(longStr.trim())

                    // 2. Fetch GeoJSON
                    const geoRes = await fetch('/ward-data.geojson')
                    if (geoRes.ok) {
                        const geoData = await geoRes.json()
                        // 3. Find Ward (Point in Polygon)
                        for (const feature of geoData.features) {
                            if (isPointInPolygon([long, lat], feature.geometry.coordinates[0][0])) {
                                // Extract numeric part from "note": "100" or similar
                                // "note" seems to be just the number like "9" based on the file view
                                wardNo = parseInt(feature.properties.note)
                                console.log("Detected Ward:", wardNo)
                                break
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error detecting ward:", e)
                }
            }

            setWardName(`Ward ${wardNo}`)

            // 4. Fetch Candidates for Ward
            try {
                const url = `https://kvixkemyrydjihzqwaat.supabase.co/rest/v1/bmc_candidates?select=*%2Ccase_info%3Abmc_candidate_case_info%21bmc_candidate_case_info_candidate_id_fkey%28education%2Cactive_cases%2Cclosed_cases%29&ward_no=eq.${wardNo}`
                const headers = {
                    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aXhrZW15cnlkamloenF3YWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzU2MTEsImV4cCI6MjA4MzExMTYxMX0.3CaKW2n-IH9uOJOB_RJU8cSAF-Toq1wCc43u5QLTJCQ",
                    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aXhrZW15cnlkamloenF3YWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzU2MTEsImV4cCI6MjA4MzExMTYxMX0.3CaKW2n-IH9uOJOB_RJU8cSAF-Toq1wCc43u5QLTJCQ"
                }

                const response = await fetch(url, { headers })
                if (response.ok) {
                    const data = await response.json()
                    setCandidates(data)
                } else {
                    console.error("Failed to fetch candidates")
                }
            } catch (error) {
                console.error("Error fetching candidates:", error)
            } finally {
                setLoading(false)
            }
        }

        getAccount()
        detectWardAndFetch()
    }, [])

    // Ray Casting Algorithm
    const isPointInPolygon = (point: number[], vs: number[][]) => {
        const x = point[0], y = point[1]
        let inside = false
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][0], yi = vs[i][1]
            const xj = vs[j][0], yj = vs[j][1]
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
            if (intersect) inside = !inside
        }
        return inside
    }

    const getSymbolIcon = (symbol: string) => {
        const lower = symbol?.toLowerCase() || ''
        if (lower.includes('lotus')) return '🪷'
        if (lower.includes('hand')) return '✋'
        if (lower.includes('book')) return '📖'
        if (lower.includes('torch')) return '🔥'
        if (lower.includes('clock')) return '⏰'
        if (lower.includes('cycle')) return '🚲'
        if (lower.includes('lantern')) return '🏮'
        return '👤'
    }

    const getCardColor = (index: number) => {
        const colors = ['bg-blue-900', 'bg-indigo-900', 'bg-teal-900', 'bg-purple-900', 'bg-cyan-900']
        return colors[index % colors.length]
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-gray-900 font-bold text-xl">L</span>
                    </div>
                    <span className="font-bold text-lg">Project Ballot</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <div className="mb-8">
                        <div className="bg-gray-800 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3 text-blue-400 mb-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-semibold">Secure Voting</span>
                            </div>
                            <span className="text-xs text-gray-400 ml-8">Status: Connected</span>
                        </div>

                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Election Ballot
                        </button>
                    </div>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-green-500 tracking-wider">BLOCKCHAIN LIVE</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Your vote will be encrypted and recorded on-chain.
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Network Info</h3>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Block Height</span>
                        <span className="text-gray-300 font-mono">#18,293,011</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Gas Price</span>
                        <span className="text-gray-300 font-mono">12 Gwei</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 md:px-8 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-6">
                        {/* Mobile Menu Button - Visual only */}
                        <button className="md:hidden text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                            <a href="#" className="text-white hover:text-white transition-colors">Dashboard</a>
                        </nav>
                        <div className="h-4 w-px bg-gray-700 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs font-mono text-gray-300">
                                    {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-orange-200 border-2 border-orange-300"></div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{wardName}</h1>
                                <p className="text-gray-400">Step 1 of 2: Select your preferred representative for the blockchain ballot.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Loading State */}
                            {loading && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {/* Live Candidates */}
                            {!loading && candidates.map((candidate, index) => (
                                <CandidateCard
                                    key={candidate.id}
                                    name={candidate.candidate_name}
                                    party={candidate.party_name}
                                    symbol={candidate.symbol}
                                    imageColor={getCardColor(index)}
                                    badgeIcon={getSymbolIcon(candidate.symbol)}
                                />
                            ))}

                            {/* NOTA - Always present */}
                            {!loading && (
                                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 flex flex-col items-center text-center hover:border-gray-500 transition-all cursor-pointer group h-full justify-between">
                                    <div className="flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-full bg-gray-700 mb-4 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                                            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">None of the Above</h3>
                                        <p className="text-sm text-gray-400">Reject all candidates listed in this constituency</p>
                                    </div>
                                    <button className="w-full mt-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors">
                                        Select NOTA
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-800 p-4 md:p-6 bg-gray-900 shadow-2xl shrink-0">
                    <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between border border-gray-700 gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-blue-400 shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Encrypted Submission</h4>
                                <p className="text-sm text-gray-400">Your selection remains anonymous</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/50">
                                Submit Ballot
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function CandidateCard({ name, party, symbol, imageColor, badgeIcon }: { name: string, party: string, symbol: string, imageColor: string, badgeIcon: string }) {
    return (
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 flex flex-col items-center text-center hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden h-full justify-between">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex flex-col items-center w-full">
                <div className={`w-24 h-24 rounded-full ${imageColor} mb-4 flex items-center justify-center relative group-hover:scale-105 transition-transform`}>
                    <span className="text-4xl text-white opacity-80">👤</span>
                    {/* Party Badge */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center shadow-lg">
                        <span className="text-sm">{badgeIcon}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{name}</h3>
                <p className="text-blue-400 text-sm font-medium mb-1">{party}</p>
                <p className="text-gray-500 text-xs italic mb-6">Symbol: {symbol}</p>
            </div>

            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20">
                Cast Vote
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </button>
        </div>
    )
}
