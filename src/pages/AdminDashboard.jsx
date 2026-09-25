import { useState } from 'react';
import AdminResourcePanel from '../components/AdminResourcePanel';
import AdminProfilePanel from '../components/AdminProfilePanel';
import AdminMessagesPanel from '../components/AdminMessagesPanel';
import api from '../services/api';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'education', label: 'Education' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'goals', label: 'Future Plans' },
  { key: 'messages', label: 'Messages' },
];

const EDUCATION_FIELDS = [
  { name: 'degree', label: 'Degree / Qualification', placeholder: 'B.Tech, Computer Science & Engineering', required: true, wide: true },
  { name: 'school', label: 'School / Institution', placeholder: 'Your University', required: true },
  { name: 'period', label: 'Period', placeholder: '2022 — 2026', required: true },
  { name: 'detail', label: 'Detail', placeholder: 'CGPA: 8.5 / 10.0', hint: 'e.g. CGPA, marks, or honors.' },
];

const EXPERIENCE_FIELDS = [
  { name: 'role', label: 'Role / Title', placeholder: 'React Developer Intern', required: true },
  { name: 'organization', label: 'Organization', placeholder: 'Company Pvt. Ltd.', required: true },
  { name: 'period', label: 'Period', placeholder: '2025', required: true },
  { name: 'tag', label: 'Tag', placeholder: 'Work', default: 'Work', hint: 'Short label shown as a chip, e.g. "Work" or "Internship".' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'What you did, built, or learned in this role...',
    required: true,
    wide: true,
  },
];

const PROJECT_FIELDS = [
  { name: 'title', label: 'Project Title', placeholder: 'WealthWise', required: true },
  { name: 'tagline', label: 'Tagline', placeholder: 'One-line summary of the project', required: true, wide: true },
  { name: 'url', label: 'Live / Repo URL', placeholder: 'https://…', hint: 'Use this for a single-URL (monolithic) project.' },
  {
    name: 'links',
    label: 'Extra Links',
    type: 'list',
    placeholder: 'Admin Portal: https://…\nSeller Portal: https://…\nUser Portal: https://…',
    hint: 'Optional, one per line as "Label: URL" — for projects split across multiple portals/services. Leave the URL field above blank or use it for a primary/gateway link.',
    wide: true,
  },
  {
    name: 'accentColor',
    label: 'Accent (CSS gradient)',
    placeholder: 'linear-gradient(135deg, #4f7dff, #2fe0c4)',
    default: 'linear-gradient(135deg, #4f7dff, #2fe0c4)',
    hint: 'Optional — controls the color of the project card.',
  },
  {
    name: 'bullets',
    label: 'Highlights',
    type: 'list',
    placeholder: 'One highlight per line',
    hint: 'Each line becomes a bullet point.',
    wide: true,
  },
  {
    name: 'tech',
    label: 'Tech Stack',
    type: 'commalist',
    placeholder: 'React, Node.js, MongoDB',
    hint: 'Comma-separated.',
    wide: true,
  },
];

const CERTIFICATION_FIELDS = [
  { name: 'title', label: 'Certification Title', placeholder: 'Cloud Computing', required: true, wide: true },
  { name: 'issuer', label: 'Issuer', placeholder: 'NPTEL', required: true },
  { name: 'date', label: 'Date', placeholder: '2024', hint: 'e.g. year completed.' },
  { name: 'url', label: 'Credential URL', placeholder: 'https://…', hint: 'Optional — link to the certificate.' },
];

