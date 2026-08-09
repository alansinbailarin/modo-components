<template> 
    <Teleport to="body"> 
        <Transition 
            enter-active-class="modo-popover-enter" 
            leave-active-class="modo-popover-leave" 
        > 
            <div 
                v-if="open" 
                ref="panelEl" 
                :role="role" 
                :aria-labelledby="labelledBy" 
                :style="mergedStyle" 
                :class="[
                    'modo-popover flex flex-col overflow-hidden bg-popover text-popover-foreground border border-border shadow-lg',
                    radiusClass,
                    $attrs.class,
                ]"
                :data-modo-theme="scopedTheme || undefined"
            >
                <!--
                    `min-h-0` is what makes the panel's max-height actually bite:
                    as a flex child this wrapper defaults to min-height:auto and
                    refuses to shrink below its content, so it would render past
                    the capped panel instead of scrolling inside it.
                -->
                <div :class="['modo-popover-inner min-h-0 flex-1 overflow-x-hidden overflow-y-auto', radiusClass]">
                    <slot />
                </div>
            </div> 
        </Transition> 
    </Teleport> 
</template> 
 
<script setup lang="ts"> 
import { computed, ref, watch } from 'vue'; 
import { useResolvedRadius, useResolvedTheme, useModoConfig } from '../../composables/useModoConfig'; 
import { resolveColorMode } from '../../composables/useColorMode'; 
import { palettesToCssVars, semanticTokensFromPalettes } from '../../config/palettes'; 
import { hexToOklchString, pickForegroundOklch } from '../../config/colorPrimitives'; 
import { surfacesToCssVars } from '../../config/surfaces'; 
 
defineOptions({ inheritAttrs: false }); 
 
const props = defineProps<{ 
    /** Controla la visibilidad. */ 
    open: boolean; 
    /** Estilo (top/left/width/zIndex) calculado por `usePopover`. */ 
    style?: Record<string, string>; 
    /** Radio de esquinas. Si no se pasa, toma el del provider. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** ARIA role. @default 'dialog' */ 
    role?: string; 
    /** Id del elemento que nombra al panel. */ 
    labelledBy?: string; 
}>(); 
 
const emit = defineEmits<{ 'update:panelRef': [el: HTMLElement | null] }>(); 
 
const panelEl = ref<HTMLElement | null>(null); 
watch(panelEl, (el) => emit('update:panelRef', el)); 
 
const radius = useResolvedRadius(() => props.radius); 
const theme = useResolvedTheme(); 
const cfg = useModoConfig(); 
// When the popover is portal'd to <body>, the data-modo-theme attribute on 
// the parent provider is out of scope. Forward it so dark mode works. 
const scopedTheme = computed(() => resolveColorMode(theme.value)); 
 
// Forward the provider's palette CSS vars (`--primary`, `--primary-foreground`, 
// etc.) to the teleported panel so `bg-primary` / `text-primary` stay in sync 
// with whatever palette the provider set. Also forward surface vars so tinted 
// surfaces (base intensity) are visible inside the popover. 
const mergedStyle = computed(() => { 
    const providerVars = cfg?.value.palettes 
        ? { 
              ...palettesToCssVars(cfg.value.palettes), 
              ...semanticTokensFromPalettes(cfg.value.palettes, hexToOklchString, pickForegroundOklch), 
          } 
        : {};
    const surfaceVars = cfg?.value.surfaces
        ? surfacesToCssVars(cfg.value.surfaces)
        : {};
    const darkSurfaceVars = (scopedTheme.value === 'dark' && cfg?.value.darkSurfaces)
        ? surfacesToCssVars(cfg.value.darkSurfaces)
        : {};
    return { ...providerVars, ...surfaceVars, ...darkSurfaceVars, ...(props.style ?? {}) }; 
}); 
 
const radiusClass = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-2xl'; 
        case 'medium': 
        default: return 'rounded-md'; 
    } 
}); 
</script> 
 
<style scoped> 
.modo-popover { 
    transform-origin: top center; 
    will-change: transform, opacity; 
} 
.modo-popover-enter { 
    animation: modo-popover-in 140ms cubic-bezier(0.2, 0, 0, 1); 
} 
.modo-popover-leave { 
    animation: modo-popover-out 80ms cubic-bezier(0.3, 0, 1, 1); 
} 
@keyframes modo-popover-in { 
    from { opacity: 0; transform: translateY(-4px) scale(0.98); } 
    to { opacity: 1; transform: translateY(0) scale(1); } 
} 
@keyframes modo-popover-out { 
    from { opacity: 1; transform: translateY(0); } 
    to { opacity: 0; transform: translateY(-2px); } 
} 
@media (prefers-reduced-motion: reduce) { 
    .modo-popover-enter, .modo-popover-leave { animation: none; } 
} 
</style>
