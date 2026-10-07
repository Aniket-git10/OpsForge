import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ListPlus,
  ArrowUpDown,
  FileSpreadsheet,
  Lightbulb,
  Check,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Project, Task } from '../types/index';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';

type AITab = 'generate' | 'prioritize' | 'summary' | 'insights';

export const AIAssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<AITab>('generate');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);

  // Feature A State: Task Generation
  const [goal, setGoal] = useState('Build an e-commerce website');
  const [context, setContext] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<Set<number>>(new Set());
  const [taskGenLoading, setTaskGenLoading] = useState(false);
  const [batchCreating, setBatchCreating] = useState(false);

  // Feature B State: Prioritization
  const [priorities, setPriorities] = useState<any[]>([]);
  const [prioritizeLoading, setPrioritizeLoading] = useState(false);

  // Feature C State: Summary
  const [summaryReport, setSummaryReport] = useState<any | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Feature D State: Insights
  const [insights, setInsights] = useState<any[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Fetch Projects List
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data;
    },
  });

  // Set default project when loaded
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  // Handle Feature A: Generate Tasks
  const handleGenerateTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    try {
      setTaskGenLoading(true);
      const res = await api.post('/ai/generate-tasks', {
        goal: goal.trim(),
        context: context.trim() || undefined,
      });

      const tasks = res.data.data?.tasks || [];
      setGeneratedTasks(tasks);
      // Select all by default for review
      setSelectedTaskIndices(new Set(tasks.map((_: any, idx: number) => idx)));
      success(`AI generated ${tasks.length} proposed tasks. Review before adding.`);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to generate tasks');
    } finally {
      setTaskGenLoading(false);
    }
  };

  // Toggle selection for task review
  const toggleSelectTask = (index: number) => {
    setSelectedTaskIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Batch Insert Reviewed Tasks into Project
  const handleBatchInsertTasks = async () => {
    if (!selectedProjectId) {
      showError('Please choose a target project');
      return;
    }

    try {
      setBatchCreating(true);
      const toCreate = generatedTasks.filter((_, idx) => selectedTaskIndices.has(idx));

      for (const t of toCreate) {
        await api.post('/tasks', {
          projectId: selectedProjectId,
          title: t.title,
          description: t.description,
          priority: t.priority,
          labels: t.labels || [],
          estimatedHours: t.estimatedHours,
          status: 'todo',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      success(`Successfully added ${toCreate.length} tasks to project!`);
      setGeneratedTasks([]);
      setSelectedTaskIndices(new Set());
    } catch (err: any) {
      showError('Failed to create selected tasks');
    } finally {
      setBatchCreating(false);
    }
  };

  // Handle Feature B: Prioritize Tasks
  const handlePrioritizeTasks = async () => {
    if (!selectedProjectId) return;
    try {
      setPrioritizeLoading(true);
      const res = await api.post('/ai/prioritize-tasks', {
        projectId: selectedProjectId,
      });
      setPriorities(res.data.data?.recommendations || []);
      success('Task workload prioritization analyzed.');
    } catch (err: any) {
      showError('Failed to prioritize tasks');
    } finally {
      setPrioritizeLoading(false);
    }
  };

  // Handle Feature C: Project Summary
  const handleSummarizeProject = async () => {
    if (!selectedProjectId) return;
    try {
      setSummaryLoading(true);
      const res = await api.post('/ai/summarize-project', {
        projectId: selectedProjectId,
      });
      setSummaryReport(res.data.data?.summary || null);
      success('Executive project summary compiled.');
    } catch (err: any) {
      showError('Failed to generate project summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handle Feature D: Fetch Insights
  const handleFetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const res = await api.post('/ai/insights', {
        projectId: selectedProjectId || undefined,
      });
      setInsights(res.data.data?.insights || []);
      success('Productivity insights updated.');
    } catch (err: any) {
      showError('Failed to fetch insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Productivity Assistant
            </h1>
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-bold text-brand-300 border border-brand-500/30">
              Copilot
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Intelligent sprint planning, automated task decomposition, workload ranking, and risk assessment.
          </p>
        </div>

        {/* Target Project Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Target Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-brand-500 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'generate'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ListPlus className="w-4 h-4" />
          <span>Task Decomposition & Generation</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('prioritize');
            if (priorities.length === 0) handlePrioritizeTasks();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'prioritize'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Workload Prioritization</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('summary');
            if (!summaryReport) handleSummarizeProject();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'summary'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sprint & Project Summary</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('insights');
            if (insights.length === 0) handleFetchInsights();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'insights'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Productivity Observations</span>
        </button>
      </div>

      {/* Feature A: Task Generation & Review Panel */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-white mb-1">
              Generate Structured Sprint Deliverables
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter any high-level objective, feature spec, or user story. The AI engine will decompose it into technical tasks with estimates and tags.
            </p>

            <form onSubmit={handleGenerateTasks} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Goal / Requirement *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Build an e-commerce website with Stripe checkout"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Technical Context (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React frontend, Node Express backend, MongoDB Atlas"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Tip: You will be able to review and filter tasks before creating them in the project.
                </span>
                <Button
                  type="submit"
                  isLoading={taskGenLoading}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Generate Tasks
                </Button>
              </div>
            </form>
          </Card>

          {/* Generated Tasks Review Checklist */}
          {generatedTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Review Generated Tasks ({selectedTaskIndices.size}/{generatedTasks.length} Selected)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Select the tasks you wish to insert into "{projects.find((p) => p._id === selectedProjectId)?.name || 'project'}".
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (selectedTaskIndices.size === generatedTasks.length) {
                        setSelectedTaskIndices(new Set());
                      } else {
                        setSelectedTaskIndices(new Set(generatedTasks.map((_, i) => i)));
                      }
                    }}
                  >
                    {selectedTaskIndices.size === generatedTasks.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBatchInsertTasks}
                    isLoading={batchCreating}
                    disabled={selectedTaskIndices.size === 0}
                  >
                    Insert {selectedTaskIndices.size} Tasks
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedTasks.map((t, idx) => {
                  const isChecked = selectedTaskIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectTask(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                        isChecked
                          ? 'bg-slate-900/90 border-brand-500/60 ring-1 ring-brand-500/20'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded border-slate-700 bg-slate-800 text-brand-600 focus:ring-brand-500"
                            />
                            <h5 className="text-sm font-bold text-white leading-snug">{t.title}</h5>
                          </div>
                          <Badge priority={t.priority} size="sm" />
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {t.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                        <div className="flex flex-wrap gap-1">
                          {t.labels?.map((l: string) => (
                            <span
                              key={l}
                              className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                        <span>Est: {t.estimatedHours || 4}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature B: Workload Prioritization */}
      {activeTab === 'prioritize' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                Prioritization Recommendation Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Recommendations computed from deadlines, current status, urgency, and bottleneck risks. Clearly labeled as advisory guidance.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrioritizeTasks}
              isLoading={prioritizeLoading}
            >
              Re-Analyze Workload
            </Button>
          </div>

          <div className="space-y-3">
            {priorities.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-400">{item.key}</span>
                    <h5 className="text-sm font-semibold text-white">{item.title}</h5>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                    <span>Rationale: {item.rationale}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">
                      Urgency Score
                    </div>
                    <div className="font-mono text-base font-bold text-white">{item.score}/100</div>
                  </div>
                  <Badge priority={item.suggestedPriority} size="md" />
                </div>
              </div>
            ))}

            {priorities.length === 0 && !prioritizeLoading && (
              <div className="p-8 text-center text-xs text-slate-400 rounded-xl border border-dashed border-slate-800">
                No active tasks found in this project to analyze.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature C: Sprint & Project Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Executive Progress & Blocker Report</h3>
              <p className="text-xs text-slate-400">
                High-level deliverable status, risk factors, and recommended next sprints.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSummarizeProject}
              isLoading={summaryLoading}
            >
              Re-Generate Report
            </Button>
          </div>

          {summaryReport && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <Card className="p-6">
                <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                  Executive Briefing
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {summaryReport.executiveSummary}
                </p>
              </Card>

              {/* Blockers & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 border-rose-900/40 bg-rose-950/10">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Blockers & Vulnerabilities
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {summaryReport.blockersAndRisks?.map((risk: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Recommendations */}
                <Card className="p-5 border-emerald-900/40 bg-emerald-950/10">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Actionable Next Steps
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {summaryReport.recommendations?.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature D: Productivity Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Live Productivity Observations</h3>
              <p className="text-xs text-slate-400">
                Pattern detection over backlog velocity, workload imbalance, and completion rhythms.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFetchInsights}
              isLoading={insightsLoading}
            >
              Refresh Insights
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((item, idx) => (
              <Card key={idx} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    {item.metric && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-950 text-brand-300 font-bold border border-brand-800/40">
                        {item.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
