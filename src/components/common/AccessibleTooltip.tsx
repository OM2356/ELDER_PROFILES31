import React, { useRef, useState, useCallback } from 'react';
import { useTooltip } from '../../context/TooltipContext';
import { FeatureKey, FEATURE_EXPLANATIONS } from '../../utils/featureExplanations';
import { useApp } from '../../context/AppContext';
import { HelpCircle, Info } from 'lucide-react';

interface UseLongPressOptions {
  thresholdMs?: number;
  onLongPress: () => void;
  onClick?: () => void;
}

/**
 * Accessible hook for detecting long-press gesture on mobile touch or desktop mouse.
 * Automatically cancels if user scrolls or moves their finger by more than 8 pixels.
 */
export function useLongPress({
  thresholdMs = 500,
  onLongPress,
  onClick,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);
  const startCoordsRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (x: number, y: number) => {
      isLongPressRef.current = false;
      startCoordsRef.current = { x, y };

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, thresholdMs);
    },
    [onLongPress, thresholdMs]
  );

  const clear = useCallback(
    (shouldTriggerClick = false) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startCoordsRef.current = null;

      if (shouldTriggerClick && !isLongPressRef.current && onClick) {
        onClick();
      }
    },
    [onClick]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        start(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [start]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startCoordsRef.current && e.touches.length > 0) {
        const dx = Math.abs(e.touches[0].clientX - startCoordsRef.current.x);
        const dy = Math.abs(e.touches[0].clientY - startCoordsRef.current.y);
        // If user is scrolling, cancel long press
        if (dx > 8 || dy > 8) {
          clear(false);
        }
      }
    },
    [clear]
  );

  const onTouchEnd = useCallback(() => {
    clear(false);
  }, [clear]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Primary mouse button only
      if (e.button === 0) {
        start(e.clientX, e.clientY);
      }
    },
    [start]
  );

  const onMouseUp = useCallback(() => {
    clear(false);
  }, [clear]);

  const onMouseLeave = useCallback(() => {
    clear(false);
  }, [clear]);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.preventDefault();
    }
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onContextMenu,
  };
}

/**
 * Dedicated, accessible Info Button that seniors can easily tap to see/hear what a feature does.
 */
interface FeatureInfoButtonProps {
  featureKey: FeatureKey;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'subtle' | 'contrast' | 'badge';
}

export const FeatureInfoButton: React.FC<FeatureInfoButtonProps> = ({
  featureKey,
  size = 'md',
  className = '',
  variant = 'subtle',
}) => {
  const { showTooltip } = useTooltip();
  const { language, highContrast } = useApp();

  const feature = FEATURE_EXPLANATIONS[featureKey];
  const title = feature ? feature.title[language] || feature.title.en : 'Feature';

  const sizeClasses =
    size === 'sm'
      ? 'min-h-[36px] min-w-[36px] p-1.5'
      : size === 'lg'
      ? 'min-h-[56px] min-w-[56px] p-3'
      : 'min-h-[44px] min-w-[44px] p-2';

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  const label =
    language === 'hi'
      ? `${title} की जानकारी देखें`
      : language === 'mr'
      ? `${title} ची माहिती पहा`
      : `Learn what ${title} does`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        showTooltip(featureKey);
      }}
      className={`inline-flex items-center justify-center rounded-full font-bold transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400 ${sizeClasses} ${
        highContrast
          ? 'bg-amber-400 text-black border-2 border-white hover:bg-amber-300'
          : variant === 'contrast'
          ? 'bg-amber-500 text-white shadow-sm hover:bg-amber-600'
          : variant === 'badge'
          ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
          : 'bg-black/10 hover:bg-black/20 text-slate-700 dark:text-slate-200 hover:text-amber-700'
      } ${className}`}
      aria-label={label}
      title={label}
    >
      <HelpCircle className={iconSize} />
    </button>
  );
};

/**
 * AccessibleFeatureWrapper:
 * Wraps any interactive button or card with long-press support AND displays an optional info button.
 */
interface AccessibleFeatureWrapperProps {
  featureKey: FeatureKey;
  children: React.ReactNode;
  showInfoIcon?: boolean;
  infoPosition?: 'top-right' | 'inline' | 'floating';
  className?: string;
}

export const AccessibleFeatureWrapper: React.FC<AccessibleFeatureWrapperProps> = ({
  featureKey,
  children,
  showInfoIcon = true,
  infoPosition = 'top-right',
  className = '',
}) => {
  const { showTooltip } = useTooltip();

  const longPressHandlers = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip(featureKey),
  });

  return (
    <div className={`relative group ${className}`} {...longPressHandlers}>
      {children}

      {showInfoIcon && (
        <div
          className={
            infoPosition === 'top-right'
              ? 'absolute top-2 right-2 z-10'
              : infoPosition === 'floating'
              ? 'absolute -top-3 -right-3 z-10'
              : 'inline-block ml-2 align-middle'
          }
        >
          <FeatureInfoButton featureKey={featureKey} size="sm" variant="contrast" />
        </div>
      )}
    </div>
  );
};
