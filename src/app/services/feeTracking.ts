import { promises as fs } from 'fs'
import path from 'path'
import { type FeeRecord, type UserFees } from '../types/fees'

const DATA_DIR = path.join(process.cwd(), 'src/app/data')
const FEES_FILE = path.join(DATA_DIR, 'user-fees.json')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function readFees(): Promise<UserFees> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(FEES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist yet, return empty object
      return {}
    }
    throw error
  }
}

async function writeFees(fees: UserFees) {
  await ensureDataDir()
  await fs.writeFile(FEES_FILE, JSON.stringify(fees, null, 2))
}

export async function recordFee({
  userId,
  amount,
  token,
  tokenSymbol,
  transactionHash,
}: Omit<FeeRecord, 'timestamp'>) {
  const fees = await readFees()
  
  const feeRecord: FeeRecord = {
    userId,
    timestamp: Date.now(),
    amount,
    token,
    tokenSymbol,
    transactionHash,
  }

  if (!fees[userId]) {
    fees[userId] = []
  }

  fees[userId].push(feeRecord)
  await writeFees(fees)
}

export async function getUserFees(userId: string): Promise<FeeRecord[]> {
  const fees = await readFees()
  return fees[userId] || []
}

export async function getAllFees(): Promise<UserFees> {
  return readFees()
} 