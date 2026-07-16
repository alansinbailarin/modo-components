<template> 
    <div :class="['flex flex-col gap-1', fullWidth ? 'w-full' : 'inline-flex']"> 
        <label 
            :for="fieldId" 
            :class="[ 
                'modo-switch group inline-flex items-start gap-2.5 select-none', 
                labelPosition === 'left' ? 'flex-row-reverse justify-end' : '', 
                isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer', 
            ]" 
        > 
            <input 
                :id="fieldId" 
                ref="inputEl" 
                type="checkbox" 
                role="switch" 
                class="peer sr-only" 
                :checked="isChecked" 
                :disabled="isDisabled" 
                :readonly="readonly" 
                :required="required" 
                :name="name" 
                :aria-label="!label ? ariaLabel : undefined" 
                :aria-invalid="hasError || undefined" 
                :aria-describedby="describedBy" 
                :aria-checked="isChecked" 
                @change="onChange" 
            /> 
 
            <span 
                aria-hidden="true" 
                :class="[ 
                    'modo-switch-track relative shrink-0 inline-flex items-center', 
                    trackRadiusClass, 
                    'border border-transparent transition-all duration-base ease-standard', 
                    'ring-4 ring-border/25',
                    'peer-focus-visible:ring-2',
                    trackSizeClasses, 
                    trackStateClasses, 
                    'mt-0.5', 
                ]" 
            > 
                <span 
                    :class="[ 
                        'modo-switch-thumb inline-block bg-background rounded-full shadow-sm transition-transform duration-base ease-emphasized', 
                        thumbSizeClasses, 
                        thumbTransformClasses, 
                    ]" 
                /> 
            </span> 
 
            <span v-if="label || description" class="flex flex-col gap-0.5"> 
                <span 
                    v-if="label" 
                    :class="['font-medium text-foreground', labelSizeClasses]" 
                > 
                    {{ label }} 
                    <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span> 
                </span> 
                <span 
                    v-if="description" 
                    class="text-caption text-muted-foreground" 
                > 
                    {{ description }} 
                </span> 
            </span> 
        </label> 
 
        <Typography 
            v-if="hasError" 
            :id="errorId" 
            variant="caption" 
            size="medium" 
            color="danger" 
            as="p" 
            role="alert" 
        > 
            {{ errorText }} 
        </Typography> 
        <Typography 
            v-else-if="helperText" 
            :id="helperId" 
            variant="caption" 
            size="medium" 
            color="muted" 
            as="p" 
        > 
            {{ helperText }} 
        </Typography> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, ref } from 'vue'; 
import { useFieldState } from '../../composables/useField'; 
import { useResolvedRadius, useSizeTokens } from '../../composables/useModoConfig'; 
import type { Switch as SwitchProps } from '../../interfaces/forms/Switch.interface'; 
import Typography from '../data-display/Typography.vue'; 
 
const props = withDefaults(defineProps<SwitchProps & { fullWidth?: boolean }>(), { 
    modelValue: false, 
    color: 'default', 
    labelPosition: 'right', 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    fullWidth: false, 
}); 
 
const sz = useSizeTokens(() => props.size);
// Track radius (default pill). Thumb stays circular regardless. 
const resolvedRadius = useResolvedRadius(() => props.radius ?? 'full'); 
const trackRadiusClass = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none':   return 'rounded-none'; 
        case 'small':  return 'rounded-sm'; 
        case 'medium': return 'rounded-md'; 
        case 'large':  return 'rounded-lg'; 
        case 'full': 
        default:       return 'rounded-full'; 
    } 
}); 
 
const emit = defineEmits<{ 
    (e: 'update:modelValue', value: boolean): void; 
    (e: 'change', value: boolean): void; 
}>(); 
 
const { 
    fieldId, 
    stateColor, 
    hasError, 
    isDisabled, 
    errorId, 
    helperId, 
    describedBy, 
} = useFieldState(props, { componentName: 'Switch', idPrefix: 'modo-switch' }); 
 
