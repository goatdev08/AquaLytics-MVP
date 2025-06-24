import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testing backend Supabase connection...')
    
    // Create admin client (server-side only)
    const supabaseAdmin = createSupabaseAdmin()
    
    // Test connection with a simple query
    const { data, error } = await supabaseAdmin
      .from('nadadores')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Backend client error:', error.message)
      return NextResponse.json({
        success: false,
        error: error.message,
        data: null
      }, { status: 500 })
    }
    
    console.log('✅ Backend client connected successfully')
    return NextResponse.json({
      success: true,
      error: null,
      data,
      message: 'Backend Supabase connection successful'
    })
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Backend client exception:', errorMessage)
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      data: null
    }, { status: 500 })
  }
} 