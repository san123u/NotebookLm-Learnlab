import { useState, useEffect } from 'react';
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  Zap,
  Type,
  Mic,
  ScanEye,
  Sparkles,
  Database,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import * as notebookApi from '../../services/notebookApi';
import type { NotebookSettings, TestConnectionResult } from '../../services/notebookApi';

export default function NotebookSettingsPage() {
  const [settings, setSettings] = useState<NotebookSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  // Form state
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelKnowledgeChat, setModelKnowledgeChat] = useState('deepseek-ai/DeepSeek-V3.1');
  const [modelAudioTranscription, setModelAudioTranscription] = useState('whisper-large-v3');
  const [modelVisualAnalysis, setModelVisualAnalysis] = useState('Qwen/Qwen3-VL-235B');
  const [modelInfographic, setModelInfographic] = useState('deepseek-ai/DeepSeek-V3.1');
  const [modelEmbeddings, setModelEmbeddings] = useState('Qwen3-Embedding-8B');

  // Original values for reset
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await notebookApi.getSettings();
      setSettings(data);
      applySettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (data: NotebookSettings) => {
    setApiBaseUrl(data.api_base_url);
    setModelKnowledgeChat(data.model_knowledge_chat);
    setModelAudioTranscription(data.model_audio_transcription);
    setModelVisualAnalysis(data.model_visual_analysis);
    setModelInfographic(data.model_infographic);
    setModelEmbeddings(data.model_embeddings);
    setOriginalValues({
      apiBaseUrl: data.api_base_url,
      modelKnowledgeChat: data.model_knowledge_chat,
      modelAudioTranscription: data.model_audio_transcription,
      modelVisualAnalysis: data.model_visual_analysis,
      modelInfographic: data.model_infographic,
      modelEmbeddings: data.model_embeddings,
    });
  };

  const handleReset = () => {
    setApiBaseUrl(originalValues.apiBaseUrl || '');
    setApiKey('');
    setModelKnowledgeChat(originalValues.modelKnowledgeChat || 'deepseek-ai/DeepSeek-V3.1');
    setModelAudioTranscription(originalValues.modelAudioTranscription || 'whisper-large-v3');
    setModelVisualAnalysis(originalValues.modelVisualAnalysis || 'Qwen/Qwen3-VL-235B');
    setModelInfographic(originalValues.modelInfographic || 'deepseek-ai/DeepSeek-V3.1');
    setModelEmbeddings(originalValues.modelEmbeddings || 'Qwen3-Embedding-8B');
    setError('');
    setSaved(false);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await notebookApi.testConnection();
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.detail || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaved(false);
    setTestResult(null);

    if (!apiBaseUrl.trim()) {
      setError('API Base URL is required');
      return;
    }

    setSaving(true);
    try {
      const updates: Record<string, any> = {
        api_base_url: apiBaseUrl.trim(),
        model_knowledge_chat: modelKnowledgeChat.trim(),
        model_audio_transcription: modelAudioTranscription.trim(),
        model_visual_analysis: modelVisualAnalysis.trim(),
        model_infographic: modelInfographic.trim(),
        model_embeddings: modelEmbeddings.trim(),
      };

      if (apiKey) {
        updates.api_key = apiKey;
      }

      const result = await notebookApi.updateSettings(updates);
      setSettings(result);
      applySettings(result);
      setApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Configuration</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage API credentials, API keys, and model mappings.
        </p>
      </div>

      {/* Error/Test Banner */}
      {testResult && !testResult.success && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">AI process failed: {testResult.message}</span>
        </div>
      )}

      {testResult && testResult.success && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-sm text-green-400">Connection successful! Model: {testResult.model}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {saved && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-sm text-green-400">Configuration saved successfully!</span>
        </div>
      )}

      {/* API Credentials Card */}
      <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Credentials</h2>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={testing || !apiBaseUrl}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors text-sm font-medium"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Test Connection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* API Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              AI API Base URL
            </label>
            <input
              type="url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://model.iamsaif.ai/v1"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Leave empty to use default Google Gemini endpoints.
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              API Key
              {settings?.api_key_set && (
                <span className="ml-2 text-xs text-green-500">(configured)</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={settings?.api_key_set ? '••••••••••••••••••••••••' : 'sk-...'}
                className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Model Assignment Card */}
      <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/10">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Model Assignment</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Knowledge Chat */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              <Type className="w-4 h-4" />
              Knowledge Chat
            </label>
            <input
              type="text"
              value={modelKnowledgeChat}
              onChange={(e) => setModelKnowledgeChat(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Used for document Q&A and general queries
            </p>
          </div>

          {/* Audio Transcription */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              <Mic className="w-4 h-4" />
              Audio Transcription
            </label>
            <input
              type="text"
              value={modelAudioTranscription}
              onChange={(e) => setModelAudioTranscription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Used for processing voice recordings and podcasts
            </p>
          </div>

          {/* Visual Analysis (OCR) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              <ScanEye className="w-4 h-4" />
              Visual Analysis (OCR)
            </label>
            <input
              type="text"
              value={modelVisualAnalysis}
              onChange={(e) => setModelVisualAnalysis(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Used for explaining images and diagrams
            </p>
          </div>

          {/* Infographic Generation */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              <Sparkles className="w-4 h-4" />
              Infographic Generation
            </label>
            <input
              type="text"
              value={modelInfographic}
              onChange={(e) => setModelInfographic(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Powering the premium infographic visual engine
            </p>
          </div>

          {/* Embeddings Engine */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              <Database className="w-4 h-4" />
              Embeddings Engine
            </label>
            <input
              type="text"
              value={modelEmbeddings}
              onChange={(e) => setModelEmbeddings(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Critical for document search (RAG) performance
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-50 transition-colors text-sm font-medium shadow-lg shadow-purple-500/20"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Configuration
        </button>
      </div>
    </div>
  );
}
