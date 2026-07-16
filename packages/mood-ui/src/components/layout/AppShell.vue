<template> 
    <component 
        :is="as" 
        :class="[ 
            'flex flex-col text-foreground', 
            isContained ? 'min-h-dvh bg-muted p-4 md:p-6' : 'min-h-dvh bg-background', 
        ]" 
    > 
        <!-- Outer wrapper makes "contained" sit in a rounded card on muted bg. --> 
        <div 
            :class="[ 
                'flex flex-col flex-1 min-h-0', 
                isContained 
                    ? `bg-background ${radiusClass} ${dividerWrapperClass} overflow-hidden shadow-md` 
                    : '', 
            ]" 
        > 
            <!-- FULL SPAN MODE (default) -->
            <template v-if="!isContentSpan">
                <!-- TOPBAR -->
                <header
                    v-if="$slots.topbar"
                    :class="[
                        'w-full shrink-0 bg-card',
                        divider ? 'border-b border-border' : '',
                        stickyTopbar && !isContained
                            ? 'sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-card/85'
                            : '',
                    ]"
                >
                    <slot
                        name="topbar"
                        :collapsed="collapsedModel"
                        :mobile-open="mobileOpenModel"
                        :toggle-sidebar="toggleSidebar"
                        :toggle-collapsed="toggleCollapsed"
                        :open-mobile="openMobile"
                        :close-mobile="closeMobile"
                    />
                </header>

                <!-- BODY: rail + sidebar + main -->
                <div
                    :class="[
                        'flex flex-1 min-h-0',
                        sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
                    ]"
                >
                    <!-- RAIL (variants: rail, dual) -->
                    <aside
                        v-if="hasRail"
                        :class="[
                            'hidden shrink-0 bg-card flex-col',
                            desktopFlexClass,
                            railWidthClass,
                            railBorderClass,
                            stickySidebar ? desktopStickyClass : '',
                        ]"
                        :aria-label="'Primary navigation rail'"
                    >
                        <div v-if="$slots['rail-header']" class="shrink-0">
                            <slot name="rail-header" />
                        </div>
                        <div class="flex-1 min-h-0 overflow-y-auto">
                            <slot
                                name="rail"
                                :toggle-collapsed="toggleCollapsed"
                                :collapsed="collapsedModel"
                            />
                        </div>
                        <div v-if="$slots['rail-footer']" class="shrink-0">
                            <slot name="rail-footer" />
                        </div>
                    </aside>

                    <!-- SECONDARY PANEL (variant: dual) -->
                    <aside
                        v-if="variant === 'dual' && $slots.sidebar && !collapsedModel"
                        :class="[
                            'hidden shrink-0 bg-card flex-col transition-[width] duration-base ease-standard',
                            desktopFlexClass,
                            sidebarExpandedWidthClass,
                            sidebarBorderClass,
                            stickySidebar ? desktopStickyClass : '',
                        ]"
                        :aria-label="drawerAriaLabel ?? 'Secondary navigation'"
                    >
                        <div v-if="$slots['sidebar-header']" class="shrink-0">
                            <slot
                                name="sidebar-header"
                                :collapsed="false"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                        <div class="flex-1 min-h-0 overflow-y-auto">
                            <slot
                                name="sidebar"
                                :collapsed="false"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                        <div v-if="$slots['sidebar-footer']" class="shrink-0">
                            <slot
                                name="sidebar-footer"
                                :collapsed="false"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                    </aside>

                    <!-- STANDARD SIDEBAR (variant: standard) -->
                    <aside
                        v-if="variant === 'standard' && $slots.sidebar"
                        :class="[
                            'hidden shrink-0 bg-card flex-col transition-[width] duration-base ease-standard',
                            desktopFlexClass,
                            standardSidebarWidthClass,
                            sidebarBorderClass,
                            stickySidebar ? desktopStickyClass : '',
                        ]"
                        :aria-label="drawerAriaLabel ?? 'Sidebar navigation'"
                    >
                        <div v-if="$slots['sidebar-header']" class="shrink-0">
                            <slot
                                name="sidebar-header"
                                :collapsed="collapsedModel"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                        <div class="flex-1 min-h-0 overflow-visible">
                            <slot
                                name="sidebar"
                                :collapsed="collapsedModel"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                        <div v-if="$slots['sidebar-footer']" class="shrink-0">
                            <slot
                                name="sidebar-footer"
                                :collapsed="collapsedModel"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                    </aside>

                    <!-- MAIN -->
                    <main
                        :class="[
                            'flex-1 min-w-0 min-h-0 flex flex-col overflow-auto',
                            mainPaddingClass,
                        ]"
                    >
                        <slot />
                    </main>
                </div>

                <!-- FOOTER -->
                <footer
                    v-if="$slots.footer"
                    :class="[
                        'w-full shrink-0 bg-card',
                        divider ? 'border-t border-border' : '',
                    ]"
                >
                    <slot name="footer" />
                </footer>
            </template>

            <!-- CONTENT SPAN MODE: sidebar full height, topbar above main only -->
            <template v-else>
                <div
                    :class="[
                        'flex flex-1 min-h-0',
                        sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
                    ]"
                >
                    <!-- RAIL (full height) -->
                    <aside
                        v-if="hasRail"
                        :class="[
                            'relative z-40 hidden shrink-0 bg-card flex-col',
                            desktopFlexClass,
                            railWidthClass,
                            railBorderClass,
                            stickySidebar ? desktopStickyClass : '',
                        ]"
                        :aria-label="'Primary navigation rail'"
                    >
                        <div v-if="$slots['rail-header']" class="shrink-0">
                            <slot name="rail-header" />
                        </div>
                        <div class="flex-1 min-h-0 overflow-y-auto">
                            <slot
                                name="rail"
                                :toggle-collapsed="toggleCollapsed"
                                :collapsed="collapsedModel"
                            />
                        </div>
                        <div v-if="$slots['rail-footer']" class="shrink-0">
                            <slot name="rail-footer" />
                        </div>
                    </aside>

                    <!-- STANDARD SIDEBAR (full height) -->
                    <aside
                        v-if="variant === 'standard' && $slots.sidebar"
                        :class="[
                            'relative z-40 hidden shrink-0 bg-card flex-col transition-[width] duration-base ease-standard',
                            desktopFlexClass,
                            standardSidebarWidthClass,
                            sidebarBorderClass,
                            stickySidebar ? desktopStickyClass : '',
                        ]"
                        :aria-label="drawerAriaLabel ?? 'Sidebar navigation'"
                    >
                        <div v-if="$slots['sidebar-header']" class="shrink-0">
                            <slot
                                name="sidebar-header"
                                :collapsed="collapsedModel"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                        <div class="flex-1 min-h-0 overflow-visible">
                            <slot
                                name="sidebar"
                                :collapsed="collapsedModel"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                        <div v-if="$slots['sidebar-footer']" class="shrink-0">
                            <slot
                                name="sidebar-footer"
                                :collapsed="collapsedModel"
                                :toggle-collapsed="toggleCollapsed"
                                :is-mobile="false"
                                :close-mobile="closeMobile"
                            />
                        </div>
                    </aside>

                    <!-- CONTENT COLUMN: topbar + main + footer -->
                    <div class="flex flex-col flex-1 min-h-0">
                        <!-- TOPBAR (only above content column) -->
                        <header
                            v-if="$slots.topbar"
                            :class="[
                                'w-full shrink-0 bg-card',
                                divider ? 'border-b border-border' : '',
                                stickyTopbar && !isContained
                                    ? 'sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-card/85'
                                    : '',
                            ]"
                        >
                            <slot
                                name="topbar"
                                :collapsed="collapsedModel"
                                :mobile-open="mobileOpenModel"
                                :toggle-sidebar="toggleSidebar"
                                :toggle-collapsed="toggleCollapsed"
                                :open-mobile="openMobile"
                                :close-mobile="closeMobile"
                            />
                        </header>

                        <!-- SECONDARY PANEL (variant: dual, content span) -->
                        <aside
                            v-if="variant === 'dual' && $slots.sidebar && !collapsedModel"
                            :class="[
                                'hidden shrink-0 bg-card flex-col transition-[width] duration-base ease-standard',
                                desktopFlexClass,
                                sidebarExpandedWidthClass,
                                sidebarBorderClass,
                                stickySidebar ? desktopStickyClass : '',
                            ]"
                            :aria-label="drawerAriaLabel ?? 'Secondary navigation'"
                        >
                            <div v-if="$slots['sidebar-header']" class="shrink-0">
                                <slot
                                    name="sidebar-header"
                                    :collapsed="false"
                                    :toggle-collapsed="toggleCollapsed"
                                    :is-mobile="false"
                                    :close-mobile="closeMobile"
                                />
                            </div>
                            <div class="flex-1 min-h-0 overflow-y-auto">
                                <slot
                                    name="sidebar"
                                    :collapsed="false"
                                    :toggle-collapsed="toggleCollapsed"
                                    :is-mobile="false"
                                    :close-mobile="closeMobile"
                                />
                            </div>
                            <div v-if="$slots['sidebar-footer']" class="shrink-0">
                                <slot
                                    name="sidebar-footer"
                                    :collapsed="false"
                                    :toggle-collapsed="toggleCollapsed"
                                    :is-mobile="false"
                                    :close-mobile="closeMobile"
                                />
                            </div>
                        </aside>

                        <!-- MAIN (direct child of content column) -->
                        <main
                            :class="[
                                'flex-1 min-w-0 min-h-0 flex flex-col overflow-auto',
                                mainPaddingClass,
                            ]"
                        >
                            <slot />
                        </main>

                        <!-- FOOTER (scoped to content column) -->
                        <footer
                            v-if="$slots.footer"
                            :class="[
                                'w-full shrink-0 bg-card',
                                divider ? 'border-t border-border' : '',
                            ]"
                        >
                            <slot name="footer" />
                        </footer>
                    </div>
                </div>
            </template>
        </div> 
 
        <!-- MOBILE DRAWER --> 
        <Teleport to="body"> 
            <Transition 
                enter-active-class="duration-base ease-decelerate" 
                leave-active-class="duration-fast ease-accelerate" 
                enter-from-class="opacity-0" 
                leave-to-class="opacity-0" 
            > 
                <div 
                    v-if="mobileOpenModel && (hasMobileSidebar || hasRail)" 
                    :class="[ 
                        'fixed inset-0 z-50 flex', 
                        mobileHiddenClass, 
                        sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row', 
                    ]" 
                    role="dialog" 
                    aria-modal="true" 
                    :aria-label="drawerAriaLabel ?? 'Navigation menu'" 
                    @keydown.esc.stop="closeMobile" 
                > 
                    <!-- Backdrop --> 
                    <div 
                        class="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] transition-opacity duration-base ease-standard" 
                        aria-hidden="true" 
                        @click="closeMobile" 
                    /> 
                    <!-- Panel --> 
                    <Transition 
                        :enter-active-class="`duration-base ease-decelerate transition-transform`" 
                        :leave-active-class="`duration-fast ease-accelerate transition-transform`" 
                        :enter-from-class=" 
                            sidebarPosition === 'right' ? 'translate-x-full' : '-translate-x-full' 
                        " 
                        :leave-to-class=" 
                            sidebarPosition === 'right' ? 'translate-x-full' : '-translate-x-full' 
                        " 
                        appear 
                    > 
                        <aside 
                            ref="panelRef" 
                            tabindex="-1" 
                            :class="[ 
                                'relative h-full w-[18rem] max-w-[85vw] bg-card text-foreground shadow-xl flex flex-col focus:outline-none', 
                                sidebarPosition === 'right' 
                                    ? 'border-l border-border' 
                                    : 'border-r border-border', 
                            ]" 
                        > 
                            <div v-if="$slots['sidebar-header']" class="shrink-0"> 
                                <slot 
                                    name="sidebar-header" 
                                    :collapsed="false" 
                                    :toggle-collapsed="toggleCollapsed" 
                                    :is-mobile="true" 
                                    :close-mobile="closeMobile" 
                                /> 
                            </div> 
                            <div class="flex-1 min-h-0 overflow-y-auto"> 
                                <!-- On mobile we always render the full sidebar slot 
                                     if available; otherwise fall back to the rail. --> 
                                <slot 
                                    v-if="hasMobileSidebar" 
                                    name="sidebar" 
                                    :collapsed="false" 
                                    :toggle-collapsed="toggleCollapsed" 
                                    :is-mobile="true" 
                                    :close-mobile="closeMobile" 
                                /> 
                                <slot 
                                    v-else 
                                    name="rail" 
                                    :collapsed="false" 
                                    :toggle-collapsed="toggleCollapsed" 
                                /> 
                            </div> 
                            <div v-if="$slots['sidebar-footer']" class="shrink-0"> 
                                <slot 
                                    name="sidebar-footer" 
                                    :collapsed="false" 
                                    :toggle-collapsed="toggleCollapsed" 
                                    :is-mobile="true" 
                                    :close-mobile="closeMobile" 
                                /> 
                            </div> 
                        </aside> 
                    </Transition> 
                </div> 
            </Transition> 
        </Teleport> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed, nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue'; 
