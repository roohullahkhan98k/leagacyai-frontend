import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Network, RefreshCw, Search, Upload, Plus, X, Maximize2, User, Calendar, Tag, Image as ImageIcon, FileText, Globe, Languages, ChevronDown } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import type { GraphResponse, GraphNode, LanguageInfo } from '../../services/memoryGraphApi';
import { createMemory, deleteMemory, getGraph, searchMemories, uploadMedia, updateMemory, getTranslatedMemory } from '../../services/memoryGraphApi';
import DraggablePanel from '../../components/ui/DraggablePanel';
import FloatingPanel from '../../components/ui/FloatingPanel';
import VideoPlayer from '../../components/ui/VideoPlayer';
import ProfessionalMemoryGraph from '../../components/multimedia/ProfessionalMemoryGraph';
import { toast } from 'react-toastify';

const MemoryGraphPage = () => {
  const { t, i18n } = useTranslation();
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [query, setQuery] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [searchResults, setSearchResults] = useState<{ id?: string; doc: string; meta: Record<string, unknown> }[]>([]);
  const [queryLanguage, setQueryLanguage] = useState<LanguageInfo | null>(null);
  const [searching, setSearching] = useState(false);
  const [translatedMemories, setTranslatedMemories] = useState<Record<string, { document: string; original_document?: string; original_language?: string; display_language?: string; available_languages?: string[]; has_translations?: boolean }>>({});
  const [loadingTranslation, setLoadingTranslation] = useState<Set<string>>(new Set());
  const [viewingOriginal, setViewingOriginal] = useState<Set<string>>(new Set());
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const [viewMemoryModal, setViewMemoryModal] = useState<{ open: boolean; node: GraphNode | null }>({ open: false, node: null });

  // Utility function to truncate text to 10 words with ellipses
  const truncateText = (text: string, maxWords: number = 10): string => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };
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

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-dropdown-container')) {
        setLanguageDropdownOpen({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-load translation when memory modal opens and translation is available
  useEffect(() => {
    if (viewMemoryModal.open && viewMemoryModal.node) {
      const node = viewMemoryModal.node;
      const meta: any = node.data || {};
      const language: LanguageInfo | undefined = meta.language 
        ? (typeof meta.language === 'string' 
            ? { code: meta.language, name: meta.language, isRTL: false }
            : meta.language)
        : undefined;
      const hasTranslations = meta.hasTranslations || meta.translated_texts;
      const translatedData = translatedMemories[node.id];
      const userLang = i18n.language || 'en';
      const isTranslating = loadingTranslation.has(node.id);
      const availableLanguages = meta.availableLanguages || translatedData?.available_languages;

      // Only auto-load if:
      // 1. Translations actually exist (not just hasTranslations flag)
      // 2. User language is different from original
      // 3. Translation not already loaded
      // 4. Not currently loading
      // 5. User's language is available in translations
      const shouldAutoLoad = hasTranslations && 
        language && 
        language.code !== userLang && 
        !translatedData && 
        !isTranslating &&
        availableLanguages?.includes(userLang);

      if (shouldAutoLoad) {
        loadTranslatedMemory(node.id, userLang);
      }
    }
  }, [viewMemoryModal.open, viewMemoryModal.node?.id, i18n.language, translatedMemories, loadingTranslation]);

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
      // Re-run the last search if it exists to refresh search results
      if (lastSearch) {
        await onSearch(true); // Use lastSearch parameters
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

  async function onSearch(useLastSearch = false) {
    try {
      setSearching(true);
      // Use lastSearch parameters if requested, otherwise use current state
      const searchParams = useLastSearch && lastSearch 
        ? { q: lastSearch.q, n: lastSearch.n || 10, person: lastSearch.person, event: lastSearch.event, tag: lastSearch.tag }
        : { q: query, n: 10, person: personFilter || undefined };
      
      const res = await searchMemories(searchParams);
      const ids = res.ids?.[0] || [];
      const docs = (res.documents?.[0] || []).map((doc, idx) => ({ id: ids[idx], doc, meta: (res.metadatas?.[0] || [])[idx] || {} }));
      setSearchResults(docs);
      setQueryLanguage(res.queryLanguage || null);
      setLastSearch({ q: searchParams.q, n: searchParams.n, person: searchParams.person, event: searchParams.event, tag: searchParams.tag });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error(e.message || t('memory.failedToSearch'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setSearching(false);
    }
  }

  function focusNodeById(id?: string, reactFlowNode?: any) {
    if (!id) return;
    // If it's a memory node, get the original GraphNode from the data
    if (reactFlowNode && reactFlowNode.data?.originalNode) {
      const originalNode = reactFlowNode.data.originalNode as GraphNode;
      if (originalNode.type === 'memory') {
        setViewMemoryModal({ open: true, node: originalNode });
        return;
      }
    }
    // Also check if we can find it in the current graph
    if (graph) {
      const foundNode = graph.nodes.find(n => n.id === id && n.type === 'memory');
      if (foundNode) {
        setViewMemoryModal({ open: true, node: foundNode });
        return;
      }
    }
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

  async function loadTranslatedMemory(memoryId: string, lang: string) {
    if (loadingTranslation.has(memoryId)) return; // Already loading
    
    try {
      setLoadingTranslation(prev => new Set(prev).add(memoryId));
      const translated = await getTranslatedMemory(memoryId, lang);
      setTranslatedMemories(prev => ({
        ...prev,
        [memoryId]: {
          document: translated.document,
          original_document: translated.original_document,
          original_language: translated.original_language,
          display_language: translated.display_language,
          available_languages: translated.available_languages,
          has_translations: translated.has_translations,
        }
      }));
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to load translation:', e);
      toast.error(e.message || 'Failed to load translation', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoadingTranslation(prev => {
        const next = new Set(prev);
        next.delete(memoryId);
        return next;
      });
    }
  }

  async function onCreateMemory() {
    try {
      setCreating(true);
      let mediaPaths: string[] = [];
      if (selectedFiles.length) {
        const up = await uploadMedia(selectedFiles);
        mediaPaths = up.files.map(f => f.path);
        toast.success(t('memory.uploadedFiles', { count: up.files.length }), {
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
      const result = await createMemory(payload);
      const languageMsg = result.language 
        ? ` (${t('memory.languageLabel')}: ${result.language.name}${result.language.isRTL ? `, ${t('memory.rtl')}` : ''})`
        : '';
      toast.success(`${t('memory.memoryCreated')}${languageMsg}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      setNewMemory({ document: '', person: '', event: '', tags: '' });
      setSelectedFiles([]);
      await loadGraph();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error(e.message || t('memory.failedToCreate'), {
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
      setIsSaving(true);
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
      const languageMsg = res.language 
        ? ` (${t('memory.languageLabel')}: ${res.language.name}${res.language.isRTL ? `, ${t('memory.rtl')}` : ''})`
        : '';
      toast.success(`${t('memory.memoryUpdated')}${languageMsg}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsEditOpen(false);
      await loadAvailableMemories();
      // Re-run the last search if it exists to show updated results
      if (lastSearch) {
        await onSearch(true); // Use lastSearch parameters
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('saveEdit:error', e);
      toast.error(e.message || t('memory.failedToUpdate'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!activeMemory.id) return;
    try {
      setIsDeleting(true);
      await deleteMemory(activeMemory.id);
      toast.success(t('memory.memoryDeleted'), {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsDeleteOpen(false);
      await loadAvailableMemories();
      // Re-run the last search if it exists to show updated results
      if (lastSearch) {
        await onSearch(true); // Use lastSearch parameters
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error(e.message || t('memory.failedToDelete'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  // bulk delete now only via API client when needed

  return (
    <PageContainer fullWidth className="!py-0 !px-0">
      <div className="w-full mx-auto py-4 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
          </Link>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Network className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{t('memory.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowCreatePanel(true)} className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105">
              <Plus className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">{t('memory.addMemory')}</span><span className="sm:hidden">{t('common.create')}</span>
            </Button>
            <Button variant="primary" size="sm" onClick={loadGraph} disabled={loadingGraph} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
              <RefreshCw className={cn('h-4 w-4', loadingGraph && 'animate-spin')} />
              <span className="hidden sm:inline ml-2">{t('common.refresh')}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4">
              <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  className="h-9 px-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm flex-1 min-w-0"
                  value={selectedMemoryId || ''}
                  onChange={e => focusGraphForMemory(e.target.value)}
                  style={{ maxWidth: '100%' }}
                >
                  <option value="">{t('memory.selectMemory')}</option>
                  {availableMemories.map(m => (
                    <option key={m.id} value={m.id} title={m.label}>{m.label}</option>
                  ))}
                </select>
                <Button size="sm" onClick={() => { setIsFloating(v => !v); }} className="w-full sm:w-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-700/30 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 hover:scale-105">
                  <Maximize2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{isFloating ? t('memory.dock') : t('memory.popOut')}</span>
                </Button>
              </div>
              <div className="relative">
                {!isFloating && (
                  <div className="h-[60vh] sm:h-[70vh] lg:h-[80vh] w-full rounded-lg bg-slate-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {isGraphEmpty ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                          <Network className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <div className="mb-2 font-semibold">{t('memory.noData')}</div>
                          <div>{t('memory.selectMemoryToRender')}</div>
                        </div>
                      </div>
                    ) : (
                      <ProfessionalMemoryGraph 
                        graphData={graph} 
                        onNodeClick={(id, node) => focusNodeById(id, node)} 
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base"><Search className="h-4 w-4 mr-2" /> {t('memory.semanticSearch')}</h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className={cn('h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400', searching && 'animate-pulse')} />
                  <input
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={t('memory.searchPlaceholder')}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !searching) onSearch(); }}
                    disabled={searching}
                  />
                </div>
                <input
                  className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('memory.filterByPerson')}
                  value={personFilter}
                  onChange={e => setPersonFilter(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => onSearch()} disabled={searching} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                    <Search className={cn('h-4 w-4 mr-2', searching && 'animate-spin')} />
                    {searching ? t('common.loading') : t('common.search')}
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm sm:text-base">{t('memory.results')}</h3>
                {queryLanguage && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {t('memory.searchingIn', { language: queryLanguage.name })}
                  </span>
                )}
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[300px] sm:max-h-[400px] p-1">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('memory.noResults')}</p>
                ) : searchResults.map((r, i) => {
                  const meta: any = r.meta || {};
                  const tags = parseArrayFromUnknown(meta.tags);
                  const media = parseArrayFromUnknown(meta.media);
                  const language: LanguageInfo | undefined = meta.language 
                    ? (typeof meta.language === 'string' 
                        ? { code: meta.language, name: meta.language, isRTL: false }
                        : meta.language)
                    : undefined;
                  const isExpanded = expandedResults.has(i);
                  const displayText = isExpanded ? r.doc : truncateText(r.doc);
                  return (
                    <div key={i} className="p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 select-none">
                      <p 
                        dir={language?.isRTL ? 'rtl' : 'ltr'}
                        className={cn(
                          "text-sm font-medium mb-2 leading-snug cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-words",
                          language?.isRTL && 'rtl-content'
                        )}
                        style={{ 
                          wordBreak: 'break-word', 
                          maxWidth: '100%'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedResults(prev => {
                            const next = new Set(prev);
                            if (next.has(i)) {
                              next.delete(i);
                            } else {
                              next.add(i);
                            }
                            return next;
                          });
                        }}
                      >
                        {displayText}
                      </p>
                      <div onClick={() => focusGraphForMemory(r.id)} className="cursor-pointer">
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t('memory.personLabel')}: </span>
                          <span>{meta.person ?? '-'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t('memory.eventLabel')}: </span>
                          <span>{meta.event ?? '-'}</span>
                        </div>
                        {language && (
                          <div className="col-span-2 flex items-center gap-1 flex-wrap">
                            <Globe className="h-3 w-3 text-blue-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t('memory.languageLabel')}: </span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {language.name || language.code}
                            </span>
                            {language.isRTL && (
                              <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px]">
                                {t('memory.rtl')}
                              </span>
                            )}
                            {meta.availableLanguages && meta.availableLanguages.length > 1 && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const currentLang = meta.language || 'en';
                                  const langIndex = meta.availableLanguages.indexOf(currentLang);
                                  const nextIndex = (langIndex + 1) % meta.availableLanguages.length;
                                  const nextLang = meta.availableLanguages[nextIndex];
                                  
                                  if (nextLang !== currentLang && r.id) {
                                    await loadTranslatedMemory(r.id, nextLang);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] flex items-center gap-1 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer"
                                title={`${t('memory.availableLanguages')}: ${meta.availableLanguages.join(', ')}`}
                              >
                                <Languages className="h-3 w-3" />
                                {t('memory.availableLanguages')} ({meta.availableLanguages.length})
                              </button>
                            )}
                          </div>
                        )}
                        <div className="col-span-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t('memory.tagsLabel')}: </span>
                          {tags.length ? (
                            <span className="inline-flex flex-wrap gap-1">
                              {tags.map((tag: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{tag}</span>
                              ))}
                </span>
                          ) : <span>-</span>}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t('memory.mediaLabel')}: </span>
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
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openEditModal(r); }} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-700/30 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 hover:scale-105">{t('common.edit')}</Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openDeleteModal(r); }} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all duration-300 hover:scale-105">{t('common.delete')}</Button>
                      </div>
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
            <h3 className="font-semibold flex items-center"><Plus className="h-4 w-4 mr-2" /> {t('memory.addMemory')}</h3>
            <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setShowCreatePanel(false)}><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            <textarea
              className="w-full min-h-[80px] px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('memory.documentPlaceholder')}
              value={newMemory.document}
              onChange={e => setNewMemory(v => ({ ...v, document: e.target.value }))}
            />
            <input
              className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('memory.personPlaceholder')}
              value={newMemory.person}
              onChange={e => setNewMemory(v => ({ ...v, person: e.target.value }))}
            />
            <input
              className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('memory.eventPlaceholder')}
              value={newMemory.event}
              onChange={e => setNewMemory(v => ({ ...v, event: e.target.value }))}
            />
            <input
              className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('memory.tagsPlaceholder')}
              value={newMemory.tags}
              onChange={e => setNewMemory(v => ({ ...v, tags: e.target.value }))}
            />
            <div>
              <label className="text-sm font-medium mb-1 block">{t('memory.mediaLabel')}</label>
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Upload className="h-5 w-5 mr-2 text-gray-500" /> {t('memory.selectFiles')}
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
            <Button onClick={async () => { await onCreateMemory(); setShowCreatePanel(false); }} disabled={creating || !newMemory.document.trim() || !newMemory.person.trim()} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
              <Plus className={cn('h-4 w-4 mr-2', creating && 'animate-spin')} /> {t('common.create')}
            </Button>
        </div>
        </FloatingPanel>
      )}
      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isSaving && setIsEditOpen(false)} />
          <div className="relative w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-3">{t('memory.editMemory')}</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" disabled value={activeMemory.id} />
              <textarea className="w-full min-h-[80px] px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.document} onChange={e => setActiveMemory(v => ({ ...v, document: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.person} onChange={e => setActiveMemory(v => ({ ...v, person: e.target.value }))} placeholder={t('memory.personLabel')} />
                <input className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.event} onChange={e => setActiveMemory(v => ({ ...v, event: e.target.value }))} placeholder={t('memory.eventLabel')} />
              </div>
              <input className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.tags} onChange={e => setActiveMemory(v => ({ ...v, tags: e.target.value }))} placeholder={t('memory.tagsPlaceholder')} />
              <input className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" value={activeMemory.media} onChange={e => setActiveMemory(v => ({ ...v, media: e.target.value }))} placeholder={t('memory.mediaLabel')} />
              {/* Current media with remove */}
              {(() => {
                const items = activeMemory.media.split(',').map(s => s.trim()).filter(Boolean);
                return items.length ? (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('memory.currentMedia')}</div>
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
                            aria-label={t('memory.removeMedia')}
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
                <label className="text-sm font-medium mb-1 block">{t('memory.attachNewMedia')}</label>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Upload className="h-5 w-5 mr-2 text-gray-500" /> {t('memory.selectFiles')}
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
                    }} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-700/30 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 hover:scale-105">Upload & attach</Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all duration-300 hover:scale-105">{t('common.cancel')}</Button>
                <Button onClick={saveEdit} disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                  <RefreshCw className={cn('h-4 w-4 mr-2', isSaving && 'animate-spin')} />
                  {isSaving ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setIsDeleteOpen(false)} />
          <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-3">{t('memory.deleteMemory')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('memory.confirmDelete')}</p>
            <input className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mb-3" disabled value={activeMemory.id} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all duration-300 hover:scale-105">{t('common.cancel')}</Button>
              <Button variant="secondary" onClick={confirmDelete} disabled={isDeleting} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                <RefreshCw className={cn('h-4 w-4 mr-2', isDeleting && 'animate-spin')} />
                {isDeleting ? t('common.loading') : t('common.delete')}
              </Button>
            </div>
        </div>
      </div>
      )}
      {isFloating && (
        <DraggablePanel title={t('memory.title')} defaultSize={{ width: 900, height: 600 }} minWidth={600} minHeight={400} onClose={() => setIsFloating(false)}>
          <div className="h-full w-full rounded-lg bg-slate-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <ProfessionalMemoryGraph graphData={graph} onNodeClick={(id, node) => focusNodeById(id, node)} />
          </div>
        </DraggablePanel>
      )}

      {/* Memory Detail Modal */}
      {viewMemoryModal.open && viewMemoryModal.node && (() => {
        const node = viewMemoryModal.node;
        const meta: any = node.data || {};
        const originalDocument = meta.document || node.label || '';
        const translatedData = translatedMemories[node.id];
        const isViewingOriginal = viewingOriginal.has(node.id);
        const userLang = i18n.language || 'en';
        
        // Check if translation actually changed the text (not a failed translation)
        const isTranslationValid = translatedData && 
          translatedData.document !== translatedData.original_document &&
          translatedData.has_translations;
        
        const document = isTranslationValid && !isViewingOriginal 
          ? translatedData.document 
          : originalDocument;
        
        const person = meta.person || '';
        const event = meta.event || '';
        const tags = parseArrayFromUnknown(meta.tags);
        const media = parseArrayFromUnknown(meta.media);
        const language: LanguageInfo | undefined = meta.language 
          ? (typeof meta.language === 'string' 
              ? { code: meta.language, name: meta.language, isRTL: false }
              : meta.language)
          : undefined;
        const hasTranslations = meta.hasTranslations || meta.translated_texts;
        const availableLanguages = meta.availableLanguages || translatedData?.available_languages || [];
        const isTranslating = loadingTranslation.has(node.id);
        const displayLanguage = (isTranslationValid && !isViewingOriginal) ? (translatedData?.display_language || language?.code) : language?.code;
        const originalLanguage = translatedData?.original_language || language?.code;
        const isImagePath = (u: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(u);
        const isVideoPath = (u: string) => /\.(mp4|webm|ogg|mov|avi)$/i.test(u);

        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setViewMemoryModal({ open: false, node: null })}
            />
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {t('memory.memoryDetails')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {node.id}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewMemoryModal({ open: false, node: null })}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors ml-4"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Document Text */}
                {document && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t('memory.document')}</h3>
                        {isTranslationValid && !isViewingOriginal && originalLanguage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({t('memory.translatedFrom', { language: originalLanguage })})
                          </span>
                        )}
                        {displayLanguage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t('memory.viewingLanguage', { language: displayLanguage.toUpperCase() })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isTranslating && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            {t('memory.translating')}
                          </span>
                        )}
                        {/* Only show translate button if translations actually exist */}
                        {hasTranslations && translatedData?.has_translations && !isTranslating && (
                          <>
                            {isTranslationValid && !isViewingOriginal ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setViewingOriginal(prev => {
                                    const next = new Set(prev);
                                    next.add(node.id);
                                    return next;
                                  });
                                }}
                                className="text-xs"
                              >
                                {t('memory.viewOriginal')}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  setViewingOriginal(prev => {
                                    const next = new Set(prev);
                                    next.delete(node.id);
                                    return next;
                                  });
                                  if (!translatedData) {
                                    await loadTranslatedMemory(node.id, userLang);
                                  }
                                }}
                                className="text-xs flex items-center gap-1"
                              >
                                <Languages className="h-3 w-3" />
                                {t('memory.translateTo', { language: userLang.toUpperCase() })}
                              </Button>
                            )}
                          </>
                        )}
                        {/* Show message when translations not available due to quota */}
                        {!hasTranslations && language && language.code !== userLang && (
                          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                            ⚠️ {t('memory.translationNotAvailable')} ({t('memory.quotaExceeded')})
                          </div>
                        )}
                      </div>
                    </div>
                    <p 
                      dir={(translatedData && !isViewingOriginal ? displayLanguage : language?.code) === 'ar' ? 'rtl' : 'ltr'}
                      className={`text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${(translatedData && !isViewingOriginal ? displayLanguage : language?.code) === 'ar' ? 'rtl-content' : ''}`}
                    >
                      {document}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Person */}
                  {person && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">{t('memory.personLabel')}</h4>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200">{person}</p>
                    </div>
                  )}

                  {/* Event */}
                  {event && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <h4 className="text-sm font-semibold text-green-900 dark:text-green-300">{t('memory.eventLabel')}</h4>
                      </div>
                      <p className="text-green-800 dark:text-green-200">{event}</p>
                    </div>
                  )}

                  {/* Language */}
                  {language && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">{t('memory.languageLabel')}</h4>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-indigo-800 dark:text-indigo-200 font-medium">
                          {displayLanguage || language.name || language.code}
                        </span>
                        {displayLanguage === 'ar' && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium">
                            {t('memory.rtl')}
                          </span>
                        )}
                        {language.confidence !== undefined && (
                          <span className="text-xs text-indigo-600 dark:text-indigo-400">
                            ({Math.round(language.confidence * 100)}% {t('memory.confidence')})
                          </span>
                        )}
                        {availableLanguages && availableLanguages.length > 1 && (
                          <div className="relative language-dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLanguageDropdownOpen(prev => ({
                                  ...prev,
                                  [node.id]: !prev[node.id]
                                }));
                              }}
                              className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium flex items-center gap-1 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer"
                            >
                              <Languages className="h-3 w-3" />
                              {t('memory.availableLanguages')} ({availableLanguages.length})
                              <ChevronDown className={cn("h-2 w-2 transition-transform", languageDropdownOpen[node.id] && "rotate-180")} />
                            </button>
                            {languageDropdownOpen[node.id] && (
                              <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[60] min-w-[120px] max-h-[250px] overflow-y-auto overscroll-contain">
                                {availableLanguages.map((lang: string) => (
                                  <button
                                    key={lang}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setLanguageDropdownOpen(prev => ({ ...prev, [node.id]: false }));
                                      if (lang !== language?.code) {
                                        await loadTranslatedMemory(node.id, lang);
                                        setViewingOriginal(prev => {
                                          const next = new Set(prev);
                                          next.delete(node.id);
                                          return next;
                                        });
                                      }
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <Globe className="h-3 w-3 flex-shrink-0" />
                                    {lang.toUpperCase()}
                                    {lang === displayLanguage && (
                                      <span className="ml-auto text-xs text-primary-600 flex-shrink-0">✓</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('memory.tagsLabel')}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, idx: number) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium border border-orange-200 dark:border-orange-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Gallery */}
                {media.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('memory.mediaLabel')} ({media.length})</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {media.map((m: string, idx: number) => {
                        const url = toMediaUrl(m);
                        return (
                          <div 
                            key={idx}
                            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-lg hover:shadow-xl"
                          >
                            {isImagePath(m) ? (
                              <img 
                                src={url} 
                                alt={`Media ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : isVideoPath(m) ? (
                              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                <VideoPlayer 
                                  src={url} 
                                  className="w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
                                <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs text-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 truncate w-full"
                                >
                                  {m.split('/').pop() || m}
                                </a>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!document && !person && !event && tags.length === 0 && media.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{t('memory.noData')}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (node.id) {
                        const meta: any = node.data || {};
                        const tags = parseArrayFromUnknown(meta.tags).join(', ');
                        const media = parseArrayFromUnknown(meta.media).join(', ');
                        setActiveMemory({ 
                          id: node.id, 
                          document: meta.document || node.label || '', 
                          person: meta.person || '', 
                          event: meta.event || '', 
                          tags, 
                          media 
                        });
                        setIsEditOpen(true);
                        setViewMemoryModal({ open: false, node: null });
                      }
                    }}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all duration-300 hover:scale-105"
                  >
                    {t('common.edit')}
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      if (node.id) {
                        setActiveMemory(v => ({ ...v, id: node.id || '' }));
                        setIsDeleteOpen(true);
                        setViewMemoryModal({ open: false, node: null });
                      }
                    }}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/50 transition-all duration-300 hover:scale-105"
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </PageContainer>
  );
};

export default MemoryGraphPage;
