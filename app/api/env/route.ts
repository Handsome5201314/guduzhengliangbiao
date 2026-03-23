import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    SQLITE_URL: process.env.SQLITE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
}
