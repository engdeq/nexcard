import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Alert, Button, Card, Input, PageHeader } from '../components/ui';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'password', label: 'Password' },
  { id: 'appearance', label: 'Appearance' },
];

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);
    try {
      const res = await api.updateProfile({ name, email });
      setUser(res.user);
      setProfileMsg({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (newPassword.length < 8) {
      setPasswordMsg({
        type: 'error',
        text: 'New password must be at least 8 characters',
      });
      return;
    }
    setSavingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMsg({ type: 'success', text: 'Password updated' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your account details, password, and appearance."
      />

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-primary text-white'
                : 'text-muted hover:bg-bg hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-xl space-y-4">
        {tab === 'profile' && (
          <Card>
            <h3 className="mb-3 font-display text-sm font-bold text-text">
              Account profile
            </h3>
            <form onSubmit={saveProfile} className="space-y-3">
              {profileMsg.text && (
                <Alert type={profileMsg.type === 'success' ? 'success' : 'error'}>
                  {profileMsg.text}
                </Alert>
              )}
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={savingProfile} size="sm">
                Save changes
              </Button>
            </form>
          </Card>
        )}

        {tab === 'password' && (
          <Card>
            <h3 className="mb-3 font-display text-sm font-bold text-text">
              Change password
            </h3>
            <form onSubmit={savePassword} className="space-y-3">
              {passwordMsg.text && (
                <Alert
                  type={passwordMsg.type === 'success' ? 'success' : 'error'}
                >
                  {passwordMsg.text}
                </Alert>
              )}
              <Input
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <Button type="submit" loading={savingPassword} size="sm">
                Update password
              </Button>
            </form>
          </Card>
        )}

        {tab === 'appearance' && (
          <Card>
            <h3 className="mb-3 font-display text-sm font-bold text-text">
              Appearance
            </h3>
            <p className="mb-3 text-sm text-muted">
              Theme preference is saved on this device.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={theme === 'light' ? 'primary' : 'secondary'}
                onClick={() => setTheme('light')}
              >
                <Sun size={14} />
                Light
              </Button>
              <Button
                size="sm"
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                onClick={() => setTheme('dark')}
              >
                <Moon size={14} />
                Dark
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <h3 className="mb-2 font-display text-sm font-bold text-text">
            Session
          </h3>
          <p className="mb-3 text-sm text-muted">
            Sign out of NexaCard on this device.
          </p>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}
