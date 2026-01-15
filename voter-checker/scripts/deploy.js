const fs = require('fs')
const path = require('path')

function upsertEnvLocal(projectRoot, key, value) {
  const envPath = path.join(projectRoot, '.env.local')
  let existing = ''
  try {
    existing = fs.readFileSync(envPath, 'utf8')
  } catch {
    existing = ''
  }

  const line = `${key}=${value}`
  if (!existing.trim()) {
    fs.writeFileSync(envPath, line + '\n', 'utf8')
    return
  }

  const lines = existing.split(/\r?\n/)
  let replaced = false
  const next = lines.map((l) => {
    if (l.startsWith(key + '=')) {
      replaced = true
      return line
    }
    return l
  })
  if (!replaced) next.push(line)
  fs.writeFileSync(envPath, next.filter((l, i, arr) => !(l === '' && i === arr.length - 1)).join('\n') + '\n', 'utf8')
}

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  console.log('Deploying with:', deployer.address)

  const Factory = await hre.ethers.getContractFactory('ElectionVoting')
  const contract = await Factory.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('ElectionVoting deployed to:', address)

  // Write into Next.js env so the frontend picks it up
  upsertEnvLocal(process.cwd(), 'NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS', address)
  console.log('Updated .env.local with NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

