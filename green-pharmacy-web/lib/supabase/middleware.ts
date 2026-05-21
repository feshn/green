import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import {
  getStaffRole,
  staffHomePath,
  type StaffRole,
} from "@/lib/auth/staff-role"

const STAFF_ROUTE_ROLES: { prefix: string; role: StaffRole }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/picker", role: "picker" },
  { prefix: "/courier", role: "courier" },
]

function requiredStaffRole(pathname: string): StaffRole | null {
  for (const { prefix, role } of STAFF_ROUTE_ROLES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return role
    }
  }
  return null
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const requiredRole = requiredStaffRole(request.nextUrl.pathname)

  if (requiredRole) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/register"
      url.searchParams.set("staff", requiredRole)
      return NextResponse.redirect(url)
    }

    const role = await getStaffRole(supabase, user.email)

    if (role !== requiredRole) {
      const url = request.nextUrl.clone()
      url.pathname = role ? staffHomePath(role) : "/"
      url.searchParams.delete("staff")
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
