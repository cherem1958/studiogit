import React, { useState, useEffect, useMemo } from 'react';
import type { TaskItem, BpoTaskCategory } from '../types/index.ts';
import {
  INITIAL_TASKS,
  BPO_CATEGORIES,
  BPO_TEMPLATE_PRESETS,
  addTask,
  toggleTask,
  deleteTask,
  normalizeTaskCategory,
} from '../utils/curation.ts';
import {
  CheckSquare,
  Square,
  Trash2,
  Plus,
  Filter,
  Layers,
  RotateCcw,
  Sparkles,
  Building2,
  CalendarClock,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  AlertOctagon,
  Search,
  CheckCircle2,
  X,
  BookOpen,
  Printer,
} from 'lucide-react';

export const STORAGE_KEY = 'systemic_bpo_task_matrix_items_v2';

// Icon map for the 6 Financial BPO categories
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  bank_reconciliation: Building2,
  future_entries: CalendarClock,
  optimization_analysis: TrendingUp,
  report_review: FileSpreadsheet,
  compliance_audit: ShieldCheck,
  urgent_settlement: AlertOctagon,
  // legacy aliases
  reconciliation: Building2,
  reporting: FileSpreadsheet,
  compliance: ShieldCheck,
  urgent: AlertOctagon,
};

