import { useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { getIconBody } from '../lib/svg';
import type { SvgFile } from '../lib/types';

type Props = {
  file: SvgFile;
  size?: number | string;
  className?: string;
  title?: string;
};

export function SvgIcon({ file, size = 24, className, title }: Props) {
  const { theme } = useTheme();
  const body = useMemo(() => getIconBody(file, theme), [file, theme]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
