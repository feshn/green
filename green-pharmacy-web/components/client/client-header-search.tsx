"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

import { IconCross20 } from "@/components/icons/cross-20"
import { IconSearch } from "@/components/icons/search"
import { fetchSearchSuggestions } from "@/lib/catalog/search-suggestions"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type ClientHeaderSearchProps = {
  className?: string
  onActiveChange?: (active: boolean) => void
}

/** Figma Search (337:628 / 490:766) — h 36px, rounded 12px, bg white */
export function ClientHeaderSearch({
  className,
  onActiveChange,
}: ClientHeaderSearchProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isActive = focused && pathname === "/"

  useEffect(() => {
    onActiveChange?.(isActive)
  }, [isActive, onActiveChange])

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
  }, [searchParams])

  useEffect(() => {
    if (!isActive || !query.trim()) {
      setSuggestions([])
      return
    }

    const supabase = createClient()
    const timer = setTimeout(async () => {
      const items = await fetchSearchSuggestions(supabase, query)
      setSuggestions(items)
    }, 200)

    return () => clearTimeout(timer)
  }, [isActive, query])

  useEffect(() => {
    if (!isActive) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isActive])

  const pushQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const trimmed = q.trim()
      if (trimmed) {
        params.set("q", trimmed)
      } else {
        params.delete("q")
      }
      const qs = params.toString()
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname)
      })
    },
    [pathname, router, searchParams]
  )

  if (pathname === "/register") {
    return null
  }

  function submitSearch(value: string) {
    pushQuery(value)
    setFocused(false)
    inputRef.current?.blur()
  }

  const showClear = Boolean(query)

  return (
    <>
      {isActive ? (
        <div
          className="fixed inset-x-0 top-[72px] bottom-0 z-30 bg-black/50"
          aria-hidden
        />
      ) : null}

      <div ref={rootRef} className={cn("relative z-40 w-[400px] max-w-full", className)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submitSearch(query)
          }}
          className={cn(
            "box-border flex h-9 items-center gap-1.5 rounded-lg border-2 bg-search-surface pl-3 pr-2",
            focused ? "border-focus" : "border-transparent",
            isPending && "opacity-70"
          )}
          role="search"
        >
          <IconSearch className="text-search-placeholder" />
          <input
            ref={inputRef}
            name="q"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Поиск"
            aria-label="Поиск товаров"
            aria-expanded={isActive && suggestions.length > 0}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent font-sans text-sm leading-[19px] font-medium text-neutral-100 placeholder:text-search-placeholder outline-none"
          />
          {showClear ? (
            <button
              type="button"
              className="flex size-5 shrink-0 items-center justify-center"
              aria-label="Очистить поиск"
              onClick={() => {
                setQuery("")
                pushQuery("")
                inputRef.current?.focus()
              }}
            >
              <IconCross20 className="text-search-placeholder" />
            </button>
          ) : null}
        </form>

        {isActive && suggestions.length > 0 ? (
          <div className="absolute top-[calc(100%+4px)] left-0 z-50 flex w-full flex-col gap-3 rounded-lg bg-white px-3 pt-3 pb-4 shadow-[0_16px_20px_rgba(0,0,0,0.1)]">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setQuery(suggestion)
                  submitSearch(suggestion)
                }}
                className="flex h-5 w-full items-center text-left font-sans text-[13px] leading-5 text-neutral-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  )
}