import type { AppShell } from '../../interfaces/layout/AppShell.interface'; 
 
const props = withDefaults(defineProps<AppShell>(), { 
    as: 'div', 
    variant: 'standard', 
    appearance: 'flush', 
    sidebarPosition: 'left', 
    sidebarWidth: 'medium', 
    collapsedWidth: 'small', 
    railWidth: 'small', 
    collapsed: false, 
    mobileOpen: false, 
    breakpoint: 'lg', 
    stickyTopbar: true, 
    stickySidebar: true, 
    divider: true, 
    mainPadding: 'none', 
    radius: 'large', 
    topbarSpan: 'full', 
}); 
 
const emit = defineEmits<{ 
    'update:collapsed': [value: boolean]; 
    'update:mobileOpen': [value: boolean]; 
}>(); 
 
const slots = useSlots(); 
 
// --- v-model bridges --------------------------------------------------------- 
const collapsedModel = computed({ 
    get: () => props.collapsed, 
    set: (v) => emit('update:collapsed', v), 
}); 
 
const mobileOpenModel = computed({ 
    get: () => props.mobileOpen, 
    set: (v) => emit('update:mobileOpen', v), 
}); 
 
function toggleCollapsed() { 
    collapsedModel.value = !collapsedModel.value; 
} 
 
