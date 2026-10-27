import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { Button, Card, EmptyState, PageHeader } from '../components/ui';

export default function Analytics() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Scan and profile insights will appear here when tracking is available."
      />
      <Card>
        <EmptyState
          icon={BarChart3}
          title="Analytics not available yet"
          description="Profile views and scan tracking are not implemented in the current backend. This page stays empty rather than showing fabricated numbers."
          action={
            <Link to="/app">
              <Button size="sm" variant="secondary">
                Back to Dashboard
              </Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}
