import { useEffect, useRef, useState } from 'react'
import { Box, useTheme } from '@mui/material'
import { GHOST_GEO_MARK, GHOST_GEO_MED, renderGhostSpecimenFrame } from './ghostGeometry'

const VARIANTS = ['hologram', 'emerald', 'amber', 'quantum', 'prism']

// Shared global cursor listener so multiple GhostByteMark instances don't bind duplicate listeners
const globalPointer = { x: 0, y: 0, listeners: 0 }
function onGlobalMove(e) {
  if (typeof window === 'undefined') return
  globalPointer.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
  globalPointer.y = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
}

/**
 * Living 60fps 3D GhostByte Specimen Emblem.
 * Replaces static PNG logos across Navbars, Headers, Cards, Docks, and Footers.
 * Features continuous cloth-wave physics, orbital rings, global cursor-tracking pupils,
 * natural periodic eye blinks, and hover/click spin + shader bursts.
 */
export default function GhostByteMark({
  size = 38,
  variant = 'hologram',
  interactive = true,
  showRings = true,
  ariaLabel = 'Living 3D GhostByte Specimen Mark',
  sx = {},
}) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const canvasRef = useRef(null)
  const [activeVariant, setActiveVariant] = useState(variant)

  const stateRef = useRef({
    hovered: false,
    spinBoost: 0,
    pulseStart: -10,
    phaseOffset: Math.random() * 10,
  })

  useEffect(() => {
    setActiveVariant(variant)
  }, [variant])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (globalPointer.listeners === 0) {
      window.addEventListener('pointermove', onGlobalMove, { passive: true })
    }
    globalPointer.listeners += 1
    return () => {
      globalPointer.listeners -= 1
      if (globalPointer.listeners <= 0) {
        globalPointer.listeners = 0
        window.removeEventListener('pointermove', onGlobalMove)
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const geo = size >= 64 ? GHOST_GEO_MED : GHOST_GEO_MARK
    let rafId = null
    let extraYaw = 0
    const start = performance.now()

    const draw = (now) => {
      const t = (now - start) * 0.001 + stateRef.current.phaseOffset
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
        canvas.width = size * dpr
        canvas.height = size * dpr
      }

      const st = stateRef.current
      if (st.spinBoost > 0.002) {
        extraYaw += st.spinBoost
        st.spinBoost *= 0.92
      }

      const yaw =
        Math.sin(t * 1.15) * 0.48 +
        globalPointer.x * 0.24 +
        extraYaw +
        (st.hovered ? Math.sin(t * 4) * 0.12 : 0)
      const pitch = -0.06 + Math.sin(t * 1.4) * 0.08 + globalPointer.y * 0.14

      // Organic blink every ~4.3s lasting ~150ms
      const blinkCycle = (t % 4.3)
      const blink = blinkCycle > 4.12 ? Math.sin(((blinkCycle - 4.12) / 0.18) * Math.PI) : 0

      const pulseAge = (now - start) * 0.001 - st.pulseStart
      const pulse =
        pulseAge >= 0 && pulseAge < 0.75 ? Math.sin((pulseAge / 0.75) * Math.PI) : 0

      ctx.save()
      ctx.scale(dpr, dpr)
      renderGhostSpecimenFrame(ctx, {
        w: size,
        h: size,
        t,
        geo,
        variant: activeVariant,
        isDark,
        yaw,
        pitch,
        cursorX: globalPointer.x,
        cursorY: globalPointer.y,
        blink,
        assemble: 1,
        pulse,
        showRings,
        wireframe: size >= 44,
      })
      ctx.restore()

      if (!reduced) {
        rafId = requestAnimationFrame(draw)
      }
    }

    rafId = requestAnimationFrame(draw)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [size, activeVariant, isDark, showRings])

  const handleEnter = () => {
    if (!interactive) return
    stateRef.current.hovered = true
    stateRef.current.spinBoost = 0.18
  }

  const handleLeave = () => {
    stateRef.current.hovered = false
  }

  const handleBurst = () => {
    if (!interactive) return
    stateRef.current.spinBoost = 0.34
    stateRef.current.pulseStart = performance.now() * 0.001
    setActiveVariant((prev) => {
      const idx = VARIANTS.indexOf(prev)
      return VARIANTS[(idx + 1) % VARIANTS.length]
    })
  }

  return (
    <Box
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={interactive ? handleBurst : undefined}
      role="img"
      aria-label={ariaLabel}
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': interactive ? { transform: 'scale(1.08)' } : undefined,
        ...sx,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}

/**
 * Live 3D GhostByte Browser Tab Favicon Hook.
 * Animates `<link id="nullai-live-favicon">` with a rotating, blinking 3D GhostByte specimen!
 */
export function useLiveGhostFavicon(isDark = true, variant = 'hologram') {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined

    const link =
      document.getElementById('nullai-live-favicon') ||
      document.querySelector("link[rel='icon']")
    if (!link) return undefined

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const start = performance.now()
    const renderTick = () => {
      if (document.hidden) return
      const t = (performance.now() - start) * 0.001
      const blinkCycle = t % 4.6
      const blink = blinkCycle > 4.4 ? 1 : 0

      // Rounded dark obsidian badge so the 3D favicon reads sharply on any browser tab bar
      ctx.clearRect(0, 0, 64, 64)
      ctx.fillStyle = isDark ? '#050812' : '#0b1324'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(2, 2, 60, 60, 14)
      else ctx.rect(2, 2, 60, 60)
      ctx.fill()

      ctx.save()
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(2, 2, 60, 60, 14)
      else ctx.rect(2, 2, 60, 60)
      ctx.clip()

      renderGhostSpecimenFrame(ctx, {
        w: 64,
        h: 64,
        t,
        geo: GHOST_GEO_MARK,
        variant,
        isDark: true,
        yaw: Math.sin(t * 1.1) * 0.52,
        pitch: -0.06,
        cursorX: globalPointer.x * 0.5,
        cursorY: globalPointer.y * 0.5,
        blink,
        assemble: 1,
        pulse: 0,
        showRings: true,
        wireframe: false,
        clearCanvas: false,
      })
      ctx.restore()

      try {
        link.href = canvas.toDataURL('image/png')
      } catch {
        // ignore canvas security errors
      }
    }

    renderTick()
    const timer = setInterval(renderTick, 220)
    return () => clearInterval(timer)
  }, [isDark, variant])
}
