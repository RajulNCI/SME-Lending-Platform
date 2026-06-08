"""
queue — job queue abstraction (mirrors the team HLD's SQS).

The default in-process backend lets the platform run end-to-end with no infrastructure. Swap in
`SQSJobQueue` (Amazon SQS) for production by setting the backend — the worker code is unchanged.
"""
from __future__ import annotations
import asyncio
from typing import Protocol


class JobQueue(Protocol):
    async def enqueue(self, job_id: str) -> None: ...
    async def dequeue(self) -> str: ...


class InMemoryJobQueue:
    """Async FIFO queue for local / single-node runs and tests."""
    def __init__(self) -> None:
        self._q: asyncio.Queue[str] = asyncio.Queue()

    async def enqueue(self, job_id: str) -> None:
        await self._q.put(job_id)

    async def dequeue(self) -> str:
        return await self._q.get()

    def task_done(self) -> None:
        self._q.task_done()

    def qsize(self) -> int:
        return self._q.qsize()


class SQSJobQueue:
    """Amazon SQS backend (production). Requires boto3 + a queue URL."""
    def __init__(self, queue_url: str, region: str = "eu-west-1") -> None:
        import boto3
        self._sqs = boto3.client("sqs", region_name=region)
        self._url = queue_url

    async def enqueue(self, job_id: str) -> None:
        await asyncio.to_thread(
            self._sqs.send_message, QueueUrl=self._url, MessageBody=job_id)

    async def dequeue(self) -> str:
        while True:
            resp = await asyncio.to_thread(
                self._sqs.receive_message, QueueUrl=self._url,
                MaxNumberOfMessages=1, WaitTimeSeconds=10)
            msgs = resp.get("Messages", [])
            if msgs:
                m = msgs[0]
                await asyncio.to_thread(
                    self._sqs.delete_message, QueueUrl=self._url,
                    ReceiptHandle=m["ReceiptHandle"])
                return m["Body"]


# default backend (in-process). Replace with SQSJobQueue(...) in production config.
job_queue: JobQueue = InMemoryJobQueue()
