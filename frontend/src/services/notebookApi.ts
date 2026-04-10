/**
 * Notebook API service layer.
 * Handles all API calls for the notebook system.
 */

import api from '../lib/api';

// ===================== Sources =====================

export interface Source {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  processing_status: string;
  upload_time: string;
  extracted_text?: string;
}

export const uploadSource = async (file: File): Promise<Source> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/notebook/sources/upload', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data;
};

export const getSources = async (): Promise<{ sources: Source[]; total: number }> => {
  const { data } = await api.get('/notebook/sources');
  return data;
};

export const deleteSource = async (sourceId: string): Promise<void> => {
  await api.delete(`/notebook/sources/${sourceId}`);
};

export const extractSource = async (sourceId: string): Promise<{ text: string }> => {
  const { data } = await api.post(`/notebook/sources/${sourceId}/extract`);
  return data;
};

// ===================== Chat =====================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface AIChatResponse {
  message: ChatMessage;
  chat_id: string;
  chat_title: string;
}

export const sendMessage = async (
  message: string,
  chatId?: string,
  sourceIds?: string[]
): Promise<AIChatResponse> => {
  const { data } = await api.post('/notebook/chat', {
    message,
    chat_id: chatId,
    source_ids: sourceIds || [],
  });
  return data;
};

export const getChats = async (): Promise<{ chats: Chat[]; total: number }> => {
  const { data } = await api.get('/notebook/chats');
  return data;
};

export const getChat = async (chatId: string): Promise<Chat> => {
  const { data } = await api.get(`/notebook/chats/${chatId}`);
  return data;
};

export const renameChat = async (chatId: string, title: string): Promise<void> => {
  await api.put(`/notebook/chats/${chatId}/rename`, { title });
};

export const deleteChat = async (chatId: string): Promise<void> => {
  await api.delete(`/notebook/chats/${chatId}`);
};

// ===================== Voice =====================

export const speechToText = async (
  audioBlob: Blob,
  filename: string = 'recording.webm'
): Promise<{ text: string }> => {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  // Delete Content-Type so the browser auto-generates the correct
  // multipart/form-data boundary. The axios instance default of
  // 'application/json' would otherwise break FastAPI's file parsing.
  const { data } = await api.post('/notebook/voice/stt', formData, {
    timeout: 30000,
    headers: { 'Content-Type': undefined },
  });
  return data;
};

export const textToSpeech = async (text: string, voiceId?: string): Promise<Blob> => {
  const { data } = await api.post(
    '/notebook/voice/tts',
    { text, voice_id: voiceId || 'CwhRBWXzGAHq8TQ4Fs17' },
    { responseType: 'blob', timeout: 120000 }
  );
  return data;
};

// ===================== Studio =====================

export interface StudioResult {
  content: string;
  action: string;
  metadata: Record<string, unknown>;
}

export const runStudioAction = async (
  action: string,
  sourceIds: string[]
): Promise<StudioResult> => {
  const { data } = await api.post('/notebook/studio', {
    action,
    source_ids: sourceIds,
  });
  return data;
};

// ===================== Settings =====================

export interface NotebookSettings {
  api_base_url: string;
  api_key_set: boolean;
  model_knowledge_chat: string;
  model_audio_transcription: string;
  model_visual_analysis: string;
  model_infographic: string;
  model_embeddings: string;
  temperature: number;
  max_tokens: number;
  whisper_configured: boolean;
  elevenlabs_configured: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  model?: string;
}

export const getSettings = async (): Promise<NotebookSettings> => {
  const { data } = await api.get('/notebook/settings');
  return data;
};

export const updateSettings = async (settings: {
  api_base_url?: string;
  api_key?: string;
  model_knowledge_chat?: string;
  model_audio_transcription?: string;
  model_visual_analysis?: string;
  model_infographic?: string;
  model_embeddings?: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<NotebookSettings> => {
  const { data } = await api.put('/notebook/settings', settings);
  return data;
};

export const testConnection = async (): Promise<TestConnectionResult> => {
  const { data } = await api.post('/notebook/settings/test-connection');
  return data;
};

// ===================== Notes =====================

export interface Note {
  id: string;
  content: string;
  source: string;
  created_at: string;
}

export const saveNote = async (
  content: string,
  source?: string,
  chatId?: string
): Promise<Note> => {
  const { data } = await api.post('/notebook/notes', {
    content,
    source: source || 'chat',
    chat_id: chatId,
  });
  return data;
};

export const getNotes = async (): Promise<{ notes: Note[]; total: number }> => {
  const { data } = await api.get('/notebook/notes');
  return data;
};

export const deleteNote = async (noteId: string): Promise<void> => {
  await api.delete(`/notebook/notes/${noteId}`);
};
