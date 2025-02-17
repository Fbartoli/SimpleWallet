import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { type FeeRecord } from '@/app/types/fees'

const DATA_DIR = path.join(process.cwd(), 'data/fees')
const FEES_FILE = path.join(DATA_DIR, 'user-fees.jsonl')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function appendFeeRecord(feeRecord: FeeRecord) {
  await ensureDataDir()
  const line = JSON.stringify(feeRecord) + '\n'
  await fs.appendFile(FEES_FILE, line, 'utf-8')
}

async function readFeeRecords(userId?: string): Promise<FeeRecord[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(FEES_FILE, 'utf-8')
    const lines = data.trim().split('\n')
    const records = lines
      .filter(Boolean)
      .map(line => JSON.parse(line) as FeeRecord)
    
    if (userId) {
      return records.filter(record => record.userId === userId)
    }
    
    return records
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, amount, token, tokenSymbol, transactionHash } = body

    if (!userId || !amount || !token || !tokenSymbol || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const feeRecord: FeeRecord = {
      userId,
      timestamp: Date.now(),
      amount,
      token,
      tokenSymbol,
      transactionHash,
    }

    await appendFeeRecord(feeRecord)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording fee:', error)
    return NextResponse.json(
      { error: 'Failed to record fee' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const fees = await readFeeRecords(userId || undefined)
    return NextResponse.json({ fees })
  } catch (error) {
    console.error('Error fetching fees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fees' },
      { status: 500 }
    )
  }
} 