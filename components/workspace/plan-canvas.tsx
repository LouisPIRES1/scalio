'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Line, Circle, Text, Group, Arrow } from 'react-konva'
import type Konva from 'konva'
import type { NetworkGroup } from '@/types'
import { NETWORK_META } from '@/types'
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from 'lucide-react'

// ─── Plan geometry (normalized 0-1, scaled to canvas) ───────────────────────
const ROOMS = [
  { x: 0.03, y: 0.05, w: 0.23, h: 0.20, label: 'Accueil', fill: '#F8FAFF' },
  { x: 0.03, y: 0.30, w: 0.20, h: 0.22, label: 'Bureau 01', fill: '#F8FAFF' },
  { x: 0.03, y: 0.57, w: 0.20, h: 0.22, label: 'Bureau 02', fill: '#F8FAFF' },
  { x: 0.28, y: 0.05, w: 0.28, h: 0.28, label: 'Salle de conférence', fill: '#F6F9FF' },
  { x: 0.28, y: 0.38, w: 0.23, h: 0.20, label: 'Bureau 03', fill: '#F8FAFF' },
  { x: 0.56, y: 0.38, w: 0.22, h: 0.20, label: 'Bureau 04', fill: '#F8FAFF' },
  { x: 0.28, y: 0.63, w: 0.50, h: 0.22, label: 'Local technique', fill: '#F0F4FF' },
  { x: 0.60, y: 0.05, w: 0.37, h: 0.28, label: 'Open space', fill: '#F8FAFF' },
  { x: 0.03, y: 0.26, w: 0.94, h: 0.08, label: 'Couloir', fill: '#F2F4F8' },
  { x: 0.25, y: 0.05, w: 0.05, h: 0.82, label: '', fill: '#F2F4F8' },
]

// Pipe segments for EC (eau chaude, red)
const EC_PIPES = [
  // Main horizontal in couloir
  { pts: [0.05, 0.295, 0.97, 0.295] },
  // Verticals into rooms
  { pts: [0.13, 0.05, 0.13, 0.295] },
  { pts: [0.13, 0.295, 0.13, 0.515] },
  { pts: [0.13, 0.515, 0.13, 0.77] },
  { pts: [0.40, 0.05, 0.40, 0.295] },
  { pts: [0.40, 0.295, 0.40, 0.56] },
  { pts: [0.67, 0.05, 0.67, 0.295] },
  { pts: [0.45, 0.295, 0.45, 0.63] },
  { pts: [0.45, 0.63, 0.45, 0.83] },
  { pts: [0.70, 0.63, 0.70, 0.83] },
]

// DN callouts for EC
const EC_DNS = [
  { x: 0.50, y: 0.275, label: 'DN50' },
  { x: 0.20, y: 0.275, label: 'DN40' },
  { x: 0.135, y: 0.18, label: 'DN25' },
  { x: 0.405, y: 0.20, label: 'DN25' },
]

// Pipe segments for EF (eau froide, blue)
const EF_PIPES = [
  { pts: [0.05, 0.305, 0.97, 0.305] },
  { pts: [0.17, 0.05, 0.17, 0.305] },
  { pts: [0.17, 0.305, 0.17, 0.515] },
  { pts: [0.42, 0.05, 0.42, 0.305] },
  { pts: [0.42, 0.305, 0.42, 0.58] },
  { pts: [0.69, 0.05, 0.69, 0.305] },
  { pts: [0.52, 0.305, 0.52, 0.63] },
]

// Duct segments for GS (gaine soufflage, green) — thicker
const GS_DUCTS = [
  { pts: [0.28, 0.07, 0.97, 0.07] },
  { pts: [0.40, 0.07, 0.40, 0.34] },
  { pts: [0.70, 0.07, 0.70, 0.34] },
  { pts: [0.85, 0.07, 0.85, 0.34] },
]

// Duct segments for GR (gaine reprise, pink)
const GR_DUCTS = [
  { pts: [0.28, 0.12, 0.97, 0.12] },
  { pts: [0.55, 0.12, 0.55, 0.34] },
  { pts: [0.78, 0.12, 0.78, 0.34] },
]

// Flocage — vertical structural elements (gray dashed)
const FLOCAGE_ELEMENTS = [
  { pts: [0.265, 0.05, 0.265, 0.87] },
  { pts: [0.335, 0.05, 0.335, 0.87] },
]

// Ventilator positions (normalized)
const VENTILATORS = [
  { x: 0.37, y: 0.71 },
  { x: 0.47, y: 0.71 },
  { x: 0.57, y: 0.71 },
  { x: 0.67, y: 0.71 },
]

interface PlanCanvasProps {
  networks: NetworkGroup[]
  onNetworkClick: (id: string) => void
  width: number
  height: number
}

