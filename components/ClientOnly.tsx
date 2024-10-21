import React, { useEffect, useState, ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode;
  className?: string;
}

export default function ClientOnly({ children, className }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}