import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// We don't need to use cookies directly in this route handler
// because the Supabase client will handle them automatically

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard'
    const type = requestUrl.searchParams.get('type')
    
    if (!code) {
      console.error('No code found in callback URL')
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }
    
    console.log('Auth callback received with:', { 
      type,
      redirectTo,
      hasCode: !!code
    })
    
    // Create a response to modify with cookies
    const response = NextResponse.redirect(
      type === 'email_verification' || type === 'signup' 
        ? new URL('/login?email-verification=success', request.url)
        : new URL(redirectTo, request.url)
    )
    
    // Create the server client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            
            // Must update the response cookies here
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL(`/login?error=${error.message}`, request.url))
    }
    
    console.log('Successfully exchanged code for session, user:', data?.session?.user?.email)
    
    // Ensure cookies are set in the response
    if (data?.session) {
      console.log('Auth callback: session established for', data.session.user.email)
    }
    
    // Return the response with cookies now set
    return response
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL('/login?error=unexpected', request.url))
  }
} 