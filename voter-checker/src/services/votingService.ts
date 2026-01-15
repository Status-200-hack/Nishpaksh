import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

const VOTING_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS ??
  '0x0000000000000000000000000000000000000000'

const EXPECTED_CHAIN_ID = BigInt(
  process.env.NEXT_PUBLIC_VOTING_CHAIN_ID ?? '31337'
)

// Minimal ABI needed for the plan
const VOTING_ABI = [
  'function vote(uint256 _candidateId, uint256 _wardId) external',
  'event VoteCasted(address indexed voter, uint256 candidateId, uint256 wardId)',
]

function isUuidLike(value: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    value
  )
}

function toUint256(value: string | number | bigint): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) throw new Error('Invalid number')
    return BigInt(Math.floor(value))
  }

  const s = String(value).trim()
  if (/^\d+$/.test(s)) return BigInt(s)

  // If Supabase IDs are UUIDs, we can still pass a deterministic uint256 by
  // converting UUID hex to a 128-bit integer (valid within uint256).
  if (isUuidLike(s)) {
    const hex = s.replace(/-/g, '')
    return BigInt('0x' + hex)
  }

  throw new Error(`Candidate id "${s}" is not a uint or UUID`)
}

export async function castVote(params: {
  candidateId: string | number | bigint
  wardId: string | number | bigint
}) {
  if (typeof window === 'undefined') {
    throw new Error('Voting is only available in the browser')
  }
  if (!window.ethereum) {
    throw new Error('MetaMask not found (window.ethereum missing)')
  }
  if (
    !VOTING_CONTRACT_ADDRESS ||
    VOTING_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'
  ) {
    throw new Error(
      'Missing contract address. Set NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS.'
    )
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])

  // Safety: make sure the wallet is on the expected chain (default: local hardhat 31337)
  try {
    const net = await provider.getNetwork()
    if (net.chainId !== EXPECTED_CHAIN_ID) {
      const hexChainId = '0x' + EXPECTED_CHAIN_ID.toString(16)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexChainId }],
        })
      } catch (switchErr: any) {
        throw new Error(
          `Wrong network. Switch MetaMask to chainId=${EXPECTED_CHAIN_ID.toString()} (Localhost 8545) and try again.`
        )
      }
    }
  } catch (e: any) {
    // If provider.getNetwork fails, continue; MetaMask will still surface an error.
    // But we prefer a clear error when possible.
    const msg = e?.message
    if (msg) throw new Error(msg)
  }

  const signer = await provider.getSigner()

  const contractAddress = ethers.getAddress(VOTING_CONTRACT_ADDRESS)
  const contract = new ethers.Contract(contractAddress, VOTING_ABI, signer)

  const candidateId = toUint256(params.candidateId)
  const wardId = toUint256(params.wardId)

  const tx = await contract.vote(candidateId, wardId)
  const receipt = await tx.wait()

  return { txHash: tx.hash as string, receipt }
}

