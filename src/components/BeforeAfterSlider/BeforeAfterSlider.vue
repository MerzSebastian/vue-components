<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface BeforeAfterSliderProps {
  /** Image (or any) src shown on the "before" side */
  beforeSrc: string
  /** Image (or any) src shown on the "after" side */
  afterSrc: string
  /** Alt text for the before image */
  beforeAlt?: string
  /** Alt text for the after image */
  afterAlt?: string
  /** Label rendered over the before side. Set to `false` / omit to hide. */
  beforeLabel?: string
  /** Label rendered over the after side. Set to `false` / omit to hide. */
  afterLabel?: string
  /** Drag axis of the divider */
  orientation?: 'horizontal' | 'vertical'
  /** Initial divider position, 0-100 */
  modelValue?: number
  /** Disable all user interaction */
  disabled?: boolean
  /** Play a sweep animation once on mount to hint at interactivity */
  autoAnimate?: boolean
  /** Duration in ms of the auto-animate sweep */
  autoAnimateDuration?: number
  /** Clicking/tapping anywhere on the frame moves the divider there */
  clickToMove?: boolean
  /** Aspect ratio applied to the frame, e.g. "16 / 9". Omit to size from content. */
  aspectRatio?: string
}

const props = withDefaults(defineProps<BeforeAfterSliderProps>(), {
  beforeAlt: 'Before',
  afterAlt: 'After',
  orientation: 'horizontal',
  modelValue: 50,
  disabled: false,
  autoAnimate: false,
  autoAnimateDuration: 900,
  clickToMove: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [value: number]
  'dragStart': []
  'dragEnd': []
}>()

const root = ref<HTMLElement | null>(null)
const position = ref(clamp(props.modelValue))
const dragging = ref(false)
const isAnimating = ref(false)

const isHorizontal = computed(() => props.orientation === 'horizontal')

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined && !dragging.value) position.value = clamp(value)
  },
)

function clamp(value: number) {
  return Math.min(100, Math.max(0, value))
}

function setPosition(value: number, { silent = false } = {}) {
  position.value = clamp(value)
  if (!silent) {
    emit('update:modelValue', position.value)
    emit('change', position.value)
  }
}

