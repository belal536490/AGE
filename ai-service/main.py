from __future__ import annotations

from pathlib import Path
from typing import List

import librosa
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from scenedetect import ContentDetector, SceneManager, open_video

app = FastAPI(title="ClipForge AI Detection Service")


class DetectRequest(BaseModel):
    videoPath: str = Field(..., description="Local path mounted into the AI service container")
    targetSeconds: int = Field(20, ge=5, le=60)


class Segment(BaseModel):
    start: float
    end: float


class DetectResponse(BaseModel):
    segments: List[Segment]


def _scene_points(video_path: str) -> list[float]:
    video = open_video(video_path)
    manager = SceneManager()
    manager.add_detector(ContentDetector(threshold=27.0))
    manager.detect_scenes(video)
    return [scene[1].get_seconds() for scene in manager.get_scene_list()]


def _silence_points(video_path: str) -> list[float]:
    y, sr = librosa.load(video_path, sr=22050, mono=True)
    intervals = librosa.effects.split(y, top_db=30)
    points: list[float] = []
    for start, end in intervals:
        start_s = float(start / sr)
        end_s = float(end / sr)
        if end_s - start_s > 1:
            points.append(start_s)
            points.append(end_s)
    return points


def _normalize(points: list[float], duration: float, target: int) -> list[Segment]:
    clean = sorted({round(point, 2) for point in points if 3 < point < duration - 3})
    boundaries = [0.0]
    for point in clean:
        if point - boundaries[-1] >= 5:
            boundaries.append(point)
    cursor = boundaries[-1]
    while duration - cursor > target * 1.5:
        cursor += target
        boundaries.append(round(cursor, 2))
    boundaries.append(round(duration, 2))

    segments: list[Segment] = []
    for start, end in zip(boundaries, boundaries[1:]):
        cursor = start
        while end - cursor > 60:
            segments.append(Segment(start=round(cursor, 2), end=round(cursor + 60, 2)))
            cursor += 60
        if end - cursor >= 5:
            segments.append(Segment(start=round(cursor, 2), end=round(end, 2)))
    return segments[:40]


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/detect", response_model=DetectResponse)
def detect(request: DetectRequest) -> DetectResponse:
    video_path = Path(request.videoPath)
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video path is not available to the AI service")

    duration = float(librosa.get_duration(path=str(video_path)))
    points = _scene_points(str(video_path)) + _silence_points(str(video_path))
    if not points:
        points = list(np.arange(request.targetSeconds, duration, request.targetSeconds))
    return DetectResponse(segments=_normalize(points, duration, request.targetSeconds))
