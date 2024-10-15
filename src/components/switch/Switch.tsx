'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from 'src/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    labelOn?: string;
    labelOff?: string;
    children?: React.ReactNode;
  }
>(({ className, labelOn, labelOff, children, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      `peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-left rounded-full 
      border-2 border-transparent transition-colors focus-visible:outline-none 
      focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 
      focus-visible:ring-offset-background disabled:cursor-not-allowed 
      disabled:opacity-50 data-[state=checked]:bg-input data-[state=unchecked]:bg-input`,
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        `pointer-events-none flex items-center justify-center h-3 w-3 rounded-full 
     bg-background shadow-lg ring-0 transition-transform 
     data-[state=unchecked]:translate-x-0
     data-[state=checked]:translate-x-14`
      )}
    >
      <span
        className={`flex items-right justify-right text-xs font-semibold 
        text-primary`}
      >
        {props.checked ? labelOn : labelOff}
      </span>
    </SwitchPrimitives.Thumb>
    {children && (
      <span className="ml-2 text-sm text-foreground">{children}</span>
    )}
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