export interface TaskMatrixProps {
  tasks?: TaskItem[];
  onTasksChange?: (tasks: TaskItem[]) => void;
  onOpenPrintExport?: () => void;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({
  tasks: controlledTasks,
  onTasksChange,
  onOpenPrintExport,
}) => {
  const [internalTasks, setInternalTasks] = useState<TaskItem[]>(() => {
    if (controlledTasks) return controlledTasks;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Check legacy key if exists
      const legacy = localStorage.getItem('systemic_bpo_task_matrix_items');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) return parsedLegacy;
      }
    } catch (e) {
      console.warn('Could not read stored tasks:', e);
    }
    return INITIAL_TASKS;
  });

  const tasks = controlledTasks !== undefined ? controlledTasks : internalTasks;

  const setTasks = (updaterOrValue: TaskItem[] | ((prev: TaskItem[]) => TaskItem[])) => {
    const nextTasks = typeof updaterOrValue === 'function' ? updaterOrValue(tasks) : updaterOrValue;
    if (controlledTasks !== undefined && onTasksChange) {
      onTasksChange(nextTasks);
    } else {
      setInternalTasks(nextTasks);
    }
  };

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState<'all' | 'high' | 'medium' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // New task form state
  const [inputTitle, setInputTitle] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [inputEntity, setInputEntity] = useState('');
  const [inputCategory, setInputCategory] = useState<BpoTaskCategory>('bank_reconciliation');
  const [inputPriority, setInputPriority] = useState<TaskItem['priority']>('high');
  const [inputDueTime, setInputDueTime] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Failed to save BPO tasks to localStorage:', err);
    }
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    setTasks(prev =>
      addTask(
        prev,
        inputTitle,
        inputCategory,
        inputPriority,
        inputDueTime || undefined,
        inputDescription || undefined,
        inputEntity || undefined
      )
    );

    setInputTitle('');
    setInputDescription('');
    setInputEntity('');
    setInputDueTime('');
    setIsFormOpen(false);
  };

  const handleToggle = (id: string) => {
    setTasks(prev => toggleTask(prev, id));
  };

  const handleDelete = (id: string) => {
    setTasks(prev => deleteTask(prev, id));
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = BPO_TEMPLATE_PRESETS.find(t => t.id === templateId);
    if (!template) return;

    const newTasks: TaskItem[] = template.tasks.map((t, idx) => ({
      id: `bpo-template-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      title: t.title,
      description: t.description,
      entityOrAccount: t.entityOrAccount,
      completed: false,
      createdAt: Date.now() - idx * 2000,
      category: t.category,
      priority: t.priority,
      dueTime: t.dueTime,
    }));

    setTasks(prev => [...newTasks, ...prev]);
    setShowTemplatesModal(false);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset the task matrix to default Financial BPO sample workflows?')) {
      setTasks(INITIAL_TASKS);
    }
  };

  const handleClearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  };

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Category filter (match normalized or exact)
      if (activeCategoryFilter !== 'all') {
        const normTask = normalizeTaskCategory(task.category);
        const normFilter = normalizeTaskCategory(activeCategoryFilter);
        if (normTask !== normFilter && task.category !== activeCategoryFilter) {
          return false;
        }
      }

      // Priority filter
      if (activePriorityFilter !== 'all') {
        const prio = task.priority || 'medium';
        if (prio !== activePriorityFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q) || false;
        const matchEntity = task.entityOrAccount?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc && !matchEntity) return false;
      }

      return true;
    });
  }, [tasks, activeCategoryFilter, activePriorityFilter, searchQuery]);

  // Statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityPending = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of BPO_CATEGORIES) {
      counts[cat.id] = 0;
    }
    for (const t of tasks) {
      const norm = normalizeTaskCategory(t.category);
      if (counts[norm] !== undefined) {
        counts[norm]++;
      }
    }
    return counts;
  }, [tasks]);

  return (
    <div className="bg-[#fcfbf8] border border-[#e2dfd8] rounded-none p-5 sm:p-7 shadow-xs font-cm transition-all">
      {/* Header & Title Area */}
      <div className="border-b border-[#e6e2d8] pb-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-sans-ui font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300">
                Operational & Analytical Matrix
              </span>
              <span className="text-[11px] font-mono-data text-slate-500">
                ERP / Treasury / Ledger Synchronization
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1c1d21]">
              Financial BPO Task Matrix
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Tailored execution cockpit for Financial BPO Analysts. Track bank reconciliations,
              pre-validate scheduled future entries, analyze working capital optimizations, review DRE
              reports, enforce audit compliance, and expedite time-sensitive settlements.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenPrintExport) onOpenPrintExport();
                else window.print();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans-ui font-medium bg-[#8c3b2d]/10 hover:bg-[#8c3b2d]/20 text-[#8c3b2d] border border-[#8c3b2d]/30 transition-colors cursor-pointer"
              title="Format current Task Matrix and Briefing for A4 Print / PDF Export"
            >
              <Printer className="w-3.5 h-3.5 text-[#8c3b2d]" />
              <span>Print / PDF Export</span>
            </button>

            <button
              onClick={() => setShowTemplatesModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans-ui font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
              title="Apply pre-built recurring BPO routine templates"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              <span>Routine Templates</span>
            </button>

            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans-ui font-medium bg-[#1c1d21] hover:bg-slate-800 text-white border border-[#1c1d21] transition-colors cursor-pointer"
            >
              {isFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isFormOpen ? 'Close Form' : 'New BPO Task'}</span>
            </button>
          </div>
        </div>

        {/* Operational Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#eeebe3]">
          <div className="bg-[#f7f5ef] p-3 border border-[#e5e1d6]">
            <div className="text-[10px] uppercase font-sans-ui text-slate-500 font-semibold tracking-wide">
              Total Workflow Queue
            </div>
            <div className="text-xl font-bold font-mono-data text-slate-900 mt-0.5">
              {totalCount}{' '}
              <span className="text-xs font-normal text-slate-500 font-cm">tasks</span>
            </div>
          </div>

          <div className="bg-[#f7f5ef] p-3 border border-[#e5e1d6]">
            <div className="text-[10px] uppercase font-sans-ui text-slate-500 font-semibold tracking-wide">
              Pending Validation
            </div>
            <div className="text-xl font-bold font-mono-data text-slate-800 mt-0.5">
              {pendingCount}
            </div>
          </div>

          <div className="bg-[#f7f5ef] p-3 border border-[#e5e1d6]">
            <div className="text-[10px] uppercase font-sans-ui text-rose-800 font-semibold tracking-wide">
              High Priority & Urgent
            </div>
            <div className="text-xl font-bold font-mono-data text-rose-900 mt-0.5">
              {highPriorityPending}{' '}
              <span className="text-xs font-normal text-rose-700 font-cm">due today</span>
            </div>
          </div>

          <div className="bg-[#f7f5ef] p-3 border border-[#e5e1d6]">
            <div className="text-[10px] uppercase font-sans-ui text-emerald-800 font-semibold tracking-wide">
              Reconciled & Cleared
            </div>
            <div className="text-xl font-bold font-mono-data text-emerald-900 mt-0.5">
              {completionPercentage}%{' '}
              <span className="text-xs font-normal text-slate-500 font-cm">({completedCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Templates Drawer / Modal */}
      {showTemplatesModal && (
        <div className="mb-6 p-4 bg-[#f8f6f0] border border-[#dcd6c8] relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6e1d4] mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-sans-ui text-slate-800">
                Pre-Built Financial BPO Routine Templates
              </h3>
            </div>
            <button
              onClick={() => setShowTemplatesModal(false)}
              className="text-slate-500 hover:text-slate-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Select a standard operational routine to populate recurring tasks with accurate workflow
            categories, priority levels, and entity account references:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BPO_TEMPLATE_PRESETS.map(template => (
              <div
                key={template.id}
                className="bg-white p-3.5 border border-[#e2dfd8] flex flex-col justify-between hover:border-slate-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{template.name}</span>
                    <span className="text-[11px] font-mono-data text-slate-500">
                      ~{template.estimatedMinutes} min
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="text-[11px] text-slate-500 mb-3 font-mono-data">
                    Includes {template.tasks.length} actionable items
                  </div>
                </div>
                <button
                  onClick={() => handleApplyTemplate(template.id)}
                  className="w-full text-center py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans-ui text-xs font-medium border border-slate-300 transition-colors"
                >
                  Apply Template Tasks (+{template.tasks.length})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Task Expandable Creation Form */}
      {isFormOpen && (
        <form
          onSubmit={handleAddTask}
          className="mb-6 p-4 sm:p-5 bg-white border border-[#dcd6c8] space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#eeebe3] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-sans-ui text-slate-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              Create Operational BPO Task
            </span>
            <span className="text-xs text-slate-500 font-cm">
              Accurate categorization enforces operational compliance
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 font-sans-ui uppercase tracking-wide mb-1">
              Task Title & Primary Action *
            </label>
            <input
              type="text"
              required
              value={inputTitle}
              onChange={e => setInputTitle(e.target.value)}
              placeholder="e.g., Match daily Citibank EUR statement with SAP subledger & investigate $5,200 timing variance"
              className="w-full px-3 py-2 text-sm bg-[#faf8f5] border border-[#d5cfc2] focus:border-slate-800 focus:outline-hidden font-cm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 font-sans-ui uppercase tracking-wide mb-1">
                Workflow Category *
              </label>
              <select
                value={inputCategory}
                onChange={e => setInputCategory(e.target.value as BpoTaskCategory)}
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#d5cfc2] focus:border-slate-800 focus:outline-hidden font-sans-ui text-slate-800"
              >
                {BPO_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    [{cat.label}] — {cat.description.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 font-sans-ui uppercase tracking-wide mb-1">
                Priority Level & Urgency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'medium', 'normal'] as const).map(prio => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setInputPriority(prio)}
                    className={`py-1.5 text-xs font-sans-ui font-medium border text-center transition-colors uppercase ${
                      inputPriority === prio
                        ? prio === 'high'
                          ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                          : prio === 'medium'
                          ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                          : 'bg-slate-200 border-slate-400 text-slate-900 font-bold'
                        : 'bg-[#faf8f5] border-[#d5cfc2] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 font-sans-ui uppercase tracking-wide mb-1">
                Account / System / Entity Reference (Optional)
              </label>
              <input
                type="text"
                value={inputEntity}
                onChange={e => setInputEntity(e.target.value)}
                placeholder="e.g., Itaú Treasury #0492 / NetSuite AP Batch"
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#d5cfc2] focus:border-slate-800 focus:outline-hidden font-mono-data text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 font-sans-ui uppercase tracking-wide mb-1">
                Target Cutoff Time (Optional)
              </label>
              <input
                type="text"
                value={inputDueTime}
                onChange={e => setInputDueTime(e.target.value)}
                placeholder="e.g., 11:30 AM BRT / Prior to Cutoff"
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#d5cfc2] focus:border-slate-800 focus:outline-hidden font-mono-data text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 font-sans-ui uppercase tracking-wide mb-1">
              Analytical Notes & Investigation Steps (Optional)
            </label>
            <textarea
              rows={2}
              value={inputDescription}
              onChange={e => setInputDescription(e.target.value)}
              placeholder="e.g., Cross-check with credit card acquirer portal if batch settlement variance persists over 48h."
              className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#d5cfc2] focus:border-slate-800 focus:outline-hidden font-cm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeebe3]">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-1.5 text-xs font-sans-ui text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-sans-ui font-medium bg-[#1c1d21] hover:bg-slate-800 text-white border border-[#1c1d21] transition-colors"
            >
              Add Task to Queue
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Tabs (The 6 Workflows Specified in Prompt) */}
      <div className="mb-4">
        <div className="text-[11px] font-sans-ui uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center justify-between">
          <span>Filter by Core BPO Workflow Category:</span>
          <span className="font-normal lowercase text-slate-400">
            {filteredTasks.length} matching tasks
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-sans-ui font-medium border transition-colors ${
              activeCategoryFilter === 'all'
                ? 'bg-[#1c1d21] text-white border-[#1c1d21]'
                : 'bg-white text-slate-700 border-[#d5cfc2] hover:bg-slate-100'
            }`}
          >
            All Workflows ({totalCount})
          </button>

          {BPO_CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat.id] || Layers;
            const count = categoryCounts[cat.id] || 0;
            const isActive =
              activeCategoryFilter === cat.id ||
              normalizeTaskCategory(activeCategoryFilter) === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-sans-ui border transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                    : 'bg-white text-slate-700 border-[#d5cfc2] hover:bg-slate-50'
                }`}
                title={cat.description}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                <span>{cat.shortLabel}</span>
                <span
                  className={`text-[10px] font-mono-data px-1.5 py-0.2 rounded-none ${
                    isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Operational Scope Banner (Shows when a specific category is selected) */}
      {activeCategoryFilter !== 'all' && (
        <div className="mb-4 p-2.5 bg-[#f6f4ed] border-l-3 border-slate-700 text-xs text-slate-700 font-cm flex items-start gap-2">
          <span className="font-bold font-sans-ui text-slate-900 uppercase tracking-wide text-[11px] whitespace-nowrap">
            Scope Definition:
          </span>
          <span>
            {BPO_CATEGORIES.find(
              c => c.id === activeCategoryFilter || c.id === normalizeTaskCategory(activeCategoryFilter)
            )?.description || 'Selected operational workflow.'}
          </span>
        </div>
      )}

      {/* Secondary Search & Priority Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 pt-3 border-t border-[#eeebe3]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, account code, or notes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#d5cfc2] focus:border-slate-800 focus:outline-hidden font-cm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Priority Filter & Reset Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center text-xs font-sans-ui text-slate-600 gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            <span className="text-[11px] uppercase tracking-wide text-slate-500">Priority:</span>
          </div>

          <div className="flex items-center border border-[#d5cfc2] bg-white text-xs">
            {(['all', 'high', 'medium', 'normal'] as const).map(prio => (
              <button
                key={prio}
                onClick={() => setActivePriorityFilter(prio)}
                className={`px-2.5 py-1 text-[11px] font-sans-ui capitalize transition-colors ${
                  activePriorityFilter === prio
                    ? 'bg-slate-200 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {prio}
              </button>
            ))}
          </div>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="text-[11px] font-sans-ui text-slate-600 hover:text-rose-700 px-2 py-1 border border-transparent hover:border-rose-200 transition-colors"
              title="Remove all completed tasks from queue"
            >
              Clear Done ({completedCount})
            </button>
          )}

          <button
            onClick={handleResetDefaults}
            className="text-[11px] font-sans-ui text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 px-2 py-1 border border-transparent hover:border-slate-300 transition-colors"
            title="Reset to default Financial BPO sample tasks"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Task List Table / Cards */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white border border-dashed border-[#d5cfc2]">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 font-sans-ui">
              No tasks match the active filters
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-cm">
              Try adjusting your workflow category or search criteria, or click below to populate
              tasks from a standard BPO routine.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setActiveCategoryFilter('all');
                  setActivePriorityFilter('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 text-xs font-sans-ui bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-3 py-1.5 text-xs font-sans-ui bg-[#1c1d21] text-white hover:bg-slate-800"
              >
                Create New Task
              </button>
            </div>
          </div>
        ) : (
          filteredTasks.map(task => {
            const normalizedCat = normalizeTaskCategory(task.category);
            const catConfig =
              BPO_CATEGORIES.find(c => c.id === normalizedCat) || BPO_CATEGORIES[0];
            const Icon = CATEGORY_ICONS[normalizedCat] || Layers;

            return (
              <div
                key={task.id}
                className={`p-3.5 sm:p-4 bg-white border transition-all ${
                  task.completed
                    ? 'border-[#e4e1d9] bg-[#faf9f6] opacity-80'
                    : 'border-[#dedad0] hover:border-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox & Content */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggle(task.id)}
                      className="mt-0.5 text-slate-600 hover:text-slate-900 transition-colors focus:outline-hidden"
                      aria-label={task.completed ? 'Mark task pending' : 'Mark task completed'}
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Meta badges strip */}
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        {/* Category badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-sans-ui font-medium px-2 py-0.5 border ${catConfig.badgeClass}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{catConfig.label}</span>
                        </span>

                        {/* Priority badge */}
                        <span
                          className={`text-[10px] font-sans-ui uppercase tracking-wide px-1.5 py-0.5 border font-semibold ${
                            task.priority === 'high'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {task.priority || 'medium'}
                        </span>

                        {/* Account / Entity Reference */}
                        {task.entityOrAccount && (
                          <span className="text-[11px] font-mono-data text-slate-600 bg-slate-50 px-1.5 py-0.5 border border-slate-200">
                            {task.entityOrAccount}
                          </span>
                        )}

                        {/* Cutoff / Due Time */}
                        {task.dueTime && (
                          <span className="text-[11px] font-mono-data text-slate-500">
                            Due: {task.dueTime}
                          </span>
                        )}
                      </div>

                      {/* Title with strike-through when completed */}
                      <p
                        className={`text-sm leading-snug font-cm ${
                          task.completed
                            ? 'line-through text-slate-400 font-normal'
                            : 'text-[#1c1d21] font-medium'
                        }`}
                      >
                        {task.title}
                      </p>

                      {/* Description / Analytical Notes */}
                      {task.description && (
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            task.completed ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Delete Action */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-slate-400 hover:text-rose-700 p-1 transition-colors"
                      title="Delete task from matrix"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info & Operational Note */}
      <div className="mt-6 pt-4 border-t border-[#eeebe3] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Matrix state persisted in browser LocalStorage. Data survives page reloads.</span>
        </div>
        <div className="font-mono-data text-[11px]">
          Showing {filteredTasks.length} of {totalCount} items
        </div>
      </div>
    </div>
  );
};
