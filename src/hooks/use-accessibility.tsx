'use client'

import { useEffect, useCallback } from 'react'

interface UseAccessibilityProps {
    announceMessage?: (message: string) => void
    enableKeyboardNavigation?: boolean
    enableFocusManagement?: boolean
}

export function useAccessibility({
    announceMessage,
    enableKeyboardNavigation = true,
    enableFocusManagement = true,
}: UseAccessibilityProps = {}) {
    // Screen reader announcements
    const announce = useCallback(
        (message: string, priority: 'polite' | 'assertive' = 'polite') => {
            const announcer = document.createElement('div')
            announcer.setAttribute('aria-live', priority)
            announcer.setAttribute('aria-atomic', 'true')
            announcer.className = 'sr-only'
            announcer.textContent = message

            document.body.appendChild(announcer)

            // Remove after announcement
            setTimeout(() => {
                document.body.removeChild(announcer)
            }, 1000)

            if (announceMessage) {
                announceMessage(message)
            }
        },
        [announceMessage]
    )

    // Keyboard navigation handler
    const handleKeyboardNavigation = useCallback(
        (event: KeyboardEvent) => {
            // Allow custom keyboard shortcuts
            if (event.altKey && event.key === 'c') {
                // Alt+C to focus chat input
                const chatInput = document.querySelector('textarea[aria-label="Chat message input"]') as HTMLElement
                if (chatInput) {
                    chatInput.focus()
                    announce('Chat input focused')
                }
            }

            if (event.altKey && event.key === 'u') {
                // Alt+U to trigger file upload
                const uploadButton = document.querySelector('button[aria-label="Upload file"]') as HTMLElement
                if (uploadButton) {
                    uploadButton.click()
                    announce('File upload triggered')
                }
            }

            if (event.altKey && event.key === 'x') {
                // Alt+X to export chat
                const exportButton = document.querySelector(
                    'button:has(svg + text():contains("Export"))'
                ) as HTMLElement
                if (exportButton) {
                    exportButton.click()
                    announce('Export chat triggered')
                }
            }
        },
        [announce]
    )

    // Focus management
    const manageFocus = useCallback(
        (target: HTMLElement | null, announceText?: string) => {
            if (!target || !enableFocusManagement) return

            // Ensure element is focusable
            if (
                !target.hasAttribute('tabindex') &&
                target.tagName !== 'INPUT' &&
                target.tagName !== 'BUTTON' &&
                target.tagName !== 'TEXTAREA'
            ) {
                target.setAttribute('tabindex', '-1')
            }

            target.focus()

            if (announceText) {
                announce(announceText)
            }
        },
        [announce, enableFocusManagement]
    )

    // High contrast mode detection
    const detectHighContrast = useCallback(() => {
        const testElement = document.createElement('div')
        testElement.style.color = 'rgb(31, 31, 31)'
        testElement.style.backgroundColor = 'rgb(31, 31, 31)'
        document.body.appendChild(testElement)

        const computedStyle = window.getComputedStyle(testElement)
        const isHighContrast = computedStyle.color !== computedStyle.backgroundColor

        document.body.removeChild(testElement)

        if (isHighContrast) {
            document.body.classList.add('high-contrast')
        }

        return isHighContrast
    }, [])

    // Reduced motion detection
    const detectReducedMotion = useCallback(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion')
        }

        return prefersReducedMotion
    }, [])

    // Color contrast checker
    const checkColorContrast = useCallback((foreground: string, background: string): number => {
        // Simple contrast ratio calculation
        const getLuminance = (color: string): number => {
            const rgb = color.match(/\d+/g)
            if (!rgb) return 0

            const [r, g, b] = rgb.map((c) => {
                const srgb = parseInt(c) / 255
                return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
            })

            return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }

        const l1 = getLuminance(foreground)
        const l2 = getLuminance(background)
        const lighter = Math.max(l1, l2)
        const darker = Math.min(l1, l2)

        return (lighter + 0.05) / (darker + 0.05)
    }, [])

    // Initialize accessibility features
    useEffect(() => {
        if (enableKeyboardNavigation) {
            document.addEventListener('keydown', handleKeyboardNavigation)
        }

        // Detect user preferences
        detectHighContrast()
        detectReducedMotion()

        // Add skip link if not present
        const skipLink = document.getElementById('skip-to-main')
        if (!skipLink) {
            const skip = document.createElement('a')
            skip.id = 'skip-to-main'
            skip.href = '#main-content'
            skip.textContent = 'Skip to main content'
            skip.className =
                'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded'
            document.body.insertBefore(skip, document.body.firstChild)
        }

        return () => {
            if (enableKeyboardNavigation) {
                document.removeEventListener('keydown', handleKeyboardNavigation)
            }
        }
    }, [enableKeyboardNavigation, handleKeyboardNavigation, detectHighContrast, detectReducedMotion])

    return {
        announce,
        manageFocus,
        checkColorContrast,
        detectHighContrast,
        detectReducedMotion,
    }
}

// CSS-in-JS styles for accessibility
export const accessibilityStyles = `
/* Screen reader only content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
}

/* High contrast mode styles */
.high-contrast {
    --tw-text-opacity: 1;
    --tw-bg-opacity: 1;
}

.high-contrast * {
    border-color: currentColor !important;
}

/* Reduced motion styles */
.reduced-motion *,
.reduced-motion *::before,
.reduced-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
}

/* Focus indicators */
*:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* Ensure minimum touch targets */
@media (hover: none) and (pointer: coarse) {
    button, 
    [role="button"], 
    input[type="button"], 
    input[type="submit"], 
    input[type="reset"] {
        min-height: 44px;
        min-width: 44px;
    }
}
`
