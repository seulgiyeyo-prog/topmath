import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string;
  tex?: string;
  display?: boolean;
  inline?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  tex,
  display = false,
  inline = false,
  className = '',
}) => {
  const formula = math ?? tex ?? '';
  const displayMode = display && !inline;

  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return formula;
    }
  }, [formula, displayMode]);

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
