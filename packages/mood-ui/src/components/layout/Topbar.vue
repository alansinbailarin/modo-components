<template> 
    <component 
        :is="as" 
        :class="[ 
            'w-full bg-card text-foreground',
            stickyClasses, 
            divider ? 'border-b border-border' : '', 
        ]" 
    > 
        <div 
            :class="[ 
                'relative flex items-center gap-3 w-full', 
                heightClass, 
                paddingClasses, 
            ]" 
        > 
            <!-- Menu toggle (hamburger) --> 
            <Button 
                v-if="menuToggle" 
                variant="ghost" 
                color="default" 
                :size="buttonSize" 
                :icon="menuIcon ?? HamburgerIcon" 
                :ariaLabel="menuAriaLabel ?? 'Toggle navigation menu'" 
                class="shrink-0 -ml-1" 
                @click="emit('menu-toggle')" 
            /> 
 
            <!-- Logo / brand --> 
            <div 
                v-if="hasLogo || hasTitle" 
                class="flex items-center gap-2 shrink-0 min-w-0" 
            > 
                <slot name="logo" /> 
                <div v-if="hasTitle" class="flex flex-col min-w-0 leading-tight"> 
                    <span 
                        v-if="title || $slots.title" 
                        class="text-body font-semibold text-foreground truncate" 
                    > 
                        <slot name="title">{{ title }}</slot> 
                    </span> 
                    <span 
                        v-if="subtitle || $slots.subtitle" 
                        class="text-caption text-muted-foreground truncate" 
                    > 
                        <slot name="subtitle">{{ subtitle }}</slot> 
                    </span> 
                </div> 
            </div> 
 
            <!-- Inline navigation --> 
            <nav 
                v-if="$slots.nav" 
                class="hidden md:flex items-center gap-1 shrink-0" 
                aria-label="Primary" 
            > 
                <slot name="nav" /> 
            </nav> 
 
<!-- Search (truly centered over the full topbar width) --> 
            <div 
                v-if="$slots.search" 
                class="absolute inset-0 flex items-center justify-center pointer-events-none" 
                :class="paddingClasses"
            > 
                <div class="w-full max-w-md pointer-events-auto"> 
                    <slot name="search" /> 
                </div> 
            </div> 

            <!-- Spacer: always present to push actions/user to the right --> 
            <div class="flex-1 min-w-0" aria-hidden="true" />
 
            <!-- Actions (notifications, etc.) --> 
            <div 
                v-if="$slots.actions" 
                class="flex items-center gap-1 shrink-0" 
            > 
                <slot name="actions" /> 
            </div> 
 
            <!-- User menu / avatar --> 
            <div 
                v-if="$slots.user" 
                class="flex items-center shrink-0" 
            > 
                <slot name="user" /> 
            </div> 
        </div> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed, defineComponent, h, useSlots } from 'vue'; 
import type { Topbar } from '../../interfaces/layout/Topbar.interface'; 
import Button from '../forms/Button.vue'; 
import { useResolvedSize } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<Topbar>(), { 
    divider: true, 
    sticky: false, 
    padding: 'medium', 
    as: 'header', 
    menuToggle: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const emit = defineEmits<{ 'menu-toggle': [] }>(); 
const slots = useSlots(); 
 
// Default hamburger icon. Inline SVG avoids any external icon dependency; 
// `aria-hidden` because Button supplies the accessible name via `ariaLabel`. 
const HamburgerIcon = defineComponent({ 
    name: 'TopbarMenuIcon', 
    setup() { 
        return () => 
            h( 
                'svg', 
                { 
                    xmlns: 'http://www.w3.org/2000/svg', 
                    viewBox: '0 0 24 24', 
                    fill: 'none', 
                    stroke: 'currentColor', 
                    'stroke-width': 2, 
                    'stroke-linecap': 'round', 
                    'stroke-linejoin': 'round', 
                    'aria-hidden': 'true', 
                    class: 'h-5 w-5', 
                }, 
                [ 
                    h('line', { x1: 3, y1: 6, x2: 21, y2: 6 }), 
                    h('line', { x1: 3, y1: 12, x2: 21, y2: 12 }), 
                    h('line', { x1: 3, y1: 18, x2: 21, y2: 18 }), 
                ], 
            ); 
    }, 
}); 
 
const hasLogo = computed(() => !!slots.logo); 
const hasTitle = computed( 
    () => !!props.title || !!slots.title || !!props.subtitle || !!slots.subtitle, 
); 
 
const heightClass = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': 
            return 'h-12'; 
        case 'large': 
            return 'h-16'; 
        default: 
            return 'h-14'; 
    } 
}); 
 
const paddingClasses = computed(() => { 
    switch (props.padding) { 
        case 'none': 
            return 'px-0'; 
        case 'small': 
            return 'px-3'; 
        case 'large': 
            return 'px-6'; 
        default: 
            return 'px-4'; 
    } 
}); 
 
// Match the bar size for the menu toggle so it lines up vertically. 
const buttonSize = computed<'small' | 'medium'>(() =>
    resolvedSize.value === 'large' ? 'medium' : 'small',
);
 
const stickyClasses = computed(() => 
    props.sticky 
        ? 'sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-card/85'
        : '', 
); 
</script>
