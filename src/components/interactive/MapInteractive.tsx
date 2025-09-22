import { InteractiveComponentProps } from '../../types/template';
import { BaseInteractive } from './BaseInteractive';

interface MapInteractiveProps extends InteractiveComponentProps {
  mapboxToken?: string;
  initialZoom?: number;
  initialCenter?: [number, number];
}

export function MapInteractive({
  mapboxToken,
  initialZoom = 5,
  initialCenter = [0, 0],
  ...props
}: MapInteractiveProps) {
  return (
    <BaseInteractive {...props} className="map-interactive">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#f0f9ff',
        border: '2px dashed #3b82f6',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', color: '#1e40af' }}>
          <h3>Map Component</h3>
          <p>Configure your map visualization here</p>
          <small>Zoom: {initialZoom}, Center: [{initialCenter.join(', ')}]</small>
        </div>
      </div>
    </BaseInteractive>
  );
}
