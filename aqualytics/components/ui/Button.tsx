import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant based on Phoenix theme
   */
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'destructive' | 'warm' | 'sunset' | 'ember' | 'rose' | 'phoenix'
  
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  
  /**
   * Loading state
   */
  loading?: boolean
  
  /**
   * Icon to display before text
   */
  startIcon?: React.ReactNode
  
  /**
   * Icon to display after text
   */
  endIcon?: React.ReactNode
  
  /**
   * Full width button
   */
  fullWidth?: boolean
  
  /**
   * Disable hover effects
   */
  disableHover?: boolean
}

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
 * Phoenix-themed Button component with advanced hover effects and multiple variants.
 * 
 * @param variant - Button style variant
 * @param size - Button size
 * @param loading - Loading state
 * @param startIcon - Icon before text
 * @param endIcon - Icon after text
 * @param fullWidth - Full width button
 * @param disableHover - Disable hover effects
 * @param children - Button content
 * @param className - Additional CSS classes
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    disableHover = false,
    children,
    className,
    disabled,
    ...props
  }, ref) => {
    
    const baseClasses = [
      // Base styles
      'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-phoenix-red',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'relative overflow-hidden',
      
      // Phoenix hover effects (unless disabled)
      !disableHover && !disabled && !loading && [
        'hover:transform hover:scale-105 hover:shadow-phoenix-lg',
        'active:scale-95 active:transition-transform active:duration-75'
      ],
      
      // Full width
      fullWidth && 'w-full',
    ]
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
      xl: 'px-8 py-4 text-xl gap-3'
    }
    
    const variantClasses = {
      primary: [
        'bg-gradient-to-r from-phoenix-red to-phoenix-orange text-white',
        'hover:from-phoenix-red-dark hover:to-phoenix-orange-dark',
        'focus:ring-phoenix-red shadow-phoenix',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:transform before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700'
      ],
      phoenix: [
        'bg-gradient-to-r from-phoenix-red via-phoenix-orange to-phoenix-yellow text-white',
        'hover:from-phoenix-red-dark hover:via-phoenix-orange-dark hover:to-phoenix-yellow-dark',
        'focus:ring-phoenix-red shadow-phoenix-xl',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',
        'before:transform before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500'
      ],
      secondary: [
        'bg-gradient-to-r from-phoenix-orange to-phoenix-yellow text-white',
        'hover:from-phoenix-orange-dark hover:to-phoenix-yellow-dark',
        'focus:ring-phoenix-orange shadow-phoenix-warm'
      ],
      accent: [
        'bg-gradient-to-r from-phoenix-yellow to-phoenix-amber text-white',
        'hover:from-phoenix-yellow-dark hover:to-phoenix-gold',
        'focus:ring-phoenix-yellow shadow-phoenix-gold'
      ],
      warm: [
        'bg-gradient-to-r from-phoenix-sunset to-phoenix-coral text-white',
        'hover:from-phoenix-flame hover:to-phoenix-sunset',
        'focus:ring-phoenix-sunset shadow-phoenix-warm'
      ],
      sunset: [
        'bg-gradient-to-r from-phoenix-amber to-phoenix-gold text-white',
        'hover:from-phoenix-gold hover:to-phoenix-dawn',
        'focus:ring-phoenix-amber shadow-phoenix-gold'
      ],
      ember: [
        'bg-gradient-to-r from-phoenix-ember to-phoenix-coral text-white',
        'hover:from-phoenix-crimson hover:to-phoenix-flame',
        'focus:ring-phoenix-ember shadow-phoenix'
      ],
      rose: [
        'bg-gradient-to-r from-phoenix-rose to-phoenix-coral text-white',
        'hover:from-phoenix-crimson hover:to-phoenix-sunset',
        'focus:ring-phoenix-rose shadow-phoenix'
      ],
      ghost: [
        'bg-transparent text-phoenix-red border border-transparent',
        'hover:bg-phoenix-red/10 hover:border-phoenix-red/20',
        'focus:ring-phoenix-red'
      ],
      outline: [
        'bg-transparent text-phoenix-red border-2 border-phoenix-red',
        'hover:bg-phoenix-red hover:text-white',
        'focus:ring-phoenix-red'
      ],
      destructive: [
        'bg-gradient-to-r from-phoenix-crimson to-phoenix-red text-white',
        'hover:from-phoenix-red-dark hover:to-phoenix-crimson',
        'focus:ring-phoenix-crimson shadow-phoenix'
      ]
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {/* Shimmer effect overlay */}
        {!disableHover && (
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse rounded-xl" />
        )}
        
        {/* Content */}
        <span className="relative flex items-center justify-center gap-2">
          {loading && <LoadingSpinner />}
          {!loading && startIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {startIcon}
            </span>
          )}
          
          {children && (
            <span className={loading ? 'opacity-70' : ''}>
              {children}
            </span>
          )}
          
          {!loading && endIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {endIcon}
            </span>
          )}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 