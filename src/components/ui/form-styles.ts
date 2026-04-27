import { cn } from '@/lib/utils';

type FieldSize = 'sm' | 'md' | 'lg';

const fieldSizeMap: Record<FieldSize, string> = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-11 text-base',
};

export const formControlResetClass =
  'outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0';

export const formPrimitiveFieldBaseClass = cn(
  'w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow]',
  'placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
);

export const formPrimitiveSelectTriggerBaseClass = cn(
  formPrimitiveFieldBaseClass,
  'data-[placeholder]:text-muted-foreground',
  '[&_svg:not([class*=text-])]:text-muted-foreground',
  'flex items-center justify-between gap-2',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4'
);

export const formPrimitiveSelectContentBaseClass = cn(
  'relative z-[9999] max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-x-hidden overflow-y-auto',
  'rounded-md border bg-popover text-popover-foreground shadow-md',
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
);

export const formPrimitiveSelectItemBaseClass = cn(
  'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none',
  'focus:bg-accent focus:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
);

export function getFormFieldClass(isDark: boolean, size: FieldSize = 'md') {
  return cn(
    formControlResetClass,
    fieldSizeMap[size],
    'rounded-2xl border',
    isDark
      ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/40'
      : 'bg-white border-gray-200 text-[#111113] placeholder:text-[#8e8e93]'
  );
}

export function getFormDateFieldClass(isDark: boolean, size: FieldSize = 'md') {
  return cn(getFormFieldClass(isDark, size), isDark ? '[color-scheme:dark]' : '');
}

export function getFormSelectTriggerClass(isDark: boolean, size: FieldSize = 'md') {
  return cn(
    getFormFieldClass(isDark, size),
    '[&_[data-placeholder]]:text-[#8e8e93] dark:[&_[data-placeholder]]:text-white/40',
    '[&_svg]:text-gray-500 dark:[&_svg]:text-white/70'
  );
}

export function getFormSelectContentClass(isDark: boolean, zClass = '') {
  return cn(
    'rounded-2xl border shadow-xl',
    isDark ? 'bg-[#1e1e20] border-white/10 text-white' : 'bg-white border-gray-200 text-[#111113]',
    zClass
  );
}

export function getFormSelectItemClass(isDark: boolean, compact = false) {
  return cn(
    compact ? 'text-xs sm:text-sm' : 'text-sm',
    'rounded-xl mx-1 my-0.5 cursor-pointer',
    isDark
      ? 'text-white data-[highlighted]:bg-[#FEC004]/20 data-[highlighted]:text-white data-[state=checked]:bg-[#FEC004]/15'
      : 'text-[#111113] data-[highlighted]:bg-[#FEC004]/12 data-[highlighted]:text-[#111113] data-[state=checked]:bg-[#FEC004]/10'
  );
}
