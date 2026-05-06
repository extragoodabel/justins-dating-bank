import { useCallback, useEffect, useState } from 'react'
import { SLIDES, type SlideBlock } from './slides'

function renderBlock(block: SlideBlock, key: number) {
  switch (block.kind) {
    case 'label':
      return (
        <p
          key={key}
          className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#9EFF6B]"
        >
          {block.text}
        </p>
      )
    case 'lines':
      return (
        <ul
          key={key}
          className={`mt-10 space-y-4 text-2xl font-medium leading-snug tracking-tight md:text-[1.6rem] ${
            block.emphasis ? 'text-[#9EFF6B]' : 'text-[#F5F5F5]'
          }`}
        >
          {block.items.map((item) => (
            <li key={item} className="max-w-prose text-left">
              {item}
            </li>
          ))}
        </ul>
      )
    case 'emphasis':
      return (
        <p
          key={key}
          className="mt-12 max-w-prose text-2xl font-semibold tracking-tight text-[#9EFF6B] md:text-[1.6rem]"
        >
          {block.text}
        </p>
      )
    case 'small':
      return (
        <p
          key={key}
          className="mt-10 max-w-prose text-lg font-normal leading-relaxed text-[#A1A1A1] md:text-xl"
        >
          {block.text}
        </p>
      )
    case 'footer':
      return (
        <p
          key={key}
          className="mt-14 border-t border-[#2a2a2a] pt-6 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[#A1A1A1]"
        >
          {block.text}
        </p>
      )
    default:
      return null
  }
}

/** Workshop slide deck — open via `#workshop` on the main app shell */
export default function WorkshopDeck() {
  const [index, setIndex] = useState(0)
  const [enter, setEnter] = useState(true)
  const total = SLIDES.length
  const slide = SLIDES[index]

  const go = useCallback(
    (delta: number) => {
      setEnter(false)
      window.setTimeout(() => {
        setIndex((i) => {
          const n = i + delta
          if (n < 0) return 0
          if (n >= total) return total - 1
          return n
        })
        setEnter(true)
      }, 120)
    },
    [total],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        setIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setIndex(total - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, total])

  const isTitle = slide.id === '1-title'

  return (
    <div className="relative h-[100dvh] w-[100dvw] overflow-hidden bg-[#0B0B0B]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-[12%] h-[28%] w-1 bg-[#9EFF6B] opacity-90 md:left-[6vw]"
      />

      <a
        href="#"
        className="absolute right-6 top-8 font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1] underline-offset-4 hover:text-[#9EFF6B] hover:underline md:right-10 md:top-10"
      >
        Prompt bank
      </a>

      <main
        className={`mx-auto flex h-full max-w-[940px] flex-col justify-center px-6 pb-20 pt-16 transition-all duration-300 ease-out md:px-10 ${
          enter ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
      >
        {isTitle ? (
          <>
            <p className="mb-6 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#A1A1A1]">
              Workshop
            </p>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-[#F5F5F5] md:text-[3.25rem] md:leading-[1.05]">
              {slide.title}
            </h1>
            {slide.subtitle ? (
              <p className="mt-8 max-w-[40ch] text-balance text-xl font-medium leading-snug text-[#A1A1A1] md:text-2xl md:leading-snug">
                {slide.subtitle}
              </p>
            ) : null}
            {slide.tagline ? (
              <p className="mt-14 font-mono text-[0.75rem] font-medium tracking-wide text-[#9EFF6B]/95">
                {slide.tagline}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-[#F5F5F5] md:text-[2.75rem]">
              {slide.title}
            </h1>
            {slide.blocks?.map((b, i) => renderBlock(b, i))}
          </>
        )}
      </main>

      <div className="pointer-events-none absolute bottom-6 right-6 md:bottom-10 md:right-10">
        <p className="font-mono text-xs tabular-nums tracking-wide text-[#A1A1A1]">
          {index + 1} <span className="text-[#4a4a4a]">/</span> {total}
        </p>
      </div>

      <nav
        className="absolute bottom-6 left-6 flex gap-2 md:bottom-10 md:left-10"
        aria-label="Slide navigation"
      >
        <button
          type="button"
          className="rounded border border-[#2a2a2a] bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-[#A1A1A1] transition hover:border-[#9EFF6B] hover:text-[#F5F5F5]"
          onClick={() => go(-1)}
          disabled={index === 0}
        >
          Prev
        </button>
        <button
          type="button"
          className="rounded border border-[#2a2a2a] bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-[#A1A1A1] transition hover:border-[#9EFF6B] hover:text-[#F5F5F5]"
          onClick={() => go(1)}
          disabled={index === total - 1}
        >
          Next
        </button>
      </nav>
    </div>
  )
}
