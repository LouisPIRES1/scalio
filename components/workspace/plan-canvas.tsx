'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, Maximize2, FileImage } from 'lucide-react'
import type { NetworkGroup } from '@/types'
import { NETWORK_META } from '@/types'

interface PlanCanvasProps {
  networks: NetworkGroup[]
  onNetworkClick: (id: string) => void
  width: number
  height: number
  imageUrl?: string
  imageMime?: string
}

// ── PDF rendering (pdfjs-dist) ───────────────────────────────────────────────
async function renderPdf(url: string): Promise<{ dataUrl: string; w: number; h: number }> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const pdf = await pdfjs.getDocument({ url, cMapUrl: undefined }).promise
  const page = await pdf.getPage(1)
  const naturalViewport = page.getViewport({ scale: 1 })

  // Render at high resolution: target ≥ 3 000px wide for quality
  const targetW = Math.max(3000, naturalViewport.width * 4)
  const scale = targetW / naturalViewport.width
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)

  const ctx = canvas.getContext('2d')!
  // pdfjs v5 requires `canvas` instead of `canvasContext`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (page.render as any)({ canvasContext: ctx, canvas, viewport }).promise

  return {
    dataUrl: canvas.toDataURL('image/png'),
    w: canvas.width,
    h: canvas.height,
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export function PlanCanvas({
  networks,
  onNetworkClick,
  width,
  height,
  imageUrl,
  imageMime,
}: PlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Pan / zoom state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Image state
  const [naturalSize, setNaturalSize] = useState({ w: width, h: height })
  const [displayUrl, setDisplayUrl] = useState<string | null>(
    imageUrl && imageMime !== 'application/pdf' ? imageUrl : null
  )
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState(false)

  // Interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const dragRef = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  // ── Fit helper ──────────────────────────────────────────────────────────────
  const fitView = useCallback(
    (imgW: number, imgH: number) => {
      const z = Math.min(width / imgW, height / imgH) * 0.92
      setZoom(z)
      setPan({ x: (width - imgW * z) / 2, y: (height - imgH * z) / 2 })
    },
    [width, height]
  )

  // ── Raster image load ───────────────────────────────────────────────────────
  const handleImgLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth: w, naturalHeight: h } = e.currentTarget
      setNaturalSize({ w, h })
      fitView(w, h)
    },
    [fitView]
  )

  // ── PDF rendering ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!imageUrl || imageMime !== 'application/pdf') return
    setPdfLoading(true)
    setPdfError(false)

    renderPdf(imageUrl)
      .then(({ dataUrl, w, h }) => {
        setDisplayUrl(dataUrl)
        setNaturalSize({ w, h })
        fitView(w, h)
      })
      .catch(() => setPdfError(true))
      .finally(() => setPdfLoading(false))
  }, [imageUrl, imageMime, fitView])

  // ── Wheel zoom (around cursor) ───────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      setZoom((prev) => {
        const next = prev * factor
        setPan((p) => ({
          x: cx - (cx - p.x) * factor,
          y: cy - (cy - p.y) * factor,
        }))
        return next
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ── Mouse drag ──────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragRef.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const { mx, my, px, py } = dragRef.current
    setPan({ x: px + e.clientX - mx, y: py + e.clientY - my })
  }
  const onMouseUp = () => setIsDragging(false)

  // ── Toolbar zoom ────────────────────────────────────────────────────────────
  const zoomBy = (factor: number) => {
    const cx = width / 2
    const cy = height / 2
    setZoom((prev) => {
      const next = prev * factor
      setPan((p) => ({
        x: cx - (cx - p.x) * factor,
        y: cy - (cy - p.y) * factor,
      }))
      return next
    })
  }

  const W = naturalSize.w
  const H = naturalSize.h
  const hasImage = displayUrl !== null

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-[#E8ECF2] select-none"
      style={{ width, height, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ── Zoomable world ────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: W,
          height: H,
          transformOrigin: '0 0',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          willChange: 'transform',
        }}
      >
        {/* Plan image */}
        {hasImage ? (
          <img
            src={displayUrl}
            onLoad={imageMime !== 'application/pdf' ? handleImgLoad : undefined}
            draggable={false}
            style={{
              display: 'block',
              width: W,
              height: H,
              pointerEvents: 'none',
              imageRendering: '-webkit-optimize-contrast' as React.CSSProperties['imageRendering'],
            }}
            alt="Plan"
          />
        ) : (
          /* Placeholder grid (no image uploaded) */
          <svg
            width={W}
            height={H}
            style={{ display: 'block', background: '#F5F7FC' }}
          >
            {Array.from({ length: Math.ceil(W / 40) + 1 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * 40} y1={0} x2={i * 40} y2={H}
                stroke="#DDE3EE" strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: Math.ceil(H / 40) + 1 }, (_, i) => (
              <line
                key={`h${i}`}
                x1={0} y1={i * 40} x2={W} y2={i * 40}
                stroke="#DDE3EE" strokeWidth={0.5}
              />
            ))}
            <text
              x={W / 2} y={H / 2 - 20}
              textAnchor="middle" fill="#94A3B8" fontSize={14}
              fontFamily="system-ui, sans-serif"
            >
              Aucun plan importé
            </text>
            <text
              x={W / 2} y={H / 2 + 10}
              textAnchor="middle" fill="#CBD5E1" fontSize={11}
              fontFamily="system-ui, sans-serif"
            >
              Importez un plan depuis « Nouvelle analyse »
            </text>
          </svg>
        )}

        {/* ── Network SVG overlay ─────────────────────────────────────────── */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: W,
            height: H,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {networks.map((network) => {
            const meta = NETWORK_META[network.type]
            const bx = network.bbox.x * W
            const by = network.bbox.y * H
            const bw = network.bbox.width * W
            const bh = network.bbox.height * H
            const isSelected = network.isSelected
            const isHovered = hoveredId === network.id
            // Divide by zoom so visual size stays constant regardless of zoom level
            const sw = (isSelected ? 2 : 1.5) / zoom
            const labelW = meta.label.length * 5.8 + 16
            const pad = 6 / zoom
            const pillH = 18 / zoom
            const pillR = 9 / zoom
            const fs = 9 / zoom

            return (
              <g
                key={network.id}
                onClick={(e) => { e.stopPropagation(); onNetworkClick(network.id) }}
                onMouseEnter={() => setHoveredId(network.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
              >
                {/* Box fill */}
                <rect
                  x={bx} y={by} width={bw} height={bh}
                  fill={meta.color}
                  fillOpacity={isSelected ? 0.12 : isHovered ? 0.07 : 0.03}
                />
                {/* Box border */}
                <rect
                  x={bx} y={by} width={bw} height={bh}
                  fill="none"
                  stroke={meta.color}
                  strokeWidth={sw}
                  strokeDasharray={isSelected ? undefined : `${6 / zoom} ${4 / zoom}`}
                  strokeOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.6}
                  rx={3 / zoom}
                />
                {/* Label pill */}
                <rect
                  x={bx + pad} y={by + pad}
                  width={labelW / zoom} height={pillH}
                  fill={isSelected ? meta.color : 'white'}
                  stroke={meta.color}
                  strokeWidth={1 / zoom}
                  rx={pillR}
                  opacity={0.95}
                />
                <text
                  x={bx + (pad * 2) + 2 / zoom}
                  y={by + pad + pillH * 0.72}
                  fill={isSelected ? 'white' : meta.color}
                  fontSize={fs}
                  fontWeight={700}
                  fontFamily="system-ui, sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {meta.label}
                </text>
                {isSelected && (
                  <text
                    x={bx + bw - 18 / zoom}
                    y={by + pad + pillH * 0.72}
                    fill={meta.color}
                    fontSize={fs}
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    ✓
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* ── Zoom toolbar ──────────────────────────────────────────────────── */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {/* Zoom % indicator */}
        <div className="flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm px-2 h-7">
          <span className="font-mono text-[11px] font-semibold text-slate-500 tracking-tight">
            {Math.round(zoom * 100)}%
          </span>
        </div>
        <button
          onClick={() => zoomBy(1.25)}
          title="Zoom avant"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 hover:shadow-md transition-all"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => zoomBy(1 / 1.25)}
          title="Zoom arrière"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 hover:shadow-md transition-all"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => fitView(W, H)}
          title="Ajuster à la fenêtre"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 hover:shadow-md transition-all"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── PDF loading spinner ───────────────────────────────────────────── */}
      {pdfLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Rendu du PDF en haute qualité…</p>
          <p className="text-xs text-slate-400 mt-1">Cela peut prendre quelques secondes</p>
        </div>
      )}

      {/* ── PDF error ─────────────────────────────────────────────────────── */}
      {pdfError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85">
          <FileImage className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">Impossible de rendre ce PDF</p>
          <p className="text-xs text-slate-400 mt-1">Réessayez avec un autre fichier</p>
        </div>
      )}

      {/* ── Bottom hint ───────────────────────────────────────────────────── */}
      {hasImage && !pdfLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-[#0F172A]/75 backdrop-blur-sm px-4 py-2 text-white">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-xs font-medium">Cliquez sur un encadrement pour métrer · Molette pour zoomer</span>
          </div>
        </div>
      )}
    </div>
  )
}
