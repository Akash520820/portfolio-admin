import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyValueFor = (field) => {
  if (field.default !== undefined) return field.default;
  if (field.type === 'list' || field.type === 'commalist') return '';
  if (field.type === 'select') return field.options[0];
  return '';
};

const buildEmptyForm = (fields) => {
  const form = {};
  fields.forEach((f) => {
    form[f.name] = emptyValueFor(f);
  });
  return form;
};

// Converts a saved item's field values into editable form strings
// (arrays -> newline or comma joined text for the inputs).
const itemToForm = (item, fields) => {
  const form = {};
  fields.forEach((f) => {
    const val = item[f.name];
    if (f.type === 'list') {
      form[f.name] = Array.isArray(val) ? val.join('\n') : '';
    } else if (f.type === 'commalist') {
      form[f.name] = Array.isArray(val) ? val.join(', ') : '';
    } else if (f.type === 'date') {
      form[f.name] = val ? new Date(val).toISOString().slice(0, 10) : '';
    } else {
      form[f.name] = val ?? emptyValueFor(f);
    }
  });
  return form;
};

// Converts form strings back into the shape the API expects.
const formToPayload = (form, fields) => {
  const payload = {};
  fields.forEach((f) => {
    const val = form[f.name];
    if (f.type === 'list') {
      payload[f.name] = val.split('\n').map((s) => s.trim()).filter(Boolean);
    } else if (f.type === 'commalist') {
      payload[f.name] = val.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (f.type === 'date') {
      if (val) payload[f.name] = val; // omit entirely when blank, avoids Date cast issues
    } else {
      payload[f.name] = val;
    }
  });
  return payload;
};

const AdminResourcePanel = ({ title, endpoint, fields, renderSummary, renderExtraActions }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(buildEmptyForm(fields));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm(itemToForm(item, fields));
    window.scrollTo({ top: document.getElementById(`admin-${endpoint}`)?.offsetTop - 90, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(buildEmptyForm(fields));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = formToPayload(form, fields);
    try {
      if (editingId) {
        const { data } = await api.put(`${endpoint}/${editingId}`, payload);
        setItems((prev) => prev.map((it) => (it._id === data._id ? data : it)));
      } else {
        const { data } = await api.post(endpoint, payload);
        setItems((prev) => [data, ...prev]);
      }
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Lets a sibling action (e.g. "publish as project") drop an item out of
  // this list once it's been handled server-side, without a full refetch.
  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it._id !== id));
    if (editingId === id) cancelEdit();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      setItems((prev) => prev.filter((it) => it._id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div id={`admin-${endpoint}`} className="admin-panel">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <h3 className="admin-form__title">{editingId ? `Edit ${title}` : `Add ${title}`}</h3>
        {error && <div className="auth-card__error">{error}</div>}
        <div className="admin-form__grid">
          {fields.map((f) => (
            <div
              className={`contact__field ${f.wide ? 'admin-form__field--wide' : ''}`}
              key={f.name}
            >
              <label htmlFor={`${endpoint}-${f.name}`}>{f.label}</label>
              {f.type === 'textarea' || f.type === 'list' ? (
                <textarea
                  id={`${endpoint}-${f.name}`}
                  rows={f.type === 'list' ? 4 : 3}
                  value={form[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              ) : f.type === 'select' ? (
                <select
                  id={`${endpoint}-${f.name}`}
                  value={form[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                >
                  {f.options.map((opt) => (
                    <option value={opt} key={opt}>
                      {f.optionLabels?.[opt] || opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`${endpoint}-${f.name}`}
                  type={f.type === 'date' ? 'date' : 'text'}
                  value={form[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}
              {f.hint && <span className="admin-form__hint">{f.hint}</span>}
            </div>
          ))}
        </div>
        <div className="admin-form__actions">
          <button type="submit" className="btn-glow" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : `Add ${title}`}
          </button>
          {editingId && (
            <button type="button" className="btn-outline-glow" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {loading ? (
          <p className="admin-list__empty">Loading…</p>
        ) : items.length === 0 ? (
          <p className="admin-list__empty">Nothing here yet — add your first entry above.</p>
        ) : (
          items.map((item) => (
            <div className="card admin-list__item" key={item._id}>
              <div className="admin-list__item-body">{renderSummary(item)}</div>
              <div className="admin-list__item-actions">
                {renderExtraActions && renderExtraActions(item, { removeItem })}
                <button type="button" className="btn-outline-glow admin-list__btn" onClick={() => startEdit(item)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-list__btn admin-list__btn--danger"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminResourcePanel;
