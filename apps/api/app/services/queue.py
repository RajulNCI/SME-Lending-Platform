"""
queue — job queue abstraction.

Local dev uses InMemoryJobQueue (no infrastructure needed).
Production uses SQSJobQueue — swapped in automatically when AWS_SQS_QUEUE_URL is set.

Message format (JSON string) shared by both backends and the Lambda handler:
  {
    "job_id": "<processing_job uuid>",
    "application_id": "<application uuid>",
    "s3_document_keys": ["documents/<app_id>/file.pdf", ...]
  }
"""

from __future__ import annotations

import asyncio
import json
from typing import Protocol


class JobQueue(Protocol):
    async def enqueue(self, message: dict) -> None: ...
    async def dequeue(self) -> dict: ...


class InMemoryJobQueue:
    """Async FIFO queue for local / single-node runs and tests."""

    def __init__(self) -> None:
        self._q: asyncio.Queue[dict] = asyncio.Queue()

    async def enqueue(self, message: dict) -> None:
        await self._q.put(message)

    async def dequeue(self) -> dict:
        return await self._q.get()

    def task_done(self) -> None:
        self._q.task_done()

    def qsize(self) -> int:
        return self._q.qsize()


class SQSJobQueue:
    """Amazon SQS backend (production)."""

    def __init__(self, queue_url: str, region: str = "us-east-1") -> None:
        import boto3

        self._sqs = boto3.client("sqs", region_name=region)
        self._url = queue_url

    async def enqueue(self, message: dict) -> None:
        body = json.dumps(message)
        await asyncio.to_thread(
            self._sqs.send_message, QueueUrl=self._url, MessageBody=body
        )

    async def dequeue(self) -> dict:
        while True:
            resp = await asyncio.to_thread(
                self._sqs.receive_message,
                QueueUrl=self._url,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=10,
            )
            msgs = resp.get("Messages", [])
            if msgs:
                m = msgs[0]
                await asyncio.to_thread(
                    self._sqs.delete_message,
                    QueueUrl=self._url,
                    ReceiptHandle=m["ReceiptHandle"],
                )
                return json.loads(m["Body"])


def _build_queue() -> InMemoryJobQueue | SQSJobQueue:
    """Auto-select backend based on environment."""
    try:
        from app.core.config import settings
        if settings.AWS_SQS_QUEUE_URL:
            return SQSJobQueue(settings.AWS_SQS_QUEUE_URL, settings.AWS_REGION)
    except Exception:
        pass
    return InMemoryJobQueue()


job_queue: InMemoryJobQueue | SQSJobQueue = _build_queue()
