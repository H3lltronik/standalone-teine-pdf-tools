<template>
  <component
    :is="tag"
    v-bind="tagAttrs"
    :class="buttonClasses"
  >
    <slot name="icon" />
    <template v-if="variant !== 'icon' && variant !== 'placeholder'">
      <span v-if="$slots.default"><slot /></span>
    </template>
    <template v-else-if="variant === 'placeholder'">
      <slot />
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type ButtonVariant =
  | 'default'
  | 'flat'
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'icon'
  | 'placeholder'

export type ButtonSize = 'xs' | 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    block?: boolean
    disabled?: boolean
    href?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'default',
    size: 'md',
    block: false,
    disabled: false,
    type: 'button',
  }
)

const tag = computed(() =>
  props.variant === 'flat' && props.href ? 'a' : 'button'
)

const tagAttrs = computed(() => {
  if (tag.value === 'a') {
    return { href: props.href }
  }
  return { type: props.type, disabled: props.disabled }
})

const buttonClasses = computed(() => {
  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
  }
  const base = `cursor-pointer inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:pointer-events-none ${sizeClasses[props.size]}`
  const blockClass = props.block ? 'w-full' : ''

  switch (props.variant) {
    case 'flat':
      return [base, blockClass, 'text-accent hover:text-blue-700 disabled:opacity-50'].filter(Boolean).join(' ')
    case 'primary':
      return [
        base,
        blockClass,
        'rounded py-2.5 shadow-sm bg-primary text-white hover:bg-primary-dark disabled:cursor-wait',
      ].filter(Boolean).join(' ')
    case 'secondary':
      return [
        base,
        blockClass,
        'rounded py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50',
      ].filter(Boolean).join(' ')
    case 'ghost':
      return [
        base,
        blockClass,
        'rounded-lg px-3 py-2 bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/30 disabled:opacity-50',
      ].filter(Boolean).join(' ')
    case 'icon':
      return [
        base,
        'p-1.5 rounded-full bg-white/90 backdrop-blur border border-slate-100 shadow-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-50',
      ].filter(Boolean).join(' ')
    case 'placeholder':
      return [
        base,
        'flex-col rounded-xl border-2 border-dashed border-slate-200 p-8 min-h-[300px] w-full bg-white text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-slate-50 group disabled:opacity-50',
      ].filter(Boolean).join(' ')
    default:
      return [
        base,
        blockClass,
        'px-4 py-2.5 rounded-xl text-white shadow-soft bg-blue-600 hover:bg-blue-700 disabled:opacity-50',
      ].filter(Boolean).join(' ')
  }
})
</script>
