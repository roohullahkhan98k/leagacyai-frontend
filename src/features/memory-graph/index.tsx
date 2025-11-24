import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Network, RefreshCw, Search, Upload, Plus, X, Maximize2 } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import type { GraphResponse } from '../../services/memoryGraphApi';
import { createMemory, deleteMemory, getGraph, searchMemories, uploadMedia, updateMemory } from '../../services/memoryGraphApi';
import DraggablePanel from '../../components/ui/DraggablePanel';
import FloatingPanel from '../../components/ui/FloatingPanel';
import VideoPlayer from '../../components/ui/VideoPlayer';
import ProfessionalMemoryGraph from '../../components/multimedia/ProfessionalMemoryGraph';
import { toast } from 'react-toastify';

const MemoryGraphPage = () => {
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [query, setQuery] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [searchResults, setSearchResults] = useState<{ id?: string; doc: string; meta: Record<string, unknown> }[]>([]);
  const [creating, setCreating] = useState(false);
  const [newMemory, setNewMemory] = useState({ document: '', person: '', event: '', tags: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  // removed old tagging state in favor of modal flows
  // removed older edit state in favor of activeMemory modal
  // bulk delete input removed
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeMemory, setActiveMemory] = useState<{ id: string; document: string; person: string; event: string; tags: string; media: string }>({ id: '', document: '', person: '', event: '', tags: '', media: '' });
  const [lastSearch, setLastSearch] = useState<{ q: string; n?: number; person?: string; event?: string; tag?: string } | null>(null);
  const [availableMemories, setAvailableMemories] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const isGraphEmpty = !graph || (Array.isArray(graph.nodes) && graph.nodes.length === 0);
  const [isFloating, setIsFloating] = useState(false);
  // Backend media base for serving static uploads (e.g., http://localhost:3000)
  const backendBase = (import.meta as any).env?.VITE_BACKEND_URL;
  const toMediaUrl = (p: string) => {
    if (!p) return p;
    if (/^https?:/i.test(p)) return p;
    return backendBase ? `${backendBase}${p}` : p;
  };
  const isImagePath = (u: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(u);

  useEffect(() => {
    loadAvailableMemories();
  }, []);

  async function loadAvailableMemories() {
    try {
      const g = await getGraph('memory', 200);
      const list = (g.nodes || [])
        .filter((n: any) => n.type === 'memory')
        .map((n: any) => ({ id: n.id, label: n.label }));
      setAvailableMemories(list);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setAvailableMemories([]);
    }
  }

  async function loadGraph() {
    try {
      setLoadingGraph(true);
      if (selectedMemoryId) {
        await focusGraphForMemory(selectedMemoryId);
      } else {
        // Only refresh the memory list; do not render full graph until a memory is selected
        await loadAvailableMemories();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // Keep the last rendered graph; show nothing new on error
    } finally {
      setLoadingGraph(false);
    }
  }


  function parseArrayFromUnknown(value: unknown): string[] {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed as string[];
      } catch {}
    }
    return [];
  }

  function filterGraphForMemory(g: GraphResponse, memoryId: string): GraphResponse {
    const edges = (g.edges || []).filter(e => e.source === memoryId || e.target === memoryId);
    const nodeIds = new Set<string>([memoryId]);
    edges.forEach(e => { nodeIds.add(e.source); nodeIds.add(e.target); });
    const nodes = (g.nodes || []).filter(n => nodeIds.has(n.id));
    return { nodes, edges, count: nodes.length };
  }

  async function onSearch() {
    const res = await searchMemories({ q: query, n: 10, person: personFilter || undefined });
    const ids = res.ids?.[0] || [];
    const docs = (res.documents?.[0] || []).map((doc, idx) => ({ id: ids[idx], doc, meta: (res.metadatas?.[0] || [])[idx] || {} }));
    setSearchResults(docs);
    setLastSearch({ q: query, n: 10, person: personFilter || undefined });
  }

  function focusNodeById(id?: string) {
    if (!id) return;
    console.log('Focusing on node:', id);
    // React Flow handles focusing internally
  }

  async function focusGraphForMemory(id?: string) {
    try {
      setLoadingGraph(true);
      if (!id) return;
      const g = await getGraph(id, 200);
      const filtered = filterGraphForMemory(g, id);
      setGraph(filtered);
      setSelectedMemoryId(id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoadingGraph(false);
    }
  }

  async function onCreateMemory() {
    try {
      setCreating(true);
      let mediaPaths: string[] = [];
      if (selectedFiles.length) {
        const up = await uploadMedia(selectedFiles);
        mediaPaths = up.files.map(f => f.path);
        toast.success(`Uploaded ${up.files.length} file(s)`, {
          position: 'top-right',
          autoClose: 2000,
        });
      }
      const payload = {
        document: newMemory.document.trim(),
        person: newMemory.person.trim(),
        event: newMemory.event.trim() || undefined,
        tags: newMemory.tags.split(',').map(t => t.trim()).filter(Boolean),
        media: mediaPaths,
      };
      await createMemory(payload);
      toast.success('Memory created successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setNewMemory({ document: '', person: '', event: '', tags: '' });
      setSelectedFiles([]);
      await loadGraph();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error(e.message || 'Failed to create memory', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setCreating(false);
    }
  }

  // removed old tag/delete box flows; using modal actions from Results instead

  function openEditModal(r: { id?: string; doc: string; meta: any }) {
    const meta: any = r.meta || {};
    const tags = parseArrayFromUnknown(meta.tags).join(', ');
    const media = parseArrayFromUnknown(meta.media).join(', ');
    setActiveMemory({ id: r.id || '', document: r.doc, person: (meta.person as string) || '', event: (meta.event as string) || '', tags, media });
    setIsEditOpen(true);
  }

  function openDeleteModal(r: { id?: string }) {
    setActiveMemory(v => ({ ...v, id: r.id || '' }));
    setIsDeleteOpen(true);
  }

  async function saveEdit() {
    if (!activeMemory.id) return;
    try {
      const currentTags = activeMemory.tags.split(',').map(s => s.trim()).filter(Boolean);
      const payload: any = {
        tags: currentTags.length ? currentTags : ['untagged'],
        document: activeMemory.document.trim(),
      };
      const meta: any = {};
      if (activeMemory.person.trim()) meta.person = activeMemory.person.trim();
      if (activeMemory.event.trim()) meta.event = activeMemory.event.trim();
      if (activeMemory.media.trim()) meta.media = activeMemory.media.split(',').map(s => s.trim()).filter(Boolean);
      if (Object.keys(meta).length) payload.metadata = meta;
      // Debug logs
      // eslint-disable-next-line no-console
      console.log('saveEdit:payload', payload);
      const res = await updateMemory(activeMemory.id, payload);
      // eslint-disable-next-line no-console
      console.log('saveEdit:response', res);
      toast.success('Memory updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsEditOpen(false);
      if (lastSearch) await onSearch();
      await loadGraph();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('saveEdit:error', e);
      toast.error(e.message || 'Failed to update memory', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  }

  async function confirmDelete() {
    if (!activeMemory.id) return;
    try {
      await deleteMemory(activeMemory.id);
      toast.success('Memory deleted successfully', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsDeleteOpen(false);
      if (lastSearch) await onSearch();
      await loadGraph();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error(e.message || 'Failed to delete memory', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  }

  // bulk delete now only via API client when needed

  return (
    <PageContainer fullWidth className="!py-0 !px-0">
      <div className="w-full mx-auto py-4 px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
              Back
          </Link>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Network className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">Memory Graph</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreatePanel(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Memory
            </Button>
            <Button variant="primary" size="sm" onClick={loadGraph} disabled={loadingGraph}>
              <RefreshCw className={cn('h-4 w-4 mr-2', loadingGraph && 'animate-spin')} /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <select
                  className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
                  value={selectedMemoryId || ''}
                  onChange={e => focusGraphForMemory(e.target.value)}
                >
                  <option value="">Select a memory to view graph…</option>
                  {availableMemories.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <Button size="sm" variant="outline" onClick={loadAvailableMemories}>
                  <RefreshCw className={cn('h-4 w-4', loadingGraph && 'animate-spin')} />
                </Button>
                <Button size="sm" onClick={() => { setIsFloating(v => !v); }}>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  {isFloating ? 'Dock' : 'Pop out'}
                </Button>
              </div>
              <div className="relative">
                {!isFloating && (
                  <div className="h-[80vh] w-full rounded-lg bg-slate-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {isGraphEmpty ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                          <Network className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <div className="mb-2 font-semibold">No data to display</div>
                          <div>Select a memory from the list above to render its graph.</div>
                        </div>
                      </div>
                    ) : (
                      <ProfessionalMemoryGraph graphData={graph} onNodeClick={focusNodeById} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center"><Search className="h-4 w-4 mr-2" /> Semantic Search</h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Search memories (semantic)…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') onSearch(); }}
                  />
                </div>
                <input
                  className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Filter by person"
                  value={personFilter}
                  onChange={e => setPersonFilter(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={onSearch}>Search</Button>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Results</h3>
              <div className="space-y-3 overflow-y-auto max-h-[300px] p-1">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500">No results yet. Try searching.</p>
                ) : searchResults.map((r, i) => {
                  const meta: any = r.meta || {};
                  const tags = parseArrayFromUnknown(meta.tags);
                  const media = parseArrayFromUnknown(meta.media);
                  return (
                    <div key={i} onClick={() => focusGraphForMemory(r.id)} className="p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none">
                      <p className="text-sm font-medium mb-2 leading-snug">{r.doc}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Person: </span>
                          <span>{meta.person ?? '-'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Event: </span>
                          <span>{meta.event ?? '-'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Tags: </span>
                          {tags.length ? (
                            <span className="inline-flex flex-wrap gap-1">
                              {tags.map((t: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{t}</span>
                              ))}
                </span>
                          ) : <span>-</span>}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Media: </span>
                          {media.length ? (
                            <div className="mt-1 grid grid-cols-3 gap-2">
                              {media.slice(0,3).map((m: string, idx: number) => {
                                const url = toMediaUrl(m);
                                return isImagePath(m) ? (
                                  <img key={idx} src={url} alt="media" className="h-12 w-full object-cover rounded border border-gray-200 dark:border-gray-700" />
                                ) : (
                                  <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400 truncate">
                                    {m}
                                  </a>
                                );
                              })}
                              {media.length > 3 && (
                                <span className="text-xs text-gray-400">+{media.length - 3} more</span>
                              )}
                            </div>
                          ) : <span>-</span>}
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openEditModal(r); }}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openDeleteModal(r); }}>Delete</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCreatePanel && (
        <FloatingPanel position="bottom-right" onClose={() => setShowCreatePanel(false)}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center"><Plus className="h-4 w-4 mr-2" /> Add Memory</h3>
            <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setShowCreatePanel(false)}><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            <textarea
              className="w-full min-h-[80px] px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Document (memory text)"
              value={newMemory.document}
              onChange={e => setNewMemory(v => ({ ...v, document: e.target.value }))}
            />
            <input
              className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Person (required)"
              value={newMemory.person}
              onChange={e => setNewMemory(v => ({ ...v, person: e.target.value }))}
            />
            <input
              className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Event (optional)"
              value={newMemory.event}
              onChange={e => setNewMemory(v => ({ ...v, event: e.target.value }))}
            />
            <input
              className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Tags (comma separated)"
              value={newMemory.tags}
              onChange={e => setNewMemory(v => ({ ...v, tags: e.target.value }))}
            />
            <div>
              <label className="text-sm font-medium mb-1 block">Media</label>
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Upload className="h-5 w-5 mr-2 text-gray-500" /> Select files
                <input type="file" className="hidden" multiple accept="image/*,video/*,audio/*" onChange={e => {
                  const next = Array.from(e.target.files || []);
                  if (!next.length) return;
                  setSelectedFiles(prev => [...prev, ...next]);
                }} />
              </label>
              {selectedFiles.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative border rounded p-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-16 w-full object-cover rounded" />
                      ) : file.type.startsWith('video/') ? (
                        <VideoPlayer src={URL.createObjectURL(file)} className="h-16 w-full object-cover rounded" muted />
                      ) : (
                        <div className="h-16 w-full flex items-center justify-center text-xs text-gray-500 truncate">{file.name}</div>
                      )}
                      <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 rounded-full h-5 w-5 text-xs">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={async () => { await onCreateMemory(); setShowCreatePanel(false); }} disabled={creating || !newMemory.document.trim() || !newMemory.person.trim()} className="w-full">
              <Plus className={cn('h-4 w-4 mr-2', creating && 'animate-spin')} /> Create
            </Button>
        </div>
        </FloatingPanel>
      )}
      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen(false)} />
          <div className="relative w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-3">Edit Memory</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" disabled value={activeMemory.id} />
              <textarea className="w-full min-h-[80px] px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.document} onChange={e => setActiveMemory(v => ({ ...v, document: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.person} onChange={e => setActiveMemory(v => ({ ...v, person: e.target.value }))} placeholder="Person" />
                <input className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.event} onChange={e => setActiveMemory(v => ({ ...v, event: e.target.value }))} placeholder="Event" />
              </div>
              <input className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.tags} onChange={e => setActiveMemory(v => ({ ...v, tags: e.target.value }))} placeholder="Tags (comma separated)" />
              <input className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.media} onChange={e => setActiveMemory(v => ({ ...v, media: e.target.value }))} placeholder="Media paths (comma separated)" />
              {/* Current media with remove */}
              {(() => {
                const items = activeMemory.media.split(',').map(s => s.trim()).filter(Boolean);
                return items.length ? (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current media</div>
                    <div className="grid grid-cols-3 gap-2">
                      {items.map((m, idx) => (
                        <div key={idx} className="relative border rounded p-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {isImagePath(m) ? (
                            <img src={toMediaUrl(m)} alt={m} className="h-16 w-full object-cover rounded" />
                          ) : /\.(mp4|webm|ogg)$/i.test(m) ? (
                            <VideoPlayer src={toMediaUrl(m)} className="h-16 w-full object-cover rounded" muted />
                          ) : (
                            <a href={toMediaUrl(m)} target="_blank" rel="noreferrer" className="h-16 w-full flex items-center justify-center text-[11px] text-primary-600 dark:text-primary-400 truncate">{m.split('/').pop() || m}</a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const next = items.filter((_, i) => i !== idx).join(', ');
                              setActiveMemory(v => ({ ...v, media: next }));
                            }}
                            className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 rounded-full h-5 w-5 text-xs"
                            aria-label="Remove media"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
              {/* Attach new media */}
              <div>
                <label className="text-sm font-medium mb-1 block">Attach new media (device)</label>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Upload className="h-5 w-5 mr-2 text-gray-500" /> Select files
                  <input type="file" className="hidden" multiple accept="image/*,video/*,audio/*" onChange={e => {
                    const next = Array.from(e.target.files || []);
                    if (!next.length) return;
                    setEditFiles(prev => [...prev, ...next]);
                  }} />
                </label>
                {editFiles.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {editFiles.map((file, idx) => (
                      <div key={idx} className="relative border rounded p-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt={file.name} className="h-16 w-full object-cover rounded" />
                        ) : file.type.startsWith('video/') ? (
                          <VideoPlayer src={URL.createObjectURL(file)} className="h-16 w-full object-cover rounded" muted />
                        ) : (
                          <div className="h-16 w-full flex items-center justify-center text-xs text-gray-500 truncate">{file.name}</div>
                        )}
                        <button type="button" onClick={() => setEditFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 rounded-full h-5 w-5 text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
                {editFiles.length > 0 && (
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" variant="secondary" onClick={async () => {
                      try {
                        const res = await uploadMedia(editFiles);
                        const paths = res.files.map(f => f.path);
                        setActiveMemory(v => ({ ...v, media: [v.media, ...paths].filter(Boolean).join(', ') }));
                        setEditFiles([]);
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                      }
                    }}>Upload & attach</Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={saveEdit}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-3">Delete Memory</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete this memory?</p>
            <input className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mb-3" disabled value={activeMemory.id} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="secondary" onClick={confirmDelete}>Delete</Button>
            </div>
        </div>
      </div>
      )}
      {isFloating && (
        <DraggablePanel title="Memory Graph" defaultSize={{ width: 900, height: 600 }} minWidth={600} minHeight={400} onClose={() => setIsFloating(false)}>
          <div className="h-full w-full rounded-lg bg-slate-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <ProfessionalMemoryGraph graphData={graph} onNodeClick={focusNodeById} />
          </div>
        </DraggablePanel>
      )}
    </PageContainer>
  );
};

export default MemoryGraphPage;
