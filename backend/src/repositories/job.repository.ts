// src/repositories/job.repository.ts
import { db } from '../firebase';
import { randomUUID } from 'crypto';

const JOBS_COL = 'scheduledJobs';
const HISTORY_COL = 'jobHistory';
const RUNS_COL = 'schedulerRuns';

export interface ScheduledJobDoc {
  id: string;
  name: string;
  status: string;
  scheduledAt: Date;
  metadata?: any;
}

export interface JobHistoryDoc {
  id: string;
  name: string;
  status: string;
  startedAt: Date;
  finishedAt: Date;
  error?: string | null;
}

export interface SchedulerRunDoc {
  id: string;
  name: string;
  status: 'started' | 'completed' | 'failed';
  startedAt: Date;
  finishedAt?: Date | null;
}

export class JobRepository {
  async createScheduledJob(data: Omit<ScheduledJobDoc, 'id'>): Promise<ScheduledJobDoc> {
    const id = randomUUID();
    const doc = { ...data };
    await db.collection(JOBS_COL).doc(id).set(doc);
    return { id, ...doc };
  }

  async updateScheduledJob(id: string, data: Partial<Omit<ScheduledJobDoc, 'id'>>): Promise<ScheduledJobDoc> {
    await db.collection(JOBS_COL).doc(id).update(data);
    const updated = await this.findScheduledJobById(id);
    return updated!;
  }

  async findScheduledJobById(id: string): Promise<ScheduledJobDoc | null> {
    const doc = await db.collection(JOBS_COL).doc(id).get();
    if (!doc.exists) return null;
    const d = doc.data()!;
    return {
      id: doc.id,
      name: d['name'],
      status: d['status'],
      scheduledAt: d['scheduledAt']?.toDate?.() ?? new Date(d['scheduledAt']),
      metadata: d['metadata'],
    };
  }

  async findScheduledJobs(status?: string): Promise<ScheduledJobDoc[]> {
    let q: FirebaseFirestore.Query = db.collection(JOBS_COL);
    if (status) {
      q = q.where('status', '==', status);
    }
    q = q.orderBy('scheduledAt', 'desc').limit(100);
    const snap = await q.get();
    return snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d['name'],
        status: d['status'],
        scheduledAt: d['scheduledAt']?.toDate?.() ?? new Date(d['scheduledAt']),
        metadata: d['metadata'],
      };
    });
  }

  async createJobHistory(data: Omit<JobHistoryDoc, 'id'>): Promise<JobHistoryDoc> {
    const id = randomUUID();
    const doc = { ...data };
    await db.collection(HISTORY_COL).doc(id).set(doc);
    return { id, ...doc };
  }

  async findJobHistory(limitCount = 50): Promise<JobHistoryDoc[]> {
    const snap = await db.collection(HISTORY_COL)
      .orderBy('finishedAt', 'desc')
      .limit(limitCount)
      .get();
    return snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d['name'],
        status: d['status'],
        startedAt: d['startedAt']?.toDate?.() ?? new Date(d['startedAt']),
        finishedAt: d['finishedAt']?.toDate?.() ?? new Date(d['finishedAt']),
        error: d['error'] ?? null,
      };
    });
  }

  async createSchedulerRun(name: string): Promise<SchedulerRunDoc> {
    const id = randomUUID();
    const now = new Date();
    const doc = { name, status: 'started' as const, startedAt: now };
    await db.collection(RUNS_COL).doc(id).set(doc);
    return { id, ...doc };
  }

  async finishSchedulerRun(id: string, status: 'completed' | 'failed'): Promise<SchedulerRunDoc> {
    const now = new Date();
    await db.collection(RUNS_COL).doc(id).update({ status, finishedAt: now });
    const doc = await db.collection(RUNS_COL).doc(id).get();
    const d = doc.data()!;
    return {
      id: doc.id,
      name: d['name'],
      status: d['status'],
      startedAt: d['startedAt']?.toDate?.() ?? new Date(d['startedAt']),
      finishedAt: d['finishedAt']?.toDate?.() ?? new Date(d['finishedAt']),
    };
  }

  async findSchedulerRuns(limitCount = 20): Promise<SchedulerRunDoc[]> {
    const snap = await db.collection(RUNS_COL)
      .orderBy('startedAt', 'desc')
      .limit(limitCount)
      .get();
    return snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d['name'],
        status: d['status'],
        startedAt: d['startedAt']?.toDate?.() ?? new Date(d['startedAt']),
        finishedAt: d['finishedAt'] ? (d['finishedAt']?.toDate?.() ?? new Date(d['finishedAt'])) : null,
      };
    });
  }
}