function openMobile() { 
    mobileOpenModel.value = true; 
} 
 
function closeMobile() { 
    mobileOpenModel.value = false; 
} 
 
function toggleSidebar() { 
    mobileOpenModel.value = !mobileOpenModel.value; 
} 
 
// --- Appearance / framing ---------------------------------------------------- 
const isContained = computed(() => props.appearance === 'contained'); 
const isContentSpan = computed(() => props.topbarSpan === 'content'); 
 
const radiusClass = computed(() => { 
    switch (props.radius) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-md'; 
        case 'medium': return 'rounded-lg'; 
        case 'full': return 'rounded-3xl'; 
        default: return 'rounded-2xl'; 
    } 
}); 
 
const dividerWrapperClass = computed(() => 
    props.divider ? 'border border-border' : '', 
); 
 
// --- Variant flags ----------------------------------------------------------- 
const hasRail = computed( 
    () => props.variant === 'rail' || props.variant === 'dual', 
); 
const hasMobileSidebar = computed(() => !!slots.sidebar); 
 
// --- Breakpoint-driven static class maps ------------------------------------- 
const desktopFlexClass = computed(() => { 
    switch (props.breakpoint) { 
        case 'md': return 'md:flex'; 
        case 'xl': return 'xl:flex'; 
        default: return 'lg:flex'; 
    } 
}); 
 
