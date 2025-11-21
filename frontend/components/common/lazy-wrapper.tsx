'use client';

import { Suspense, ReactNode } from 'react';
import { Loading } from './loading';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <Loading text="Loading..." />}>
      {children}
    </Suspense>
  );
}