const inputEl = ref<HTMLInputElement | null>(null); 
 
const isChecked = computed(() => !!props.modelValue); 
 
function onChange(e: Event) { 
    if (props.readonly) { 
        if (inputEl.value) inputEl.value.checked = isChecked.value; 
        return; 
    } 
    const next = (e.target as HTMLInputElement).checked; 
    emit('update:modelValue', next); 
    emit('change', next); 
} 
 
/* ---------- Sizes ---------- */ 
const trackSizeClasses = computed(() => {
    switch (sz.value.box) {
        case 'h-4 w-4':           return 'h-4 w-7 p-0.5';        // xsmall
        case 'h-[18px] w-[18px]': return 'h-[18px] w-8 p-0.5';  // small
        case 'h-6 w-6':           return 'h-6 w-11 p-0.5';       // large
        case 'h-5 w-5':                                            // medium (default)
        default:                   return 'h-5 w-9 p-0.5';
    }
});
const thumbSizeClasses = computed(() => {
    switch (sz.value.box) {
        case 'h-4 w-4':           return 'w-3 h-3';         // xsmall
        case 'h-[18px] w-[18px]': return 'w-3.5 h-3.5';    // small
        case 'h-6 w-6':           return 'w-5 h-5';         // large
        case 'h-5 w-5':                                       // medium (default)
        default:                   return 'w-4 h-4';
    }
});
const thumbTransformClasses = computed(() => {
    if (!isChecked.value) return 'translate-x-0';
    switch (sz.value.box) {
        case 'h-4 w-4':           return 'translate-x-3';    // xsmall: 28-12-4=12px
        case 'h-[18px] w-[18px]': return 'translate-x-3.5'; // small:  32-14-4=14px
        case 'h-6 w-6':           return 'translate-x-5';    // large:  44-20-4=20px
        case 'h-5 w-5':                                        // medium (default)
        default:                   return 'translate-x-4';    // medium: 36-16-4=16px
    }
});
const labelSizeClasses = computed(() => {
    switch (sz.value.box) {
        case 'h-4 w-4':           return 'text-caption';  // xsmall
        case 'h-[18px] w-[18px]': return 'text-caption';  // small
        case 'h-6 w-6':           return 'text-body-lg';  // large
        case 'h-5 w-5':                                    // medium (default)
        default:                   return 'text-body';
    }
});
 
/* ---------- State colors ---------- */ 
const CHECKED_BG_BY_COLOR: Record<string, string> = { 
    default: 'bg-foreground', 
    primary: 'bg-primary', 
    danger: 'bg-destructive', 
    success: 'bg-success', 
    warning: 'bg-warning', 
}; 
 
// Unified focus ring (matches MODO_FOCUS_RING) — same across every control.
const FOCUS_RING_BY_COLOR: Record<string, string> = {
    default: 'peer-focus-visible:ring-ring/60',
    primary: 'peer-focus-visible:ring-ring/60',
    danger: 'peer-focus-visible:ring-ring/60',
    success: 'peer-focus-visible:ring-ring/60',
    warning: 'peer-focus-visible:ring-ring/60',
};
 
const HOVER_BG_BY_COLOR: Record<string, string> = { 
    default: 'group-hover:bg-muted', 
    primary: 'group-hover:bg-muted', 
    danger: 'group-hover:bg-muted', 
    success: 'group-hover:bg-muted', 
    warning: 'group-hover:bg-muted', 
}; 
 
const trackStateClasses = computed(() => { 
    const c = stateColor.value; 
    const ring = FOCUS_RING_BY_COLOR[c]; 
    if (isChecked.value) { 
        return [CHECKED_BG_BY_COLOR[c], ring].join(' '); 
    } 
    return [ 
        'bg-input', 
        HOVER_BG_BY_COLOR[c], 
        hasError.value ? 'bg-destructive/20' : '', 
        ring, 
    ].join(' '); 
}); 
</script> 
 
<style scoped> 
.modo-switch-track { 
    transition-property: background-color, box-shadow, --tw-ring-color; 
} 
</style>
