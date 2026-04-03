import React, { useState } from 'react';
import { User, Lock, Save, Shield } from 'lucide-react';
import { authAPI } from '../api/client';
import { TopBar } from '../components/layout/Sidebar';
import { Card, Button, Input, Badge, Avatar, useToast } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast('Profile updated!', 'success');
    } catch (err) { toast(err.error || 'Update failed', 'error'); }
    finally { setSavingProfile(false); }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast('Password changed!', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) { toast(err.error || 'Password change failed', 'error'); }
    finally { setSavingPw(false); }
  };

  const rolePerms = {
    admin: ['View dashboard', 'Create/Edit/Delete transactions', 'Manage users', 'Manage categories', 'Broadcast notifications', 'View audit logs'],
    analyst: ['View dashboard', 'Create/Edit transactions', 'View analytics', 'View notifications'],
    viewer: ['View dashboard', 'View own transactions', 'View notifications'],
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <TopBar title="Profile" subtitle="Manage your account settings" />
      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Profile info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <Avatar name={user?.name} size={64} />
              <div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700 }}>{user?.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user?.email}</p>
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                  <Badge variant={user?.role}>{user?.role}</Badge>
                  <Badge variant={user?.status}>{user?.status}</Badge>
                </div>
              </div>
            </div>
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Full Name" type="text" icon={User} value={profileForm.name} onChange={e => setProfileForm({ name: e.target.value })} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
                <input value={user?.email} disabled style={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-muted)', fontSize: '14px', cursor: 'not-allowed' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member Since</label>
                <input value={user?.created_at?.slice(0, 10)} disabled style={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-muted)', fontSize: '14px', cursor: 'not-allowed' }} />
              </div>
              <Button type="submit" icon={Save} loading={savingProfile}>Save Profile</Button>
            </form>
          </Card>

          {/* Change password */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} style={{ color: 'var(--accent)' }} /> Change Password
            </h3>
            <form onSubmit={handlePwSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Current Password" type="password" placeholder="••••••••" value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} error={pwErrors.currentPassword} />
              <Input label="New Password" type="password" placeholder="Min 6 characters" value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} error={pwErrors.newPassword} />
              <Input label="Confirm New Password" type="password" placeholder="Repeat new password" value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} error={pwErrors.confirmPassword} />
              <Button type="submit" icon={Lock} loading={savingPw}>Update Password</Button>
            </form>
          </Card>
        </div>

        {/* Role permissions */}
        <Card>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} style={{ color: 'var(--accent)' }} /> Your Permissions
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>As a <strong style={{ color: 'var(--text-secondary)' }}>{user?.role}</strong>, you can:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(rolePerms[user?.role] || []).map((perm, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-700)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--income)', fontSize: '12px' }}>✓</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{perm}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(0,229,190,0.04)', borderRadius: '10px', border: '1px solid rgba(0,229,190,0.12)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Contact an administrator if you need elevated permissions.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