const desktopStickyClass = computed(() => { 
    switch (props.breakpoint) { 
        case 'md': return 'md:sticky md:top-0 md:h-dvh'; 
        case 'xl': return 'xl:sticky xl:top-0 xl:h-dvh'; 
        default: return 'lg:sticky lg:top-0 lg:h-dvh'; 
    } 
}); 
 
const mobileHiddenClass = computed(() => { 
    switch (props.breakpoint) { 
        case 'md': return 'md:hidden'; 
        case 'xl': return 'xl:hidden'; 
        default: return 'lg:hidden'; 
    } 
}); 
 
// --- Widths ------------------------------------------------------------------ 
const sidebarExpandedWidthClass = computed(() => { 
    switch (props.sidebarWidth) { 
        case 'small': return 'w-56'; 
        case 'large': return 'w-72'; 
        default: return 'w-64'; 
    } 
}); 
 
const standardCollapsedWidthClass = computed(() => 
    props.collapsedWidth === 'medium' ? 'w-16' : 'w-14', 
); 
 
const standardSidebarWidthClass = computed(() => 
    collapsedModel.value 
        ? standardCollapsedWidthClass.value 
        : sidebarExpandedWidthClass.value, 
); 
 
const railWidthClass = computed(() => 
    props.railWidth === 'medium' ? 'w-16' : 'w-14', 
); 
 
// --- Borders ----------------------------------------------------------------- 
const sidebarBorderClass = computed(() => { 
    if (!props.divider) return ''; 
    return props.sidebarPosition === 'right' 
        ? 'border-l border-border' 
        : 'border-r border-border'; 
}); 
 
const railBorderClass = computed(() => { 
    if (!props.divider) return ''; 
    return props.sidebarPosition === 'right' 
        ? 'border-l border-border' 
        : 'border-r border-border'; 
}); 
 
// --- Main padding ------------------------------------------------------------ 
const mainPaddingClass = computed(() => { 
    switch (props.mainPadding) { 
        case 'small': return 'p-4'; 
        case 'medium': return 'p-6'; 
        case 'large': return 'p-8'; 
        default: return ''; 
    } 
}); 
 
// --- Mobile drawer focus + body scroll lock ---------------------------------- 
const panelRef = ref<HTMLElement | null>(null); 
 
function lockBody(lock: boolean) { 
    if (typeof document === 'undefined') return; 
    document.body.style.overflow = lock ? 'hidden' : ''; 
} 
 
watch(mobileOpenModel, async (open) => { 
    lockBody(open); 
    if (open) { 
        await nextTick(); 
        panelRef.value?.focus(); 
    } 
}); 
 
onBeforeUnmount(() => lockBody(false)); 
</script>
