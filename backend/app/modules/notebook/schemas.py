"""Notebook module schemas."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ===================== Sources =====================

class SourceResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_url: str
    file_type: str
    file_size: int
    processing_status: str
    upload_time: str
    extracted_text: Optional[str] = None


class SourceListResponse(BaseModel):
    sources: List[SourceResponse]
    total: int


# ===================== Chat =====================

class ChatMessageRequest(BaseModel):
    message: str
    chat_id: Optional[str] = None
    source_ids: List[str] = Field(default_factory=list)


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class ChatResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    messages: List[ChatMessageResponse] = Field(default_factory=list)


class ChatListResponse(BaseModel):
    chats: List[ChatResponse]
    total: int


class RenameChatRequest(BaseModel):
    title: str


# ===================== AI Response =====================

class AIChatResponse(BaseModel):
    message: ChatMessageResponse
    chat_id: str
    chat_title: str


# ===================== Studio =====================

class StudioRequest(BaseModel):
    source_ids: List[str] = Field(default_factory=list)
    action: str  # summary, quiz, faq, infographic, flashcards, study-guide, briefing, exam, podcast


class StudioResponse(BaseModel):
    content: str
    action: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ===================== Settings =====================

class SettingsRequest(BaseModel):
    api_base_url: Optional[str] = None
    api_key: Optional[str] = None
    model_knowledge_chat: Optional[str] = None
    model_audio_transcription: Optional[str] = None
    model_visual_analysis: Optional[str] = None
    model_infographic: Optional[str] = None
    model_embeddings: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


class SettingsResponse(BaseModel):
    api_base_url: str = ""
    api_key_set: bool = False
    model_knowledge_chat: str = "deepseek-ai/DeepSeek-V3.1"
    model_audio_transcription: str = "whisper-large-v3"
    model_visual_analysis: str = "Qwen/Qwen3-VL-235B"
    model_infographic: str = "deepseek-ai/DeepSeek-V3.1"
    model_embeddings: str = "Qwen3-Embedding-8B"
    temperature: float = 0.7
    max_tokens: int = 2048
    whisper_configured: bool = False
    elevenlabs_configured: bool = False


class TestConnectionResponse(BaseModel):
    success: bool
    message: str
    model: Optional[str] = None


# ===================== Notes =====================

class SaveNoteRequest(BaseModel):
    content: str
    source: str = "chat"
    chat_id: Optional[str] = None


class NoteResponse(BaseModel):
    id: str
    content: str
    source: str
    created_at: str


class NoteListResponse(BaseModel):
    notes: List[NoteResponse]
    total: int


# ===================== Voice =====================

class STTResponse(BaseModel):
    text: str


class TTSRequest(BaseModel):
    text: str
    voice_id: str = "CwhRBWXzGAHq8TQ4Fs17"  # Default ElevenLabs voice (Roger)