function positionFromClientPoint(clientX: number, clientY: number) {
  const el = root.value
  if (!el) return position.value
  const rect = el.getBoundingClientRect()
  const ratio = isHorizontal.value
    ? (clientX - rect.left) / rect.width
    : (clientY - rect.top) / rect.height
  return clamp(ratio * 100)
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return
  dragging.value = true
  isAnimating.value = false
  emit('dragStart')
  ;(event.target as HTMLElement).setPointerCapture?.(event.pointerId)
  setPosition(positionFromClientPoint(event.clientX, event.clientY))
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  setPosition(positionFromClientPoint(event.clientX, event.clientY))
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  emit('dragEnd')
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

function onFrameClick(event: MouseEvent) {
  if (props.disabled || !props.clickToMove || dragging.value) return
  setPosition(positionFromClientPoint(event.clientX, event.clientY))
}

const KEY_STEP = 2
function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const decreaseKeys = isHorizontal.value ? ['ArrowLeft'] : ['ArrowUp']
  const increaseKeys = isHorizontal.value ? ['ArrowRight'] : ['ArrowDown']
  if (decreaseKeys.includes(event.key)) {
    event.preventDefault()
    setPosition(position.value - KEY_STEP)
  } else if (increaseKeys.includes(event.key)) {
    event.preventDefault()
    setPosition(position.value + KEY_STEP)
  } else if (event.key === 'Home') {
    event.preventDefault()
    setPosition(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    setPosition(100)
  }
}

let animationFrame: number | undefined
onMounted(() => {
  if (!props.autoAnimate) return
  isAnimating.value = true
  const start = performance.now()
  const from = position.value
  const sweepTo = from < 50 ? 80 : 20
  const settle = props.modelValue ?? 50

  const runSweep = (now: number) => {
    const t = Math.min(1, (now - start) / props.autoAnimateDuration)
    const eased = 1 - Math.pow(1 - t, 3)
    setPosition(from + (sweepTo - from) * eased, { silent: true })
    if (t < 1) {
      animationFrame = requestAnimationFrame(runSweep)
    } else {
      const settleStart = performance.now()
      const runSettle = (now2: number) => {
        const t2 = Math.min(1, (now2 - settleStart) / (props.autoAnimateDuration * 0.6))
        const eased2 = 1 - Math.pow(1 - t2, 3)
        setPosition(sweepTo + (settle - sweepTo) * eased2, { silent: true })
        if (t2 < 1) {
          animationFrame = requestAnimationFrame(runSettle)
        } else {
          isAnimating.value = false
        }
      }
      animationFrame = requestAnimationFrame(runSettle)
    }
  }
  animationFrame = requestAnimationFrame(runSweep)
})

onBeforeUnmount(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

const clipPath = computed(() => {
  return isHorizontal.value
    ? `inset(0 ${100 - position.value}% 0 0)`
    : `inset(0 0 ${100 - position.value}% 0)`
})

const frameCursorClass = computed(() => {
  if (props.disabled || !props.clickToMove) return 'cursor-default'
  return isHorizontal.value ? 'cursor-ew-resize' : 'cursor-ns-resize'
})
</script>

<template>
  <div
    ref="root"
    class="relative w-full select-none overflow-hidden rounded-lg bg-neutral-900 touch-none"
    :class="[aspectRatio ? '' : 'aspect-[3/2]', frameCursorClass]"
    :style="aspectRatio ? { aspectRatio } : undefined"
    @click="onFrameClick"
  >
    <!-- After (base layer, fully visible) -->
    <div class="absolute inset-0">
      <slot name="after">
        <img :src="afterSrc" :alt="afterAlt" class="h-full w-full object-cover" draggable="false" />
      </slot>
      <div
        v-if="afterLabel"
        class="pointer-events-none absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white"
      >
        {{ afterLabel }}
      </div>
    </div>

    <!-- Before (clipped layer, revealed by divider position) -->
    <div class="absolute inset-0" :style="{ clipPath }">
      <slot name="before">
        <img :src="beforeSrc" :alt="beforeAlt" class="h-full w-full object-cover" draggable="false" />
      </slot>
      <div
        v-if="beforeLabel"
        class="pointer-events-none absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white"
      >
        {{ beforeLabel }}
      </div>
    </div>

    <!-- Divider line -->
    <div
      class="pointer-events-none absolute bg-white/80"
      :class="isHorizontal ? 'inset-y-0 w-0.5' : 'inset-x-0 h-0.5'"
      :style="isHorizontal ? { left: `${position}%` } : { top: `${position}%` }"
    />

    <!-- Handle -->
    <div
      class="absolute flex touch-none items-center justify-center outline-none"
      :class="[
        isHorizontal
          ? '-translate-x-1/2 -translate-y-1/2 top-1/2'
          : '-translate-x-1/2 -translate-y-1/2 left-1/2',
        disabled ? 'cursor-default' : isHorizontal ? 'cursor-ew-resize' : 'cursor-ns-resize',
      ]"
      :style="isHorizontal ? { left: `${position}%` } : { top: `${position}%` }"
      role="slider"
      :aria-valuenow="Math.round(position)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-orientation="orientation"
      :aria-disabled="disabled"
      tabindex="0"
      @pointerdown.stop="onPointerDown"
      @click.stop
      @keydown="onKeydown"
    >
      <slot name="handle" :position="position" :dragging="dragging">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white/90 shadow-lg ring-2 ring-black/10 transition-transform"
          :class="{ 'scale-110': dragging || isAnimating }"
        >
          <svg
            v-if="isHorizontal"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 text-neutral-700"
          >
            <path d="m9 18-6-6 6-6" />
            <path d="m15 6 6 6-6 6" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 text-neutral-700"
          >
            <path d="m18 15-6 6-6-6" />
            <path d="m6 9 6-6 6 6" />
          </svg>
        </div>
      </slot>
    </div>
  </div>
</template>
