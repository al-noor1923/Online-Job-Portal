import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCV, getMyCVs, updateCV } from '../services/api';

const defaultCV = (user) => ({
  title: 'My CV',
  template: 'classic',
  isDefault: true,
  data: {
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    summary: 'Driven software engineer with a passion for building reliable, user-friendly systems.',
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    links: [{ label: 'GitHub', url: '' }, { label: 'LinkedIn', url: '' }],
    experience: [
      {
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        present: false,
        bullets: ['']
      }
    ],
    education: [
      {
        school: '',
        degree: '',
        startDate: '',
        endDate: '',
        gpa: ''
      }
    ],
    projects: [
      {
        name: '',
        url: '',
        description: '',
        bullets: [''],
        tech: []
      }
    ]
  }
});

const Input = (p) => (
  <input {...p} className="cv-input" />
);
const Textarea = (p) => (
  <textarea {...p} className="cv-textarea" rows={p.rows || 3} />
);

export default function CVBuilder() {
  const { user } = useAuth();
  const [cv, setCV] = useState(defaultCV(user));
  const [savedId, setSavedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  // load last saved CV if exists
  useEffect(() => {
    (async () => {
      try {
        const res = await getMyCVs();
        const last = res?.data?.[0];
        if (last) {
          setCV({ title: last.title, template: last.template, isDefault: last.isDefault, data: last.data });
          setSavedId(last._id);
        }
      } catch (e) {
        // ignore if none
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (path, value) => {
    setCV((prev) => {
      const next = { ...prev, data: { ...prev.data } };
      const parts = path.split('.');
      let node = next.data;
      for (let i = 0; i < parts.length - 1; i++) {
        node[parts[i]] = Array.isArray(node[parts[i]]) ? [...node[parts[i]]] : { ...(node[parts[i]] || {}) };
        node = node[parts[i]];
      }
      node[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const addItem = (field, template) => {
    setCV((prev) => ({ ...prev, data: { ...prev.data, [field]: [...prev.data[field], template] } }));
  };

  const removeItem = (field, idx) => {
    setCV((prev) => {
      const arr = [...prev.data[field]];
      arr.splice(idx, 1);
      return { ...prev, data: { ...prev.data, [field]: arr } };
    });
  };

  const saveCV = async () => {
    setLoading(true);
    try {
      const payload = { ...cv };
      const res = savedId ? await updateCV(savedId, payload) : await createCV(payload);
      const id = res?.data?._id || savedId;
      setSavedId(id || null);
      alert('CV saved!');
    } catch (e) {
      alert('Failed to save CV');
    } finally {
      setLoading(false);
    }
  };

  const printCV = () => {
    // Print the preview area -> users can "Save as PDF"
    window.print();
  };

  const data = cv.data;

  const prettyDate = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>CV Builder</h1>
        <div className="header-actions">
          <div className="sort-control">
            <label>
              <span>Template</span>
              <select
                value={cv.template}
                onChange={(e) => setCV((p) => ({ ...p, template: e.target.value }))}
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
              </select>
            </label>
          </div>
          <button className="action-btn" onClick={saveCV} disabled={loading}>
            {loading ? 'Saving…' : 'Save CV'}
          </button>
          <button className="feature-link" onClick={printCV}>Download PDF</button>
        </div>
      </div>

      <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <h3>Fill Your Information</h3>
          </div>
          <div className="form">
            <div className="form-group">
              <label>Full Name</label>
              <Input value={data.fullName} onChange={(e) => onChange('fullName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <Input value={data.email} onChange={(e) => onChange('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <Input value={data.phone} onChange={(e) => onChange('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <Input value={data.address} onChange={(e) => onChange('address', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Professional Summary</label>
              <Textarea value={data.summary} onChange={(e) => onChange('summary', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <Input
                value={data.skills.join(', ')}
                onChange={(e) => onChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
            </div>

            <div className="form-group">
              <label>Links</label>
              {data.links.map((lk, i) => (
                <div key={i} style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 2fr auto', marginBottom: 8 }}>
                  <Input placeholder="Label" value={lk.label} onChange={(e) => {
                    const arr = [...data.links]; arr[i] = { ...lk, label: e.target.value }; onChange('links', arr);
                  }} />
                  <Input placeholder="URL" value={lk.url} onChange={(e) => {
                    const arr = [...data.links]; arr[i] = { ...lk, url: e.target.value }; onChange('links', arr);
                  }} />
                  <button className="delete-btn" type="button" onClick={() => removeItem('links', i)}>Remove</button>
                </div>
              ))}
              <button className="add-btn" type="button" onClick={() => addItem('links', { label: '', url: '' })}>
                + Add Link
              </button>
            </div>

            <div className="form-group">
              <label>Experience</label>
              {data.experience.map((x, i) => (
                <div key={i} className="cv-box">
                  <Input placeholder="Company" value={x.company || ''} onChange={(e) => {
                    const arr = [...data.experience]; arr[i] = { ...x, company: e.target.value }; onChange('experience', arr);
                  }} />
                  <Input placeholder="Role" value={x.role || ''} onChange={(e) => {
                    const arr = [...data.experience]; arr[i] = { ...x, role: e.target.value }; onChange('experience', arr);
                  }} />
                  <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
                    <Input type="date" value={x.startDate || ''} onChange={(e) => {
                      const arr = [...data.experience]; arr[i] = { ...x, startDate: e.target.value }; onChange('experience', arr);
                    }} />
                    <Input type="date" value={x.endDate || ''} disabled={x.present} onChange={(e) => {
                      const arr = [...data.experience]; arr[i] = { ...x, endDate: e.target.value }; onChange('experience', arr);
                    }} />
                  </div>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}>
                    <input type="checkbox" checked={!!x.present} onChange={(e) => {
                      const arr = [...data.experience]; arr[i] = { ...x, present: e.target.checked }; onChange('experience', arr);
                    }} />
                    Currently Working
                  </label>
                  <Textarea
                    placeholder="Bullets (one per line)"
                    value={(x.bullets || []).join('\n')}
                    onChange={(e) => {
                      const arr = [...data.experience]; arr[i] = { ...x, bullets: e.target.value.split('\n').filter(Boolean) }; onChange('experience', arr);
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="delete-btn" type="button" onClick={() => removeItem('experience', i)}>Remove</button>
                  </div>
                </div>
              ))}
              <button className="add-btn" type="button" onClick={() => addItem('experience', {
                company: '', role: '', startDate: '', endDate: '', present: false, bullets: ['']
              })}>+ Add Experience</button>
            </div>

            <div className="form-group">
              <label>Education</label>
              {data.education.map((ed, i) => (
                <div key={i} className="cv-box">
                  <Input placeholder="School/University" value={ed.school || ''} onChange={(e) => {
                    const arr = [...data.education]; arr[i] = { ...ed, school: e.target.value }; onChange('education', arr);
                  }} />
                  <Input placeholder="Degree" value={ed.degree || ''} onChange={(e) => {
                    const arr = [...data.education]; arr[i] = { ...ed, degree: e.target.value }; onChange('education', arr);
                  }} />
                  <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
                    <Input type="date" value={ed.startDate || ''} onChange={(e) => {
                      const arr = [...data.education]; arr[i] = { ...ed, startDate: e.target.value }; onChange('education', arr);
                    }} />
                    <Input type="date" value={ed.endDate || ''} onChange={(e) => {
                      const arr = [...data.education]; arr[i] = { ...ed, endDate: e.target.value }; onChange('education', arr);
                    }} />
                  </div>
                  <Input placeholder="GPA (optional)" value={ed.gpa || ''} onChange={(e) => {
                    const arr = [...data.education]; arr[i] = { ...ed, gpa: e.target.value }; onChange('education', arr);
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="delete-btn" type="button" onClick={() => removeItem('education', i)}>Remove</button>
                  </div>
                </div>
              ))}
              <button className="add-btn" type="button" onClick={() => addItem('education', {
                school: '', degree: '', startDate: '', endDate: '', gpa: ''
              })}>+ Add Education</button>
            </div>

            <div className="form-group">
              <label>Projects</label>
              {data.projects.map((pr, i) => (
                <div key={i} className="cv-box">
                  <Input placeholder="Project Name" value={pr.name || ''} onChange={(e) => {
                    const arr = [...data.projects]; arr[i] = { ...pr, name: e.target.value }; onChange('projects', arr);
                  }} />
                  <Input placeholder="URL (optional)" value={pr.url || ''} onChange={(e) => {
                    const arr = [...data.projects]; arr[i] = { ...pr, url: e.target.value }; onChange('projects', arr);
                  }} />
                  <Textarea placeholder="Short description" value={pr.description || ''} onChange={(e) => {
                    const arr = [...data.projects]; arr[i] = { ...pr, description: e.target.value }; onChange('projects', arr);
                  }} />
                  <Textarea
                    placeholder="Bullets (one per line)"
                    value={(pr.bullets || []).join('\n')}
                    onChange={(e) => {
                      const arr = [...data.projects]; arr[i] = { ...pr, bullets: e.target.value.split('\n').filter(Boolean) }; onChange('projects', arr);
                    }}
                  />
                  <Input
                    placeholder="Tech (comma-separated)"
                    value={(pr.tech || []).join(', ')}
                    onChange={(e) => {
                      const arr = [...data.projects]; arr[i] = { ...pr, tech: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }; onChange('projects', arr);
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="delete-btn" type="button" onClick={() => removeItem('projects', i)}>Remove</button>
                  </div>
                </div>
              ))}
              <button className="add-btn" type="button" onClick={() => addItem('projects', {
                name: '', url: '', description: '', bullets: [''], tech: []
              })}>+ Add Project</button>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="card">
          <div className="card-header">
            <h3>Preview</h3>
          </div>
          <div id="cv-print-root" ref={printRef} className={`cv-canvas cv-${cv.template}`}>
            <div className="cv-header">
              <h1>{data.fullName || 'Your Name'}</h1>
              <div className="cv-meta">
                <span>{data.email}</span>
                {data.phone && <span>• {data.phone}</span>}
                {data.address && <span>• {data.address}</span>}
              </div>
              {!!(data.links && data.links.length) && (
                <div className="cv-links">
                  {data.links.filter(l => l.label || l.url).map((l, i) => (
                    <span key={i}>{l.label || 'Link'}: {l.url || ''}</span>
                  ))}
                </div>
              )}
            </div>

            {!!data.summary && (
              <section className="cv-section">
                <h2>Summary</h2>
                <p>{data.summary}</p>
              </section>
            )}

            {!!(data.skills && data.skills.length) && (
              <section className="cv-section">
                <h2>Skills</h2>
                <div className="cv-tags">
                  {data.skills.map((s, i) => <span key={i} className="cv-tag">{s}</span>)}
                </div>
              </section>
            )}

            {!!(data.experience && data.experience.length) && (
              <section className="cv-section">
                <h2>Experience</h2>
                {data.experience.filter(x => x.company || x.role).map((x, i) => (
                  <div key={i} className="cv-item">
                    <div className="cv-item-head">
                      <strong>{x.role || 'Role'}</strong>
                      <span>{x.company || 'Company'}</span>
                      <span className="cv-dates">
                        {prettyDate(x.startDate)} – {x.present ? 'Present' : prettyDate(x.endDate)}
                      </span>
                    </div>
                    {!!(x.bullets && x.bullets.length) && (
                      <ul>
                        {x.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {!!(data.education && data.education.length) && (
              <section className="cv-section">
                <h2>Education</h2>
                {data.education.filter(ed => ed.school || ed.degree).map((ed, i) => (
                  <div key={i} className="cv-item">
                    <div className="cv-item-head">
                      <strong>{ed.degree || 'Degree'}</strong>
                      <span>{ed.school || 'School'}</span>
                      <span className="cv-dates">
                        {prettyDate(ed.startDate)} – {prettyDate(ed.endDate)}
                      </span>
                    </div>
                    {ed.gpa && <p>GPA: {ed.gpa}</p>}
                  </div>
                ))}
              </section>
            )}

            {!!(data.projects && data.projects.length) && (
              <section className="cv-section">
                <h2>Projects</h2>
                {data.projects.filter(p => p.name).map((p, i) => (
                  <div key={i} className="cv-item">
                    <div className="cv-item-head">
                      <strong>{p.name}</strong>
                      {p.url && <a href={p.url} target="_blank" rel="noreferrer">{p.url}</a>}
                    </div>
                    {p.description && <p>{p.description}</p>}
                    {!!(p.bullets && p.bullets.length) && (
                      <ul>
                        {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    )}
                    {!!(p.tech && p.tech.length) && (
                      <div className="cv-tags">
                        {p.tech.map((t, j) => <span key={j} className="cv-tag">{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
