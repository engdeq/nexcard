import { Link } from 'react-router-dom';
import { LayoutTemplate } from 'lucide-react';
import { Button, Card, EmptyState, PageHeader } from '../components/ui';

export default function Templates() {
  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle="Reusable QR and profile templates will appear here."
      />
      <Card>
        <EmptyState
          icon={LayoutTemplate}
          title="Templates coming soon"
          description="This section is reserved for branded QR and digital card templates. No fake templates are shown."
          action={
            <Link to="/app/create">
              <Button size="sm">Create a QR Code instead</Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}
