import { useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { getIconBody, getViewBox } from '../lib/svg';
import type { SvgFile, Theme } from '../lib/types';
import { Spinner } from './Spinner';

type Props = {
  file: SvgFile;
  size?: number | string;
  className?: string;
  title?: string;
  forceTheme?: Theme;
};

export function SvgIcon({ file, size = 24, className, title, forceTheme }: Props) {
  const { theme: siteTheme } = useTheme();
  const theme = forceTheme ?? siteTheme;
  const body = useMemo(() => getIconBody(file, theme), [file, theme]);
  const viewBox = useMemo(() => getViewBox(file), [file]);

  if (!body) {
    return <Spinner size={typeof size === 'number' ? size : 24} className={className} />;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: 'block', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
