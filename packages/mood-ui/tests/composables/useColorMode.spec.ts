import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * The composable is a module-level singleton that reads `matchMedia` and
 * `localStorage` at import time, so every test re-imports it against a fresh
 * fake environment.
 */

type Listener = (e: { matches: boolean }) => void;

interface FakeMedia {
    setSystemDark: (v: boolean) => void;
    listenerCount: () => number;
}

function installEnv(opts: { systemDark?: boolean; stored?: string | null } = {}): FakeMedia {
    const listeners = new Set<Listener>();
    let matches = opts.systemDark ?? false;

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: (query: string) => ({
            get matches() {
                return query.includes('prefers-color-scheme: dark') ? matches : false;
            },
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: (_: string, cb: Listener) => { listeners.add(cb); },
            removeEventListener: (_: string, cb: Listener) => { listeners.delete(cb); },
            dispatchEvent: () => false,
        }),
    });

    const store = new Map<string, string>();
    if (opts.stored != null) store.set('modo-color-mode', opts.stored);
    Object.defineProperty(window, 'localStorage', {
        writable: true,
        configurable: true,
        value: {
            getItem: (k: string) => store.get(k) ?? null,
            setItem: (k: string, v: string) => { store.set(k, v); },
            removeItem: (k: string) => { store.delete(k); },
            clear: () => { store.clear(); },
            key: () => null,
            length: 0,
        },
    });

    return {
        setSystemDark(v: boolean) {
            matches = v;
            listeners.forEach((cb) => cb({ matches: v }));
        },
        listenerCount: () => listeners.size,
    };
}

beforeEach(() => {
    vi.resetModules();
    document.documentElement.className = '';
});

describe('useColorMode — system preference tracking', () => {
    it('follows the OS when the mode is "system"', async () => {
        const media = installEnv({ systemDark: false });
        const { useColorMode } = await import('../../src/composables/useColorMode');

        const { resolved, isDark } = useColorMode();
        expect(resolved.value).toBe('light');

        media.setSystemDark(true);

        expect(resolved.value).toBe('dark');
        expect(isDark.value).toBe(true);
    });

    it('toggles the `dark` class on <html> when the OS preference flips', async () => {
        const media = installEnv({ systemDark: false });
        const { useColorMode } = await import('../../src/composables/useColorMode');
        useColorMode();

        expect(document.documentElement.classList.contains('dark')).toBe(false);

        media.setSystemDark(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);

        media.setSystemDark(false);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('keeps the consumer `darkClass` in sync with the OS preference', async () => {
        const media = installEnv({ systemDark: false });
        const { useColorMode } = await import('../../src/composables/useColorMode');
        useColorMode({ darkClass: 'appdark' });

        media.setSystemDark(true);

        expect(document.documentElement.classList.contains('appdark')).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('ignores the OS once an explicit mode is chosen, and resumes on "system"', async () => {
        const media = installEnv({ systemDark: false });
        const { useColorMode } = await import('../../src/composables/useColorMode');
        const { set, resolved } = useColorMode();

        set('light');
        media.setSystemDark(true);
        expect(resolved.value).toBe('light');

        // Going back to "system" must pick up the current OS value, not the
        // one captured at init.
        set('system');
        expect(resolved.value).toBe('dark');
    });

    it('does not clobber the stored "system" choice when the OS flips', async () => {
        const media = installEnv({ systemDark: false, stored: 'system' });
        const { useColorMode } = await import('../../src/composables/useColorMode');
        const { mode } = useColorMode();

        media.setSystemDark(true);

        expect(mode.value).toBe('system');
        expect(window.localStorage.getItem('modo-color-mode')).toBe('system');
    });
});

describe('resolveColorMode', () => {
    it('tracks the OS preference for scoped providers', async () => {
        const media = installEnv({ systemDark: false });
        const { resolveColorMode } = await import('../../src/composables/useColorMode');
        const { computed } = await import('vue');

        const scoped = computed(() => resolveColorMode('system'));
        expect(scoped.value).toBe('light');

        media.setSystemDark(true);
        expect(scoped.value).toBe('dark');
    });
});
