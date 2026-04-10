"""
Notebook system document models.

Models for sources, chats, messages, settings, and notes.
"""

from typing import Optional, List, Dict, Any, ClassVar
from datetime import datetime
from pydantic import Field
from app.odm.document import Document


class NotebookSourceDocument(Document):
    """Uploaded document/source for notebook."""
    __collection_name__: ClassVar[str] = "notebook_sources"

    user_id: str = ""
    filename: str = ""
    original_filename: str = ""
    file_url: str = ""
    file_type: str = ""  # pdf, docx, pptx, image
    file_size: int = 0
    processing_status: str = "uploaded"  # uploaded, processing, ready, error
    extracted_text: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ChatMessageModel(Document):
    """Individual chat message within a chat session."""
    __collection_name__: ClassVar[str] = "notebook_messages"

    chat_id: str = ""
    user_id: str = ""
    role: str = "user"  # user, assistant, system
    content: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)


class NotebookChatDocument(Document):
    """Chat session for notebook."""
    __collection_name__: ClassVar[str] = "notebook_chats"

    user_id: str = ""
    title: str = "New Chat"
    source_ids: List[str] = Field(default_factory=list)
    is_active: bool = True


class NotebookSettingsDocument(Document):
    """Global AI settings for notebook (admin-configured)."""
    __collection_name__: ClassVar[str] = "notebook_settings"

    # Global singleton - use settings_key="global" to find
    settings_key: str = "global"

    # API Credentials
    api_base_url: str = ""
    api_key: str = ""

    # Model Assignments
    model_knowledge_chat: str = "deepseek-ai/DeepSeek-V3.1"
    model_audio_transcription: str = "whisper-large-v3"
    model_visual_analysis: str = "Qwen/Qwen3-VL-235B"
    model_infographic: str = "deepseek-ai/DeepSeek-V3.1"
    model_embeddings: str = "Qwen3-Embedding-8B"

    # General
    temperature: float = 0.7
    max_tokens: int = 2048


class NotebookNoteDocument(Document):
    """Saved notes from AI responses."""
    __collection_name__: ClassVar[str] = "notebook_notes"

    user_id: str = ""
    content: str = ""
    source: str = ""  # Which studio action generated it
    chat_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