export function PlanCanvas({ networks, onNetworkClick, width, height }: PlanCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hoveredBox, setHoveredBox] = useState<string | null>(null)

  const s = (v: number, dim: 'x' | 'y') => v * (dim === 'x' ? width : height)

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const oldScale = scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const scaleBy = 1.08
    const newScale = e.evt.deltaY < 0
      ? Math.min(oldScale * scaleBy, 5)
      : Math.max(oldScale / scaleBy, 0.3)

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    setScale(newScale)
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }, [scale])

  const zoom = (dir: 1 | -1) => {
    const newScale = dir > 0
      ? Math.min(scale * 1.2, 5)
      : Math.max(scale / 1.2, 0.3)
    setScale(newScale)
  }

  const resetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-[#EEF1F7]" style={{ borderRadius: '0 0 0 0' }}>
      {/* Canvas toolbar */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => zoom(1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 hover:shadow-md transition-all"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => zoom(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 hover:shadow-md transition-all"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={resetView}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 hover:shadow-md transition-all"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Confidence badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white border border-emerald-200 px-3 py-1.5 shadow-sm">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-emerald-700">Fiabilité 91%</span>
      </div>

      {/* Click hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 rounded-full bg-[#0F172A]/80 backdrop-blur-sm px-4 py-2 text-white">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
          <span className="text-xs font-medium">Cliquez sur un encadrement pour métrer le réseau</span>
        </div>
      </div>

      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        draggable
        onDragEnd={(e) => {
          setPosition({ x: e.target.x(), y: e.target.y() })
        }}
      >
        {/* Background */}
        <Layer>
          <Rect
            x={0} y={0}
            width={width} height={height}
            fill="#F5F7FC"
          />
          {/* Grid */}
          {Array.from({ length: Math.ceil(width / 40) + 1 }, (_, i) => (
            <Line
              key={`vg-${i}`}
              points={[i * 40, 0, i * 40, height]}
              stroke="#DDE3EE"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: Math.ceil(height / 40) + 1 }, (_, i) => (
            <Line
              key={`hg-${i}`}
              points={[0, i * 40, width, i * 40]}
              stroke="#DDE3EE"
              strokeWidth={0.5}
            />
          ))}
        </Layer>

        {/* Plan layer: rooms */}
        <Layer>
          {ROOMS.map((room, i) => (
            <Group key={i}>
              <Rect
                x={s(room.x, 'x')}
                y={s(room.y, 'y')}
                width={s(room.w, 'x')}
                height={s(room.h, 'y')}
                fill={room.fill}
                stroke="#9AA5B8"
                strokeWidth={1.2}
              />
              {room.label && (
                <Text
                  x={s(room.x, 'x') + 6}
                  y={s(room.y, 'y') + 6}
                  text={room.label}
                  fontSize={8.5}
                  fontFamily="Inter, sans-serif"
                  fill="#94A3B8"
                  fontStyle="500"
                />
              )}
            </Group>
          ))}
        </Layer>

        {/* Flocage layer (gray dashed) */}
        <Layer>
          {FLOCAGE_ELEMENTS.map((seg, i) => (
            <Line
              key={i}
              points={seg.pts.map((v, idx) => s(v, idx % 2 === 0 ? 'x' : 'y'))}
              stroke="#9CA3AF"
              strokeWidth={5}
              dash={[6, 4]}
              lineCap="round"
              opacity={0.7}
            />
          ))}
        </Layer>

        {/* GS duct layer (green thick) */}
        <Layer>
          {GS_DUCTS.map((seg, i) => (
            <Line
              key={i}
              points={seg.pts.map((v, idx) => s(v, idx % 2 === 0 ? 'x' : 'y'))}
              stroke="#10B981"
              strokeWidth={6}
              lineCap="square"
              lineJoin="miter"
              opacity={0.85}
            />
          ))}
        </Layer>

        {/* GR duct layer (pink) */}
        <Layer>
          {GR_DUCTS.map((seg, i) => (
            <Line
              key={i}
              points={seg.pts.map((v, idx) => s(v, idx % 2 === 0 ? 'x' : 'y'))}
              stroke="#EC4899"
              strokeWidth={4}
              lineCap="square"
              opacity={0.85}
            />
          ))}
        </Layer>

        {/* EC pipe layer (red) */}
        <Layer>
          {EC_PIPES.map((seg, i) => (
            <Line
              key={i}
              points={seg.pts.map((v, idx) => s(v, idx % 2 === 0 ? 'x' : 'y'))}
              stroke="#EF4444"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {EC_DNS.map((d, i) => (
            <Text
              key={i}
              x={s(d.x, 'x')}
              y={s(d.y, 'y')}
              text={d.label}
              fontSize={7}
              fontFamily="Inter, sans-serif"
              fill="#EF4444"
              fontStyle="bold"
            />
          ))}
          {/* Elbow circles */}
          {[
            [0.13, 0.295], [0.13, 0.515], [0.40, 0.295],
            [0.40, 0.56], [0.67, 0.295], [0.45, 0.63],
          ].map(([cx, cy], i) => (
            <Circle key={i} x={s(cx, 'x')} y={s(cy, 'y')} radius={3} stroke="#EF4444" strokeWidth={1.5} fill="white" />
          ))}
        </Layer>

        {/* EF pipe layer (blue) */}
        <Layer>
          {EF_PIPES.map((seg, i) => (
            <Line
              key={i}
              points={seg.pts.map((v, idx) => s(v, idx % 2 === 0 ? 'x' : 'y'))}
              stroke="#3B82F6"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {[
            [0.17, 0.305], [0.17, 0.515], [0.42, 0.305], [0.52, 0.305],
          ].map(([cx, cy], i) => (
            <Circle key={i} x={s(cx, 'x')} y={s(cy, 'y')} radius={3} stroke="#3B82F6" strokeWidth={1.5} fill="white" />
          ))}
        </Layer>

        {/* Ventilators layer (violet) */}
        <Layer>
          {VENTILATORS.map((v, i) => (
            <Group key={i}>
              <Circle
                x={s(v.x, 'x')} y={s(v.y, 'y')}
                radius={10}
                stroke="#8B5CF6"
                strokeWidth={1.5}
                fill="#EDE9FE"
              />
              <Text
                x={s(v.x, 'x') - 4}
                y={s(v.y, 'y') - 4}
                text="V"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                fill="#7C3AED"
                fontStyle="bold"
              />
            </Group>
          ))}
        </Layer>

        {/* Bounding boxes layer (interactive) */}
        <Layer>
          {networks.map((network) => {
            const meta = NETWORK_META[network.type]
            const bx = s(network.bbox.x, 'x')
            const by = s(network.bbox.y, 'y')
            const bw = s(network.bbox.width, 'x')
            const bh = s(network.bbox.height, 'y')
            const isHovered = hoveredBox === network.id
            const isSelected = network.isSelected

            return (
              <Group
                key={network.id}
                onClick={() => onNetworkClick(network.id)}
                onMouseEnter={() => setHoveredBox(network.id)}
                onMouseLeave={() => setHoveredBox(null)}
              >
                {/* Fill */}
                <Rect
                  x={bx} y={by} width={bw} height={bh}
                  fill={meta.color}
                  opacity={isSelected ? 0.12 : isHovered ? 0.07 : 0.03}
                />
                {/* Border */}
                <Rect
                  x={bx} y={by} width={bw} height={bh}
                  stroke={meta.color}
                  strokeWidth={isSelected ? 2 : 1.5}
                  dash={isSelected ? undefined : [6, 4]}
                  opacity={isSelected ? 1 : isHovered ? 0.9 : 0.65}
                  cornerRadius={3}
                />
                {/* Label pill */}
                <Rect
                  x={bx + 6} y={by + 6}
                  width={meta.label.length * 5.8 + 12}
                  height={16}
                  fill={isSelected ? meta.color : 'white'}
                  stroke={meta.color}
                  strokeWidth={1}
                  cornerRadius={8}
                  opacity={isSelected ? 1 : 0.9}
                />
                <Text
                  x={bx + 12} y={by + 10}
                  text={meta.label}
                  fontSize={8}
                  fontFamily="Inter, sans-serif"
                  fill={isSelected ? 'white' : meta.color}
                  fontStyle="600"
                />
                {/* Selected check */}
                {isSelected && (
                  <Text
                    x={bx + bw - 20} y={by + 9}
                    text="✓"
                    fontSize={9}
                    fill={meta.color}
                    fontStyle="bold"
                  />
                )}
              </Group>
            )
          })}
        </Layer>

        {/* Title block */}
        <Layer>
          <Rect
            x={s(0.72, 'x')} y={s(0.88, 'y')}
            width={s(0.26, 'x')} height={s(0.10, 'y')}
            fill="white" stroke="#9AA5B8" strokeWidth={1}
          />
          <Text
            x={s(0.74, 'x')} y={s(0.895, 'y')}
            text="Scalio — Analyse IA"
            fontSize={7} fontFamily="Inter, sans-serif"
            fill="#475569" fontStyle="bold"
          />
          <Text
            x={s(0.74, 'x')} y={s(0.92, 'y')}
            text="Échelle 1:100 · Mars 2026"
            fontSize={6.5} fontFamily="Inter, sans-serif"
            fill="#94A3B8"
          />
          <Text
            x={s(0.74, 'x')} y={s(0.94, 'y')}
            text="Plan EXE R+1 · Rév.3"
            fontSize={6.5} fontFamily="Inter, sans-serif"
            fill="#94A3B8"
          />
        </Layer>
      </Stage>
    </div>
  )
}
