"""
Notebook API router.

Endpoints for document upload, AI chat, voice, studio actions, settings, and notes.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List
import io

from app.api.deps import get_current_user, require_domain_admin
from app.odm.user import UserDocument
from app.core.config import settings
from app.modules.notebook import service
from app.modules.notebook.schemas import (
    SourceResponse,
    SourceListResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatResponse,
    ChatListResponse,
    AIChatResponse,
    RenameChatRequest,
    StudioRequest,
    StudioResponse,
    SettingsRequest,
    SettingsResponse,
    TestConnectionResponse,
    SaveNoteRequest,
    NoteResponse,
    NoteListResponse,
    STTResponse,
    TTSRequest,
)

router = APIRouter()


def _format_source(src) -> dict:
    return {
        "id": str(src.id),
        "filename": src.filename,
        "original_filename": src.original_filename,
        "file_url": src.file_url,
        "file_type": src.file_type,
        "file_size": src.file_size,
        "processing_status": src.processing_status,
        "upload_time": src.created_at.isoformat(),
        "extracted_text": src.extracted_text,
    }


def _format_message(msg) -> dict:
    return {
        "id": str(msg.id),
        "role": msg.role,
        "content": msg.content,
        "created_at": msg.created_at.isoformat(),
    }


def _format_chat(chat, messages=None) -> dict:
    result = {
        "id": str(chat.id),
        "title": chat.title,
        "created_at": chat.created_at.isoformat(),
        "updated_at": chat.updated_at.isoformat(),
    }
    if messages is not None:
        result["messages"] = [_format_message(m) for m in messages]
    else:
        result["messages"] = []
    return result


# ===================== Sources =====================

@router.post("/sources/upload", response_model=SourceResponse)
async def upload_source(
    file: UploadFile = File(...),
    current_user: UserDocument = Depends(get_current_user),
):
    """Upload a document source."""
    allowed_extensions = {"pdf", "doc", "docx", "ppt", "pptx", "jpg", "jpeg", "png", "gif", "webp", "bmp"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type .{ext} not supported. Allowed: {', '.join(allowed_extensions)}",
        )

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 50MB.",
        )

    source = await service.upload_source(
        user_id=current_user.uuid,
        file_content=content,
        filename=file.filename,
        content_type=file.content_type or "",
    )

    return _format_source(source)


@router.get("/sources", response_model=SourceListResponse)
async def list_sources(current_user: UserDocument = Depends(get_current_user)):
    """List all uploaded sources."""
    sources = await service.get_sources(current_user.uuid)
    return {
        "sources": [_format_source(s) for s in sources],
        "total": len(sources),
    }


@router.delete("/sources/{source_id}")
async def remove_source(
    source_id: str,
    current_user: UserDocument = Depends(get_current_user),
):
    """Delete a source."""
    deleted = await service.delete_source(current_user.uuid, source_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Source not found")
    return {"message": "Source deleted"}


@router.post("/sources/{source_id}/extract")
async def extract_source(
    source_id: str,
    current_user: UserDocument = Depends(get_current_user),
):
    """Extract text from a source document."""
    text = await service.extract_source_text(source_id)
    if text is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return {"text": text}


# ===================== Chat =====================

@router.post("/chat", response_model=AIChatResponse)
async def send_message(
    request: ChatMessageRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Send a message to AI and get a response."""
    result = await service.send_ai_message(
        user_id=current_user.uuid,
        message=request.message,
        chat_id=request.chat_id,
        source_ids=request.source_ids,
    )

    return {
        "message": {
            "id": result.get("message_id", ""),
            "role": "assistant",
            "content": result["content"],
            "created_at": "",
        },
        "chat_id": result.get("chat_id", ""),
        "chat_title": result.get("chat_title", "New Chat"),
    }


@router.get("/chats", response_model=ChatListResponse)
async def list_chats(current_user: UserDocument = Depends(get_current_user)):
    """List all chat sessions."""
    chats = await service.get_chats(current_user.uuid)
    return {
        "chats": [_format_chat(c) for c in chats],
        "total": len(chats),
    }


@router.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: str,
    current_user: UserDocument = Depends(get_current_user),
):
    """Get a chat with all messages."""
    result = await service.get_chat_with_messages(current_user.uuid, chat_id)
    if not result:
        raise HTTPException(status_code=404, detail="Chat not found")
    return _format_chat(result["chat"], result["messages"])


