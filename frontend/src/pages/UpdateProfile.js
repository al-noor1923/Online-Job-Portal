// frontend/src/pages/UpdateProfile.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../services/api';

const EMPTY_EXP = {
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  present: false,
  bullets: ['']
};

const EMPTY_EDU = {
  school: '',
  degree: '',
  startDate: '',
  endDate: '',
  gpa: ''
};

export default function UpdateProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    skills: [],
    expertise: [],
    hobbies: [],
    experience: '',
    education: '',
    experienceEntries: [EMPTY_EXP],
    educationEntries: [EMPTY_EDU],
    resume: ''
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProfile();
        const u = res?.data?.user || {};
        if (!mounted) return;
        setForm({
          name: u.name || '',
          phone: u.phone || '',
          address: u.address || '',
          dateOfBirth: u.dateOfBirth ? u.dateOfBirth.substring(0, 10) : '',
          skills: u.skills || [],
          expertise: u.expertise || [],
          hobbies: u.hobbies || [],
          experience: u.experience || '',
          education: u.education || '',
          experienceEntries:
            u.experienceEntries && u.experienceEntries.length
              ? u.experienceEntries
              : [EMPTY_EXP],
          educationEntries:
            u.educationEntries && u.educationEntries.length
              ? u.educationEntries
              : [EMPTY_EDU],
          resume: u.resume || ''
        });
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const onCSV = (key) => (e) =>
    setField(
      key,
      e.target.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );

  const updateExp = (i, key, val) => {
    const arr = [...form.experienceEntries];
    arr[i] = { ...arr[i], [key]: val };
    setField('experienceEntries', arr);
  };
  const updateExpBullets = (i, text) =>
    updateExp(
      i,
      'bullets',
      text.split('\n').map((s) => s.trim()).filter(Boolean)
    );
  const addExp = () =>
    setField('experienceEntries', [...form.experienceEntries, { ...EMPTY_EXP }]);
  const removeExp = (i) =>
    setField(
      'experienceEntries',
      form.experienceEntries.filter((_, idx) => idx !== i)
    );

  const updateEdu = (i, key, val) => {
    const arr = [...form.educationEntries];
    arr[i] = { ...arr[i], [key]: val };
    setField('educationEntries', arr);
  };
  const addEdu = () =>
    setField('educationEntries', [...form.educationEntries, { ...EMPTY_EDU }]);
  const removeEdu = (i) =>
    setField(
      'educationEntries',
      form.educationEntries.filter((_, idx) => idx !== i)
    );

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        // ensure arrays:
        skills: form.skills || [],
        expertise: form.expertise || [],
        hobbies: form.hobbies || [],
        experienceEntries: form.experienceEntries || [],
        educationEntries: form.educationEntries || []
      };
      const res = await updateProfile(payload);
      if (!res?.success) throw new Error(res?.message || 'Update failed');
      alert('Profile updated!');
    } catch (e2) {
      setError(e2?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'job_seeker') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Update Profile</h1>
        </div>
        <p>This page is only for job seekers.</p>
        <Link to="/" className="back-btn">Go Home</Link>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading profile…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Update Profile</h1>
        <div className="header-actions">
          <Link className="feature-link" to="/cv-builder">Open CV Builder</Link>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <form className="form" onSubmit={submit}>
        <div className="form-group">
          <label>Name</label>
          <input
            className="cv-input"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            className="cv-input"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            className="cv-input"
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            className="cv-input"
            value={form.dateOfBirth}
            onChange={(e) => setField('dateOfBirth', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Skills</label>
          <input
            className="cv-input"
            value={form.skills.join(', ')}
            onChange={onCSV('skills')}
          />
        </div>

        <div className="form-group">
          <label>Expertise</label>
          <input
            className="cv-input"
            value={form.expertise.join(', ')}
            onChange={onCSV('expertise')}
          />
        </div>

        <div className="form-group">
          <label>Hobbies</label>
          <input
            className="cv-input"
            value={form.hobbies.join(', ')}
            onChange={onCSV('hobbies')}
          />
        </div>

        <div className="form-group">
          <label>Experience (summary)</label>
        <textarea
            className="cv-textarea"
            value={form.experience}
            onChange={(e) => setField('experience', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Education (summary)</label>
          <textarea
            className="cv-textarea"
            value={form.education}
            onChange={(e) => setField('education', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Detailed Experience</label>
          {form.experienceEntries.map((x, i) => (
            <div key={i} className="cv-box">
              <input
                className="cv-input"
                placeholder="Company"
                value={x.company || ''}
                onChange={(e) => updateExp(i, 'company', e.target.value)}
              />
              <input
                className="cv-input"
                placeholder="Role"
                value={x.role || ''}
                onChange={(e) => updateExp(i, 'role', e.target.value)}
              />
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
                <input
                  type="date"
                  className="cv-input"
                  value={x.startDate?.substring?.(0, 10) || x.startDate || ''}
                  onChange={(e) => updateExp(i, 'startDate', e.target.value)}
                />
                <input
                  type="date"
                  className="cv-input"
                  value={x.endDate?.substring?.(0, 10) || x.endDate || ''}
                  disabled={x.present}
                  onChange={(e) => updateExp(i, 'endDate', e.target.value)}
                />
              </div>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={!!x.present}
                  onChange={(e) => updateExp(i, 'present', e.target.checked)}
                />
                Currently Working
              </label>
              <textarea
                className="cv-textarea"
                placeholder="Bullets (one per line)"
                value={(x.bullets || []).join('\n')}
                onChange={(e) => updateExpBullets(i, e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="delete-btn"
                  type="button"
                  onClick={() => removeExp(i)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addExp}>
            + Add Experience
          </button>
        </div>

        <div className="form-group">
          <label>Education History</label>
          {form.educationEntries.map((ed, i) => (
            <div key={i} className="cv-box">
              <input
                className="cv-input"
                placeholder="School / University"
                value={ed.school || ''}
                onChange={(e) => updateEdu(i, 'school', e.target.value)}
              />
              <input
                className="cv-input"
                placeholder="Degree"
                value={ed.degree || ''}
                onChange={(e) => updateEdu(i, 'degree', e.target.value)}
              />
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
                <input
                  type="date"
                  className="cv-input"
                  value={ed.startDate?.substring?.(0, 10) || ed.startDate || ''}
                  onChange={(e) => updateEdu(i, 'startDate', e.target.value)}
                />
                <input
                  type="date"
                  className="cv-input"
                  value={ed.endDate?.substring?.(0, 10) || ed.endDate || ''}
                  onChange={(e) => updateEdu(i, 'endDate', e.target.value)}
                />
              </div>
              <input
                className="cv-input"
                placeholder="GPA (optional)"
                value={ed.gpa || ''}
                onChange={(e) => updateEdu(i, 'gpa', e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="delete-btn"
                  type="button"
                  onClick={() => removeEdu(i)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addEdu}>
            + Add Education
          </button>
        </div>

        <div className="form-group">
          <label>Resume URL (optional)</label>
          <input
            className="cv-input"
            value={form.resume}
            onChange={(e) => setField('resume', e.target.value)}
          />
        </div>

        <div>
          <button className="submit-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          <Link to="/" className="back-btn" style={{ marginLeft: 12 }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
