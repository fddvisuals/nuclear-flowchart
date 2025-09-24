import React from 'react';
import { InteractiveComponentProps } from '../../types/template';

interface BaseInteractiveProps extends InteractiveComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export function BaseInteractive({
  height = "100vh",
  width = "100%",
  backgroundColor = "transparent",
  children,
  className = "",
  ...props
}: BaseInteractiveProps) {
  const containerStyle: React.CSSProperties = {
    height,
    width,
    backgroundColor,
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div 
      className={`interactive-container ${className}`}
      style={containerStyle}
      {...props}
    >
      {children}
    </div>
  );
}

// Default empty interactive component
export function DefaultInteractive(props: InteractiveComponentProps) {
  return (
    <BaseInteractive {...props} className="default-interactive">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontSize: '1.5rem',
        color: '#666',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h3>Interactive Component Placeholder</h3>
          <p>Replace this with your custom interactive content</p>
        </div>
      </div>
    </BaseInteractive>
  );
}