const GOAL_FIELDS = [
  { name: 'title', label: 'Goal', placeholder: 'Ship a mobile app', required: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: ['planned', 'in-progress', 'done'],
    optionLabels: { planned: 'Planned', 'in-progress': 'In Progress', done: 'Done' },
  },
  { name: 'targetDate', label: 'Target Date', type: 'date' },
  { name: 'description', label: 'Notes', type: 'textarea', placeholder: 'Optional details...', wide: true },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState('profile');
  const [shippingId, setShippingId] = useState(null);

  // Promotes a goal from "What's Next" into the live Projects showcase.
  // Only needs the deploy URL up front — tagline/tech/bullets can be
  // fine-tuned afterwards from the Projects tab.
  const handleShipGoal = async (goal, { removeItem }) => {
    const url = window.prompt(
      `Live URL for "${goal.title}"?\n(You can add tech stack, highlights, etc. afterwards in the Projects tab.)`,
      'https://'
    );
    if (!url || !url.trim() || url.trim() === 'https://') return;

    setShippingId(goal._id);
    try {
      await api.post(`/goals/${goal._id}/complete`, { url: url.trim() });
      removeItem(goal._id);
    } catch (err) {
      window.alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to publish project');
    } finally {
      setShippingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__inner">
        <p className="eyebrow">{'{admin}'}</p>
        <h2 className="admin-page__title">Portfolio Dashboard</h2>
        <p className="admin-page__subtitle">
          Manage your work experience, project showcase, and future plans — changes appear on your
          portfolio immediately.
        </p>

        <div className="admin-page__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`admin-page__tab ${tab === t.key ? 'is-active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && <AdminProfilePanel />}

        {tab === 'education' && (
          <AdminResourcePanel
            title="Education"
            endpoint="/education"
            fields={EDUCATION_FIELDS}
            renderSummary={(item) => (
              <>
                <h4>{item.degree}</h4>
                <p className="admin-list__meta">
                  {item.school} · {item.period}
                </p>
                {item.detail && <p className="admin-list__desc">{item.detail}</p>}
              </>
            )}
          />
        )}

        {tab === 'experience' && (
          <AdminResourcePanel
            title="Experience"
            endpoint="/experience"
            fields={EXPERIENCE_FIELDS}
            renderSummary={(item) => (
              <>
                <h4>{item.role}</h4>
                <p className="admin-list__meta">
                  {item.organization} · {item.period}
                </p>
                <p className="admin-list__desc">{item.description}</p>
              </>
            )}
          />
        )}

        {tab === 'projects' && (
          <AdminResourcePanel
            title="Project"
            endpoint="/projects"
            fields={PROJECT_FIELDS}
            renderSummary={(item) => (
              <>
                <h4>{item.title}</h4>
                <p className="admin-list__meta">{item.tagline}</p>
                {item.tech?.length > 0 && (
                  <div className="admin-list__chips">
                    {item.tech.map((t) => (
                      <span className="badge-chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          />
        )}

        {tab === 'certifications' && (
          <AdminResourcePanel
            title="Certification"
            endpoint="/certifications"
            fields={CERTIFICATION_FIELDS}
            renderSummary={(item) => (
              <>
                <h4>{item.title}</h4>
                <p className="admin-list__meta">
                  {item.issuer}
                  {item.date && ` · ${item.date}`}
                </p>
              </>
            )}
          />
        )}

        {tab === 'goals' && (
          <AdminResourcePanel
            title="Goal"
            endpoint="/goals"
            fields={GOAL_FIELDS}
            renderExtraActions={(item, { removeItem }) => (
              <button
                type="button"
                className="btn-glow admin-list__btn"
                disabled={shippingId === item._id}
                onClick={() => handleShipGoal(item, { removeItem })}
                title="Move this goal into your live Projects showcase"
              >
                {shippingId === item._id ? 'Publishing…' : '🚀 Ship it'}
              </button>
            )}
            renderSummary={(item) => (
              <>
                <h4>{item.title}</h4>
                <p className="admin-list__meta">
                  {item.status === 'in-progress' ? 'In Progress' : item.status === 'done' ? 'Done' : 'Planned'}
                  {item.targetDate && ` · Target: ${new Date(item.targetDate).toLocaleDateString()}`}
                </p>
                {item.description && <p className="admin-list__desc">{item.description}</p>}
              </>
            )}
          />
        )}

        {tab === 'messages' && <AdminMessagesPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;