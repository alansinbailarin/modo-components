<template> 
    <div :class="['flex flex-col gap-1', fullWidth ? 'w-full' : 'inline-flex']"> 
        <label 
            :for="fieldId" 
            :class="[ 
                'modo-checkbox group inline-flex items-start gap-2.5 select-none', 
                isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer', 
            ]" 
        > 
            <!-- Native input (visually hidden but accessible) --> 
            <input 
                :id="fieldId" 
                ref="inputEl" 
                type="checkbox" 
                class="peer sr-only" 
                :checked="isChecked" 
                :disabled="isDisabled" 
                :readonly="readonly" 
                :required="required" 
                :name="name" 
                :value="value" 
                :aria-label="!label ? ariaLabel : undefined" 
                :aria-invalid="hasError || undefined" 
                :aria-describedby="describedBy" 
                :aria-checked="indeterminate ? 'mixed' : isChecked" 
                @change="onChange" 
                @keydown="onKeydown" 
            /> 
 
            <!-- Visual box --> 
            <span 
                aria-hidden="true" 
                :class="[ 
                    'modo-checkbox-box relative shrink-0 inline-flex items-center justify-center', 
                    'border transition-all duration-base ease-standard', 
                    'ring-4 ring-border/25',
                    'peer-focus-visible:ring-2',
                    boxSizeClasses, 
                    boxRadiusClasses, 
                    boxStateClasses, 
                    'mt-0.5', 
                ]" 
            > 
                <CheckIcon 
                    v-if="isCheckedVisual && !indeterminate" 
                    :class="['text-current', iconSizeClasses]" 
                    stroke-width="3" 
                /> 
                <MinusIcon 
                    v-else-if="indeterminate" 
                    :class="['text-current', iconSizeClasses]" 
                    stroke-width="3" 
                /> 
            </span> 
 
            <!-- Text --> 
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
 
        <!-- Helper / error --> 
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
import { computed, ref, watch, onMounted } from 'vue'; 
import { CheckIcon, MinusIcon } from '@heroicons/vue/24/outline'; 
import { useFieldState } from '../../composables/useField'; 
import { useSizeTokens } from '../../composables/useModoConfig'; 
import type { Checkbox as CheckboxProps } from '../../interfaces/forms/Checkbox.interface'; 
import Typography from '../data-display/Typography.vue'; 
 
const props = withDefaults(defineProps<CheckboxProps & { fullWidth?: boolean }>(), { 
    modelValue: false, 
    color: 'default', 
    indeterminate: false, 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    fullWidth: false, 
}); 
 
const sz = useSizeTokens(() => props.size); 
 
const emit = defineEmits<{ 
    (e: 'update:modelValue', value: boolean): void; 
    (e: 'change', value: boolean): void; 
}>(); 
 
const { 
    fieldId, 
    radius, 
    stateColor, 
    hasError, 
    isDisabled, 
    errorId, 
    helperId, 
    describedBy, 
} = useFieldState(props, { componentName: 'Checkbox', idPrefix: 'modo-checkbox' }); 
 
const inputEl = ref<HTMLInputElement | null>(null); 
 
const isChecked = computed(() => !!props.modelValue); 
const isCheckedVisual = computed(() => isChecked.value && !props.indeterminate); 
 
function syncIndeterminate() { 
    if (inputEl.value) inputEl.value.indeterminate = !!props.indeterminate; 
} 
onMounted(syncIndeterminate); 
watch(() => props.indeterminate, syncIndeterminate); 
 
function onChange(e: Event) { 
    if (props.readonly) { 
        // Revert visual native state 
        if (inputEl.value) inputEl.value.checked = isChecked.value; 
        return; 
    } 
    const next = (e.target as HTMLInputElement).checked; 
    emit('update:modelValue', next); 
    emit('change', next); 
} 
 
function onKeydown(e: KeyboardEvent) { 
    if (e.key === ' ' && props.readonly) e.preventDefault(); 
} 
 
/* ---------- Size maps ---------- */ 
const boxSizeClasses = computed(() => sz.value.box);
const iconSizeClasses = computed(() => {
    switch (sz.value.box) {
        case 'h-4 w-4':           return 'w-3 h-3';       // xsmall
        case 'h-[18px] w-[18px]': return 'w-3.5 h-3.5'; // small
        case 'h-6 w-6':           return 'w-4 h-4';       // large
        case 'h-5 w-5':                                    // medium (default)
        default:                   return 'w-3.5 h-3.5';
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
 
/* ---------- Radius ---------- */ 
const boxRadiusClasses = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-[3px]'; 
        case 'large': return 'rounded-md'; 
        case 'full': return 'rounded-full'; 
        case 'medium': 
        default: return 'rounded-sm'; 
    } 
}); 
 
/* ---------- State colors ---------- */ 
const CHECKED_BG_BY_COLOR: Record<string, string> = { 
    default: 'bg-foreground border-foreground text-background', 
    primary: 'bg-primary border-primary text-primary-foreground', 
    danger: 'bg-destructive border-destructive text-destructive-foreground', 
    success: 'bg-success border-success text-success-foreground', 
    warning: 'bg-warning border-warning text-warning-foreground', 
}; 
 
// Unified focus ring (matches MODO_FOCUS_RING) — same across every control.
const FOCUS_RING_BY_COLOR: Record<string, string> = {
    default: 'peer-focus-visible:ring-ring/60',
    primary: 'peer-focus-visible:ring-ring/60',
    danger: 'peer-focus-visible:ring-ring/60',
    success: 'peer-focus-visible:ring-ring/60',
    warning: 'peer-focus-visible:ring-ring/60',
};
 
const HOVER_BORDER_BY_COLOR: Record<string, string> = { 
    default: 'group-hover:border-foreground/60', 
    primary: 'group-hover:border-primary/60', 
    danger: 'group-hover:border-destructive/60', 
    success: 'group-hover:border-success/60', 
    warning: 'group-hover:border-warning/60', 
}; 
 
const boxStateClasses = computed(() => { 
    const checked = isChecked.value || props.indeterminate; 
    const c = stateColor.value; 
    const ring = FOCUS_RING_BY_COLOR[c]; 
    if (checked) { 
        return [CHECKED_BG_BY_COLOR[c], ring].join(' '); 
    } 
    return [ 
        'bg-background border-input text-transparent', 
        HOVER_BORDER_BY_COLOR[c], 
        hasError.value ? 'border-destructive' : '', 
        ring, 
    ].join(' '); 
}); 
</script> 
 
<style scoped> 
.modo-checkbox-box { 
    transition-property: background-color, border-color, color, box-shadow, --tw-ring-color; 
} 
</style>
