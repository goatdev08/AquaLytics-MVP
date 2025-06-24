import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant based on Phoenix theme
   */
  variant?: 'default' | 'phoenix' | 'warm' | 'sunset' | 'ember' | 'rose' | 'outlined' | 'ghost'
  
  /**
   * Card size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  
  /**
   * Enable hover effects
   */
  hover?: boolean
  
  /**
   * Enable press effects
   */
  pressable?: boolean
  
  /**
   * Disable default padding
   */
  noPadding?: boolean
  
  /**
   * Enable loading state
   */
  loading?: boolean
  
  /**
   * Card header content
   */
  header?: React.ReactNode
  
  /**
   * Card footer content
   */
  footer?: React.ReactNode
  
  /**
   * Card title
   */
  title?: string
  
  /**
   * Card description
   */
  description?: string
  
  /**
   * Card image
   */
  image?: string
  
  /**
   * Card actions
   */
  actions?: React.ReactNode
}

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
    <svg
      className="animate-spin h-8 w-8 text-phoenix-orange"
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
  </div>
)

/**
 * Phoenix-themed Card component with subtle gradients and hover effects.
 * 
 * @param variant - Card style variant
 * @param size - Card size
 * @param hover - Enable hover effects
 * @param pressable - Enable press effects
 * @param noPadding - Disable default padding
 * @param loading - Enable loading state
 * @param header - Card header content
 * @param footer - Card footer content
 * @param title - Card title
 * @param description - Card description
 * @param image - Card image
 * @param actions - Card actions
 * @param children - Card content
 * @param className - Additional CSS classes
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    size = 'md',
    hover = false,
    pressable = false,
    noPadding = false,
    loading = false,
    header,
    footer,
    title,
    description,
    image,
    actions,
    children,
    className,
    onClick,
    ...props
  }, ref) => {
    
    const baseClasses = [
      'relative rounded-xl border transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-phoenix-red',
      
      // Interactive states
      (hover || pressable || onClick) && [
        'cursor-pointer',
        'hover:shadow-phoenix-lg hover:border-phoenix-red/20',
        hover && 'hover:transform hover:scale-[1.02] hover:-translate-y-1',
        pressable && 'active:scale-[0.98] active:translate-y-0'
      ],
      
      // Loading state
      loading && 'pointer-events-none'
    ]
    
    const sizeClasses = {
      sm: noPadding ? '' : 'p-4',
      md: noPadding ? '' : 'p-6',
      lg: noPadding ? '' : 'p-8',
      xl: noPadding ? '' : 'p-10'
    }
    
    const variantClasses = {
      default: [
        'bg-card border-border text-card-foreground',
        'shadow-sm'
      ],
      phoenix: [
        'bg-gradient-to-br from-phoenix-red/5 via-card to-phoenix-orange/5',
        'border-phoenix-red/20 text-card-foreground',
        'shadow-phoenix'
      ],
      warm: [
        'bg-gradient-to-br from-phoenix-orange/5 via-card to-phoenix-yellow/5',
        'border-phoenix-orange/20 text-card-foreground',
        'shadow-phoenix-warm'
      ],
      sunset: [
        'bg-gradient-to-br from-phoenix-sunset/5 via-card to-phoenix-gold/5',
        'border-phoenix-sunset/20 text-card-foreground',
        'shadow-phoenix-gold'
      ],
      ember: [
        'bg-gradient-to-br from-phoenix-ember/5 via-card to-phoenix-coral/5',
        'border-phoenix-ember/20 text-card-foreground',
        'shadow-phoenix'
      ],
      rose: [
        'bg-gradient-to-br from-phoenix-rose/5 via-card to-phoenix-coral/5',
        'border-phoenix-rose/20 text-card-foreground',
        'shadow-phoenix'
      ],
      outlined: [
        'bg-transparent border-2 border-phoenix-red/30 text-card-foreground',
        'hover:bg-phoenix-red/5'
      ],
      ghost: [
        'bg-transparent border-transparent text-card-foreground',
        'hover:bg-phoenix-red/5 hover:border-phoenix-red/10'
      ]
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (loading) return
      onClick?.(event)
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-busy={loading}
        {...props}
      >
        {/* Loading Overlay */}
        {loading && <LoadingOverlay />}
        
        {/* Hover Shimmer Effect */}
        {(hover || onClick) && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-phoenix-red/10 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000 rounded-xl" />
          </div>
        )}
        
        {/* Image */}
        {image && (
          <div className={cn(
            'relative overflow-hidden',
            noPadding ? 'rounded-t-xl' : '-m-6 mb-6 rounded-xl'
          )}>
            <img
              src={image}
              alt=""
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
        
        {/* Header */}
        {header && (
          <div className={cn(
            'border-b border-border pb-4 mb-4',
            variant !== 'default' && 'border-phoenix-red/10'
          )}>
            {header}
          </div>
        )}
        
        {/* Title & Description */}
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        
        {/* Content */}
        {children && (
          <div className="relative z-10">
            {children}
          </div>
        )}
        
        {/* Actions */}
        {actions && (
          <div className={cn(
            'flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border',
            variant !== 'default' && 'border-phoenix-red/10'
          )}>
            {actions}
          </div>
        )}
        
        {/* Footer */}
        {footer && (
          <div className={cn(
            'border-t border-border pt-4 mt-4',
            variant !== 'default' && 'border-phoenix-red/10'
          )}>
            {footer}
          </div>
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card } 