@router.put("/chats/{chat_id}/rename")
async def rename_chat(
    chat_id: str,
    request: RenameChatRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Rename a chat session."""
    success = await service.rename_chat(current_user.uuid, chat_id, request.title)
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Chat renamed"}


@router.delete("/chats/{chat_id}")
async def remove_chat(
    chat_id: str,
    current_user: UserDocument = Depends(get_current_user),
):
    """Delete a chat and its messages."""
    deleted = await service.delete_chat(current_user.uuid, chat_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Chat deleted"}


# ===================== Voice =====================

@router.post("/voice/stt", response_model=STTResponse)
async def speech_to_text(
    file: UploadFile = File(...),
    current_user: UserDocument = Depends(get_current_user),
):
    """Convert speech to text using Whisper API."""
    audio_data = await file.read()

    # Validate: reject empty or suspiciously tiny uploads (< 100 bytes)
    if len(audio_data) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is empty or too small. Please record for longer.",
        )

    # Validate: reject uploads larger than 25 MB (Whisper limit)
    if len(audio_data) > 25 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file too large. Maximum size is 25 MB.",
        )

    try:
        text = await service.speech_to_text(audio_data, file.filename or "audio.webm")
        return {"text": text}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Speech-to-text service error: {str(e)}",
        )


@router.post("/voice/tts")
async def text_to_speech(
    request: TTSRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Convert text to speech using ElevenLabs API."""
    try:
        audio_bytes = await service.text_to_speech(request.text, request.voice_id)
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Content-Length": str(len(audio_bytes)),
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Text-to-speech service error: {str(e)}",
        )


# ===================== Studio =====================

@router.post("/studio", response_model=StudioResponse)
async def run_studio_action(
    request: StudioRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Run a studio action (summary, quiz, FAQ, etc.)."""
    result = await service.run_studio_action(
        user_id=current_user.uuid,
        action=request.action,
        source_ids=request.source_ids,
    )

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["content"])

    return {
        "content": result["content"],
        "action": request.action,
        "metadata": {},
    }


# ===================== Settings (Admin Only) =====================

def _format_settings(s) -> dict:
    return {
        "api_base_url": s.api_base_url,
        "api_key_set": bool(s.api_key),
        "model_knowledge_chat": s.model_knowledge_chat,
        "model_audio_transcription": s.model_audio_transcription,
        "model_visual_analysis": s.model_visual_analysis,
        "model_infographic": s.model_infographic,
        "model_embeddings": s.model_embeddings,
        "temperature": s.temperature,
        "max_tokens": s.max_tokens,
        "whisper_configured": bool(getattr(settings, "WHISPER_API_KEY", "")),
        "elevenlabs_configured": bool(getattr(settings, "ELEVENLABS_API_KEY", "")),
    }


@router.get("/settings", response_model=SettingsResponse)
async def get_settings(current_user: UserDocument = Depends(get_current_user)):
    """Get global AI settings."""
    s = await service.get_global_settings()
    return _format_settings(s)


@router.put("/settings", response_model=SettingsResponse)
async def update_settings(
    request: SettingsRequest,
    current_user: UserDocument = Depends(require_domain_admin),
):
    """Update global AI settings (admin only)."""
    updates = request.model_dump(exclude_none=True)
    s = await service.update_global_settings(updates)
    return _format_settings(s)


@router.post("/settings/test-connection", response_model=TestConnectionResponse)
async def test_api_connection(
    current_user: UserDocument = Depends(require_domain_admin),
):
    """Test AI API connection (admin only)."""
    result = await service.test_connection()
    return result


# ===================== Notes =====================

@router.post("/notes", response_model=NoteResponse)
async def create_note(
    request: SaveNoteRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Save a note."""
    note = await service.save_note(
        user_id=current_user.uuid,
        content=request.content,
        source=request.source,
        chat_id=request.chat_id,
    )
    return {
        "id": str(note.id),
        "content": note.content,
        "source": note.source,
        "created_at": note.created_at.isoformat(),
    }


@router.get("/notes", response_model=NoteListResponse)
async def list_notes(current_user: UserDocument = Depends(get_current_user)):
    """List all saved notes."""
    notes = await service.get_notes(current_user.uuid)
    return {
        "notes": [
            {
                "id": str(n.id),
                "content": n.content,
                "source": n.source,
                "created_at": n.created_at.isoformat(),
            }
            for n in notes
        ],
        "total": len(notes),
    }


@router.delete("/notes/{note_id}")
async def remove_note(
    note_id: str,
    current_user: UserDocument = Depends(get_current_user),
):
    """Delete a note."""
    deleted = await service.delete_note(current_user.uuid, note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted"}
