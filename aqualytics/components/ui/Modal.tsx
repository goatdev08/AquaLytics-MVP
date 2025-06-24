import React, { forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface ModalProps {
  /**
   * Modal visibility state
   */
  open: boolean
  
  /**
   * Modal variant
   */
  variant?: 'default' | 'phoenix' | 'warm' | 'sunset' | 'destructive'
  
  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  
  /**
   * Modal title
   */
  title?: string
  
  /**
   * Modal description
   */
  description?: string
  
  /**
   * Modal content
   */
  children?: React.ReactNode
  
  /**
   * Modal footer content
   */
  footer?: React.ReactNode
  
  /**
   * Close button visibility
   */
  showCloseButton?: boolean
  
  /**
   * Close on backdrop click
   */
  closeOnBackdrop?: boolean
  
  /**
   * Close on escape key
   */
  closeOnEscape?: boolean
  
  /**
   * Prevent body scroll when open
   */
  preventScroll?: boolean
  
  /**
   * Loading state
   */
  loading?: boolean
  
  /**
   * Close handler
   */
  onClose?: () => void
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Additional backdrop CSS classes
   */
  backdropClassName?: string
  
  /**
   * Animation duration in ms
   */
  animationDuration?: number
}

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-6 w-6 text-phoenix-orange"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/**
 * Phoenix-themed Modal component with backdrop blur and advanced animations.
 * 
 * @param open - Modal visibility state
 * @param variant - Modal style variant
 * @param size - Modal size
 * @param title - Modal title
 * @param description - Modal description
 * @param children - Modal content
 * @param footer - Modal footer content
 * @param showCloseButton - Close button visibility
 * @param closeOnBackdrop - Close on backdrop click
 * @param closeOnEscape - Close on escape key
 * @param preventScroll - Prevent body scroll when open
 * @param loading - Loading state
 * @param onClose - Close handler
 * @param className - Additional CSS classes
 * @param backdropClassName - Additional backdrop CSS classes
 * @param animationDuration - Animation duration in ms
 */
const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    open,
    variant = 'default',
    size = 'md',
    title,
    description,
    children,
    footer,
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    preventScroll = true,
    loading = false,
    onClose,
    className,
    backdropClassName,
    animationDuration = 300
  }, ref) => {
    
    const modalRef = useRef<HTMLDivElement>(null)
    const backdropRef = useRef<HTMLDivElement>(null)
    
    // Prevent body scroll when modal is open
    useEffect(() => {
      if (!preventScroll) return
      
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
      
      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [open, preventScroll])
    
    // Handle escape key
    useEffect(() => {
      if (!closeOnEscape || !open) return
      
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose?.()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, closeOnEscape, onClose])
    
    // Focus management
    useEffect(() => {
      if (open && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        if (firstElement) {
          firstElement.focus()
        }
      }
    }, [open])
    
    const handleBackdropClick = (event: React.MouseEvent) => {
      if (!closeOnBackdrop || loading) return
      if (event.target === backdropRef.current) {
        onClose?.()
      }
    }
    
    const handleClose = () => {
      if (loading) return
      onClose?.()
    }
    
    if (!open) return null
    
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-[95vw] max-h-[95vh]'
    }
    
    const variantClasses = {
      default: [
        'bg-card border-border text-card-foreground',
        'shadow-xl'
      ],
      phoenix: [
        'bg-gradient-to-br from-phoenix-red/5 via-card to-phoenix-orange/5',
        'border-phoenix-red/20 text-card-foreground',
        'shadow-phoenix-xl'
      ],
      warm: [
        'bg-gradient-to-br from-phoenix-orange/5 via-card to-phoenix-yellow/5',
        'border-phoenix-orange/20 text-card-foreground',
        'shadow-phoenix-warm shadow-phoenix-xl'
      ],
      sunset: [
        'bg-gradient-to-br from-phoenix-sunset/5 via-card to-phoenix-gold/5',
        'border-phoenix-sunset/20 text-card-foreground',
        'shadow-phoenix-gold shadow-phoenix-xl'
      ],
      destructive: [
        'bg-gradient-to-br from-phoenix-crimson/5 via-card to-phoenix-red/5',
        'border-phoenix-crimson/20 text-card-foreground',
        'shadow-phoenix-xl'
      ]
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          ref={backdropRef}
          className={cn(
            'fixed inset-0 bg-black/50 backdrop-blur-sm',
            'animate-in fade-in',
            backdropClassName
          )}
          style={{
            animationDuration: `${animationDuration}ms`
          }}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div
          ref={ref || modalRef}
          className={cn(
            'relative w-full border rounded-xl',
            'animate-in zoom-in-95 fade-in slide-in-from-bottom-4',
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          style={{
            animationDuration: `${animationDuration}ms`
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
              <LoadingSpinner />
            </div>
          )}
          
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex-1">
                {title && (
                  <h2 
                    id="modal-title" 
                    className="text-xl font-semibold text-card-foreground mb-1"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p 
                    id="modal-description" 
                    className="text-muted-foreground text-sm"
                  >
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  type="button"
                  className={cn(
                    'ml-4 p-2 rounded-lg text-muted-foreground',
                    'hover:text-card-foreground hover:bg-muted',
                    'focus:outline-none focus:ring-2 focus:ring-phoenix-red focus:ring-offset-2',
                    'transition-colors duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  onClick={handleClose}
                  disabled={loading}
                  aria-label="Cerrar modal"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          {children && (
            <div className={cn(
              'px-6',
              !(title || description || showCloseButton) && 'pt-6',
              !footer && 'pb-6'
            )}>
              {children}
            </div>
          )}
          
          {/* Footer */}
          {footer && (
            <div className={cn(
              'flex items-center justify-end gap-3 px-6 py-4',
              'border-t border-border',
              variant !== 'default' && 'border-phoenix-red/10'
            )}>
              {footer}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export { Modal } 