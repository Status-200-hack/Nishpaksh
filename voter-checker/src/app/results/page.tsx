'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ResultsPage() {
    const [isAutoRefresh, setIsAutoRefresh] = useState(true)
    const [account, setAccount] = useState<string | null>(null)
    const [lastTx, setLastTx] = useState<string | null>(null)

    useEffect(() => {
        // Avoid useSearchParams() Suspense requirement in Next build
        try {
            const sp = new URLSearchParams(window.location.search)
            setLastTx(sp.get('tx'))
        } catch { }

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
        getAccount()
    }, [])

    // Mock data for the table
    const transactions = [
        {
            txHash: '0x8f2a...9d4e',
            blockId: '#7,241,092',
            timestamp: '2s ago',
            originNode: 'Mumbai_Region_Node_04',
            status: 'Verified',
            statusColor: 'text-green-500',
            dotColor: 'bg-green-500'
        },
        {
            txHash: '0x4c1e...12b8',
            blockId: '#7,241,091',
            timestamp: '5s ago',
            originNode: 'Delhi_Central_Node_12',
            status: 'Verified',
            statusColor: 'text-green-500',
            dotColor: 'bg-green-500'
        },
        {
            txHash: '0x9a3f...ec72',
            blockId: '#7,241,091',
            timestamp: '7s ago',
            originNode: 'Bangalore_TechNode_01',
            status: 'Verified',
            statusColor: 'text-green-500',
            dotColor: 'bg-green-500'
        },
        {
            txHash: '0x2d12...ff5a',
            blockId: '#7,241,090',
            timestamp: '12s ago',
            originNode: 'Chennai_South_Node_08',
            status: 'Verified',
            statusColor: 'text-green-500',
            dotColor: 'bg-green-500'
        },
        {
            txHash: '0x76c2...3341',
            blockId: '#7,241,090',
            timestamp: '15s ago',
            originNode: 'Kolkata_East_Node_03',
            status: 'Confirming',
            statusColor: 'text-blue-400',
            dotColor: 'bg-blue-400'
        }
    ]

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-300 font-sans selection:bg-blue-500 selection:text-white">
            {/* Header */}
            <header className="border-b border-gray-800 bg-[#0B0E14] sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                L
                            </div>
                            <span className="text-white font-bold text-lg">Project Ballot</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                            <Link href="/results" className="text-blue-400 border-b-2 border-blue-400 h-16 flex items-center">Explorer</Link>
                            <Link href="#" className="hover:text-white transition-colors h-16 flex items-center">Nodes</Link>
                            <Link href="#" className="hover:text-white transition-colors h-16 flex items-center">Governance</Link>
                            <Link href="#" className="hover:text-white transition-colors h-16 flex items-center">Statistics</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
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
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8">
                    {lastTx && (
                        <div className="mb-4 bg-blue-950/40 border border-blue-900/40 rounded-xl p-4">
                            <div className="text-xs font-bold tracking-wider text-blue-300 mb-1">LAST VOTE TX</div>
                            <div className="font-mono text-sm text-blue-200 break-all">{lastTx}</div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-wider mb-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        LIVE LEDGER FEED
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Public Audit & Transparency Ledger</h1>
                            <p className="text-gray-400">Real-time cryptographic verification for India's national election framework.</p>
                        </div>
                        <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Logs
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-[#11161D] border border-gray-800 rounded-xl py-4 pl-12 pr-16 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm"
                        placeholder="Search by Transaction Hash / Block ID / Voter Digital Identity..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="bg-gray-800 text-gray-500 px-2 py-1 rounded text-xs font-mono border border-gray-700">⌘K</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-[#11161D] border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Votes Cast</h3>
                            <div className="text-blue-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">842,931,204</div>
                        <div className="text-xs text-green-500 font-medium">+12,402 <span className="text-gray-500">last hour</span></div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-50"></div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#11161D] border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Block Height</h3>
                            <div className="text-teal-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">#7,241,092</div>
                        <div className="text-xs text-gray-500 font-medium italic">Syncing across 14,202 nodes</div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-transparent opacity-50"></div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#11161D] border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">TPS (Current)</h3>
                            <div className="text-orange-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <div className="text-3xl font-bold text-white">2,481</div>
                            <span className="text-sm text-gray-500 font-medium">tx/s</span>
                        </div>
                        {/* Progress bar visual */}
                        <div className="w-1/2 h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-orange-500 w-3/4 rounded-full"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50"></div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-[#11161D] border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Avg. Block Time</h3>
                            <div className="text-purple-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <div className="text-3xl font-bold text-white">3.8s</div>
                        </div>
                        <div className="text-xs text-green-500 font-medium">Optimized <span className="text-gray-500">p2p latency low</span></div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-50"></div>
                    </div>
                </div>

                {/* Transactions Table Section */}
                <div className="bg-[#11161D] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Recent Vote Transactions</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-medium">Auto-refresh</span>
                            <button
                                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isAutoRefresh ? 'bg-blue-600' : 'bg-gray-700'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAutoRefresh ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#0B0E14] text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">TX Hash</th>
                                    <th className="px-6 py-4">Block ID</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Origin Node</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Audit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {transactions.map((tx, index) => (
                                    <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-blue-400">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                {tx.txHash}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-white font-medium">{tx.blockId}</td>
                                        <td className="px-6 py-4 text-gray-400">{tx.timestamp}</td>
                                        <td className="px-6 py-4 text-gray-300">{tx.originNode}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 ${tx.statusColor} border border-gray-700/50`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tx.dotColor}`}></span>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-500 hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-gray-800 text-center">
                        <button className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors flex items-center justify-center gap-1 mx-auto">
                            View All Transactions
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
