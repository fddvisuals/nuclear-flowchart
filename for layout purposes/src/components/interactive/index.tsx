import { InteractiveComponentProps, ProjectConfig } from '../../types/template';
import { DefaultInteractive } from './BaseInteractive';
import { MapInteractive } from './MapInteractive';
import { ChartInteractive } from './ChartInteractive';

// Import your existing interactive component
import { InteractiveContainer as LegacyInteractiveContainer } from './InteractiveContainer';

interface InteractiveFactoryProps extends InteractiveComponentProps {
  type?: ProjectConfig['interactive']['type'];
  config?: ProjectConfig['interactive'];
}

export function InteractiveFactory({
  type = 'custom',
  config,
  ...props
}: InteractiveFactoryProps) {
  const componentProps = {
    ...props,
    height: config?.height || props.height,
    backgroundColor: config?.backgroundColor || props.backgroundColor,
    dataSource: config?.dataSource || props.dataSource
  };

  switch (type) {
    case 'map':
      return <MapInteractive {...componentProps} />;
    
    case 'chart':
      return <ChartInteractive {...componentProps} />;
    
    case 'custom':
      // Use the existing InteractiveContainer for backward compatibility
      return <LegacyInteractiveContainer {...componentProps} />;
    
    default:
      return <DefaultInteractive {...componentProps} />;
  }
}

// Export individual components for direct use
export { BaseInteractive, DefaultInteractive } from './BaseInteractive';
export { MapInteractive } from './MapInteractive';
export { ChartInteractive } from './ChartInteractive';
