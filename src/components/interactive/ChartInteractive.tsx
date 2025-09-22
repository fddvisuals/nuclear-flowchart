import { InteractiveComponentProps } from '../../types/template';
import { BaseInteractive } from './BaseInteractive';

interface ChartInteractiveProps extends InteractiveComponentProps {
  chartType?: 'line' | 'bar' | 'pie' | 'scatter';
  data?: any[];
}

export function ChartInteractive({
  chartType = 'line',
  data = [],
  ...props
}: ChartInteractiveProps) {
  return (
    <BaseInteractive {...props} className="chart-interactive">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#f0fdf4',
        border: '2px dashed #22c55e',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', color: '#15803d' }}>
          <h3>Chart Component</h3>
          <p>Configure your {chartType} chart here</p>
          <small>Data points: {data.length}</small>
        </div>
      </div>
    </BaseInteractive>
  );
}
