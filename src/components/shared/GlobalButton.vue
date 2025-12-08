<template>
  <button
    v-bind="forwardedAttrs"
    :disabled="isDisabled"
    :class="['base-btn', attrsClass, forwardedClass, sizeClass, { 'btn-block': props.block, 'btn-loading': props.loading }]"
  >
    <span v-if="props.loading" class="btn-spinner" aria-hidden="true" />
    <i
      v-else-if="shouldShowIcon && iconPosition === 'left'"
      :class="['btn-icon', props.icon]"
      aria-hidden="true"
    />
    <span v-if="props.label" class="btn-label">{{ props.label }}</span>
    <i
      v-if="shouldShowIcon && iconPosition === 'right'"
      :class="['btn-icon', props.icon]"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

type ButtonType = 'primary' | 'secondary' | 'warning'
type ButtonSize = 'sm' | 'md' | 'lg'
type Severity = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'
type ButtonVariant = 'primary' | 'secondary' | 'warning'
type ButtonHtmlType = 'button' | 'submit' | 'reset'

interface Props {
  type?: ButtonType | ButtonHtmlType
  severity?: Severity
  label?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  loading?: boolean
  block?: boolean
  size?: ButtonSize
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  iconPosition: 'left',
  size: 'md',
  block: false,
  loading: false
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, disabled, ...rest } = attrs
  return rest
})

const attrsClass = computed(() => attrs.class)

const rawDisabled = computed(() => {
  const disabled = attrs.disabled
  if (disabled === '' || disabled === true) return true
  if (typeof disabled === 'string') return disabled !== 'false'
  return Boolean(disabled)
})

const isDisabled = computed(() => rawDisabled.value || props.loading)

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'btn-sm'
  if (props.size === 'lg') return 'btn-lg'
  return 'btn-md'
})

const variant = computed<ButtonVariant>(() => {
  if (props.type === 'secondary') return 'secondary'
  if (props.type === 'warning' || props.severity === 'danger' || props.severity === 'warning') return 'warning'
  return 'primary'
})

const forwardedClass = computed(() => {
  if (variant.value === 'secondary') return 'secondary-btn'
  if (variant.value === 'warning') return 'warning-btn'
  return 'primary-btn'
})

const shouldShowIcon = computed(() => Boolean(props.icon && !props.loading))
const iconPosition = computed(() => props.iconPosition ?? 'left')
const htmlType = computed<ButtonHtmlType>(() => {
    if (props.type === 'submit' || props.type === 'reset' || props.type === 'button') {
        return props.type
    }
    return 'button'
})
</script>

<style scoped>
/* --- BASE BUTTON STYLES --- */
.base-btn {
  /* Common styles previously covered by Tailwind base classes */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600; /* font-semibold */
  padding: 0.75rem 1rem; /* px-4 py-2 */
  border-radius: 0.5rem; /* rounded-lg */
  transition: all 200ms ease-in-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); /* shadow-md */
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
}

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.9rem;
}

.btn-lg {
  padding: 0.85rem 1.5rem;
  font-size: 1.05rem;
}

/* --- COLOR VARIABLES (FOR DARK MODE HANDLING) --- */
/* LIGHT MODE DEFAULTS */
:root, .base-btn {
  /* PRIMARY: Using #065986 */
  --primary-color-start: #064a6d; /* Darker shade of #065986 for gradient start */
  --primary-color-end: #076d99;   /* Lighter shade of #065986 for gradient end */
  --primary-border-color: #065986;
  --primary-hover-start: #063952; /* Even darker for hover start */
  --primary-hover-end: #065986;   /* Main color for hover end */
  
  /* SECONDARY/WARNING (Unchanged) */
  --secondary-color: #1d4ed8; /* blue-700 */
  --warning-color: #b91c1c; /* red-700 */
  --outline-hover-bg: #eff6ff; /* blue-50 / red-50 */
}

/* DARK MODE OVERRIDES */
:global(html.dark) .base-btn,
:global(html.theme-dark) .base-btn,
:global(.theme-dark) .base-btn {
  /* PRIMARY: Using #065986, slightly adjusted for dark background */
  --primary-color-start: #065986;
  --primary-color-end: #0779a8; 
  --primary-border-color: #076d99; 
  --primary-hover-start: #054865;
  --primary-hover-end: #065986;
  /* Secondary & warning keep light-mode values for consistent contrast */
}

/* --- 1. PRIMARY BUTTON: Gradient BG (Dark Blue to Blue) --- */
.primary-btn {
  color: white;
  border-color: var(--primary-border-color);
  background-image: linear-gradient(to top, var(--primary-color-start), var(--primary-color-end));
}

.primary-btn:hover {
  background-image: linear-gradient(to top, var(--primary-hover-start), var(--primary-hover-end));
}

/* --- 2. SECONDARY BUTTON: White BG, Blue Outline/Text --- */
.secondary-btn {
  background-color: white;
  color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.secondary-btn:hover {
  background-color: var(--outline-hover-bg);
}

/* --- 3. WARNING BUTTON: White BG, Red Outline/Text --- */
.warning-btn {
  background-color: white;
  color: var(--warning-color);
  border-color: var(--warning-color);
}

.warning-btn:hover {
  background-color: var(--outline-hover-bg); /* Use the lightest red/blue hover */
}

.btn-icon {
  font-size: 1rem;
}

/* ... (Spinner and Loading styles remain the same) ... */

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: btn-spin 0.75s linear infinite;
}

.btn-loading .btn-label {
  opacity: 0.8;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>