import { useEffect, useState } from 'react';
import { Copy, Trash2, Plus, FolderOpen } from 'lucide-react';
import { deleteProject, duplicateProject, listProjects, type ProjectMeta } from '../lib/project';
import { href, navigate } from '../lib/router';
import { FORMATS, type FormatId } from '../templates/catalog';

function ago(ts: number) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(ts).toLocaleDateString();
}

export function ProjectsPage() {
  const [list, setList] = useState<ProjectMeta[] | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const refresh = () => listProjects().then(setList);
  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="container">
      <div className="section-head" style={{ marginTop: 48 }}>
        <div>
          <h2 style={{ fontSize: 36 }}>My projects</h2>
          <p>Saved automatically in this browser.</p>
        </div>
        <a className="btn btn-primary" href={href('/templates')}>
          <Plus /> New from template
        </a>
      </div>
      {list === null ? null : list.length === 0 ? (
        <div className="empty" style={{ border: '1.5px dashed var(--line-2)', borderRadius: 22 }}>
          <FolderOpen size={36} color="var(--blue)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', color: 'var(--ink)' }}>No projects yet</h3>
          <p style={{ margin: '0 0 18px' }}>Pick a template and hit Customize. Your work saves here as you go.</p>
          <a className="btn btn-primary" href={href('/templates')}>
            Browse templates
          </a>
        </div>
      ) : (
        <div className="proj-grid">
          {list.map((p) => (
            <div key={p.id} className="proj">
              <a className="proj-thumb" href={href(`/editor/${p.id}`)}>
                {p.thumb ? <img src={p.thumb} alt="" /> : <span className="muted">No preview</span>}
              </a>
              <div className="proj-meta">
                <div style={{ minWidth: 0 }}>
                  <b>{p.name}</b>
                  <span>
                    {FORMATS[p.format as FormatId]?.label ?? p.format} · {ago(p.updatedAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    className="btn btn-icon btn-sm btn-ghost"
                    title="Duplicate"
                    aria-label="Duplicate"
                    onClick={async () => {
                      const c = await duplicateProject(p.id);
                      if (c) navigate(`/editor/${c.id}`);
                    }}
                  >
                    <Copy />
                  </button>
                  {confirming === p.id ? (
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--danger)', color: '#fff' }}
                      onClick={async () => {
                        await deleteProject(p.id);
                        setConfirming(null);
                        void refresh();
                      }}
                      onBlur={() => setConfirming(null)}
                      autoFocus
                    >
                      Delete
                    </button>
                  ) : (
                    <button className="btn btn-icon btn-sm btn-ghost" title="Delete" aria-label={`Delete ${p.name}`} onClick={() => setConfirming(p.id)}>
                      <Trash2 />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
