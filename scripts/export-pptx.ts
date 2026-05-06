import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import PptxGenJS, { type TextProps } from 'pptxgenjs'
import { SLIDES, type SlideDefinition } from '../src/slides.ts'

const BG = '0B0B0B'
const TEXT = 'F5F5F5'
const ACCENT = '9EFF6B'
const MUTED = 'A1A1A1'

const FONT_SANS = 'Space Grotesk'
const FONT_MONO = 'Space Mono'

/** LAYOUT_16x9 = 10in × 5.625in — keep all boxes inside this rectangle for Google Slides. */
const SLIDE_W = 10
const SLIDE_H = 5.625
const MARGIN_R = 0.42
const BAR_X = 0.38
const BAR_W = 0.045
const TEXT_X = BAR_X + BAR_W + 0.08
const TEXT_W = SLIDE_W - TEXT_X - MARGIN_R

const SZ = {
  titleMain: 19,
  titleSub: 11,
  tagline: 8,
  workshopLabel: 7,
  slideTitle: 16,
  body: 10,
  bodyEm: 12,
  emphasis: 11,
  small: 9,
  footer: 7,
  label: 7,
}

/** Tight paragraph rhythm for imports into Google Slides. */
const tight = {
  lineSpacingMultiple: 1.08 as const,
  paraSpaceBefore: 0,
  paraSpaceAfter: 2,
}

function blocksToRichText(def: SlideDefinition): TextProps[] {
  const parts: TextProps[] = []
  if (!def.blocks?.length) return parts

  const lineOpts = (opts: {
    fontSize: number
    bold?: boolean
    color?: string
    face?: string
    after?: number
  }) => ({
    fontSize: opts.fontSize,
    bold: opts.bold,
    color: opts.color ?? TEXT,
    fontFace: opts.face ?? FONT_SANS,
    breakLine: true,
    lineSpacingMultiple: tight.lineSpacingMultiple,
    paraSpaceBefore: tight.paraSpaceBefore,
    paraSpaceAfter: opts.after ?? 3,
  })

  for (const block of def.blocks) {
    switch (block.kind) {
      case 'lines': {
        for (const line of block.items) {
          parts.push({
            text: `${line}`,
            options: lineOpts({
              fontSize: block.emphasis ? SZ.bodyEm : SZ.body,
              color: block.emphasis ? ACCENT : TEXT,
              after: 2,
            }),
          })
        }
        break
      }
      case 'emphasis':
        parts.push({
          text: block.text,
          options: lineOpts({
            fontSize: SZ.emphasis,
            bold: true,
            color: ACCENT,
            after: 4,
          }),
        })
        break
      case 'small':
        parts.push({
          text: block.text,
          options: lineOpts({
            fontSize: SZ.small,
            color: MUTED,
            after: 4,
          }),
        })
        break
      case 'footer':
        parts.push({
          text: block.text,
          options: lineOpts({
            fontSize: SZ.footer,
            color: MUTED,
            face: FONT_MONO,
            after: 0,
          }),
        })
        break
      case 'label':
        parts.push({
          text: block.text,
          options: lineOpts({
            fontSize: SZ.label,
            bold: true,
            color: ACCENT,
            face: FONT_MONO,
            after: 2,
          }),
        })
        break
      default:
        break
    }
  }
  return parts
}

function addTitleSlide(pptx: PptxGenJS, def: SlideDefinition) {
  const slide = pptx.addSlide()
  slide.background = { color: BG }

  slide.addShape(pptx.ShapeType.rect, {
    x: BAR_X,
    y: 0.75,
    w: BAR_W,
    h: 1.55,
    fill: { color: ACCENT },
    line: { type: 'none' },
  })

  slide.addText('WORKSHOP', {
    x: TEXT_X,
    y: 0.62,
    w: TEXT_W,
    h: 0.28,
    fontSize: SZ.workshopLabel,
    color: MUTED,
    fontFace: FONT_MONO,
    lineSpacingMultiple: 1,
    margin: [0, 0, 0, 0],
  })

  slide.addText(def.title, {
    x: TEXT_X,
    y: 0.88,
    w: TEXT_W,
    h: 1.05,
    fontSize: SZ.titleMain,
    bold: true,
    color: TEXT,
    fontFace: FONT_SANS,
    lineSpacingMultiple: 1.12,
    valign: 'top',
    margin: [0, 0, 0, 0],
  })

  if (def.subtitle) {
    slide.addText(def.subtitle, {
      x: TEXT_X,
      y: 1.95,
      w: TEXT_W,
      h: 1.35,
      fontSize: SZ.titleSub,
      color: MUTED,
      fontFace: FONT_SANS,
      lineSpacingMultiple: 1.15,
      valign: 'top',
      margin: [0, 0, 0, 0],
    })
  }

  if (def.tagline) {
    slide.addText(def.tagline, {
      x: TEXT_X,
      y: SLIDE_H - 0.52,
      w: TEXT_W,
      h: 0.42,
      fontSize: SZ.tagline,
      color: ACCENT,
      fontFace: FONT_MONO,
      lineSpacingMultiple: 1,
      valign: 'top',
      margin: [0, 0, 0, 0],
    })
  }

  slide.addNotes(def.speakerNotes)
}

function addContentSlide(pptx: PptxGenJS, def: SlideDefinition) {
  const slide = pptx.addSlide()
  slide.background = { color: BG }

  slide.addShape(pptx.ShapeType.rect, {
    x: BAR_X,
    y: 0.42,
    w: BAR_W,
    h: 0.95,
    fill: { color: ACCENT },
    line: { type: 'none' },
  })

  slide.addText(def.title, {
    x: TEXT_X,
    y: 0.38,
    w: TEXT_W,
    h: 0.72,
    fontSize: SZ.slideTitle,
    bold: true,
    color: TEXT,
    fontFace: FONT_SANS,
    lineSpacingMultiple: 1.08,
    valign: 'top',
    margin: [0, 0, 0, 0],
  })

  const body = blocksToRichText(def)
  if (body.length) {
    slide.addText(body, {
      x: TEXT_X,
      y: 1.12,
      w: TEXT_W,
      h: SLIDE_H - 1.12 - 0.36,
      valign: 'top',
      fontFace: FONT_SANS,
      lineSpacingMultiple: tight.lineSpacingMultiple,
      margin: [2, 4, 2, 4],
    })
  }

  slide.addNotes(def.speakerNotes)
}

async function main() {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'Extra Good Studio'
  pptx.title = 'Justin · Dating profile workshop'
  pptx.subject = 'Phase 1 — Personal Exploration'

  for (const def of SLIDES) {
    if (def.id === '1-title') addTitleSlide(pptx, def)
    else addContentSlide(pptx, def)
  }

  const outDir = join(process.cwd(), 'dist')
  mkdirSync(outDir, { recursive: true })
  const fileName = join(outDir, 'justin-dating-profile-workshop.pptx')

  await pptx.writeFile({ fileName })
  console.log(`Wrote ${fileName}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
