"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRepository = void 0;
// src/repositories/job.repository.ts
const firebase_1 = require("../firebase");
const crypto_1 = require("crypto");
const JOBS_COL = 'scheduledJobs';
const HISTORY_COL = 'jobHistory';
const RUNS_COL = 'schedulerRuns';
class JobRepository {
    async createScheduledJob(data) {
        const id = (0, crypto_1.randomUUID)();
        const doc = { ...data };
        await firebase_1.db.collection(JOBS_COL).doc(id).set(doc);
        return { id, ...doc };
    }
    async updateScheduledJob(id, data) {
        await firebase_1.db.collection(JOBS_COL).doc(id).update(data);
        const updated = await this.findScheduledJobById(id);
        return updated;
    }
    async findScheduledJobById(id) {
        const doc = await firebase_1.db.collection(JOBS_COL).doc(id).get();
        if (!doc.exists)
            return null;
        const d = doc.data();
        return {
            id: doc.id,
            name: d['name'],
            status: d['status'],
            scheduledAt: d['scheduledAt']?.toDate?.() ?? new Date(d['scheduledAt']),
            metadata: d['metadata'],
        };
    }
    async findScheduledJobs(status) {
        let q = firebase_1.db.collection(JOBS_COL);
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
    async createJobHistory(data) {
        const id = (0, crypto_1.randomUUID)();
        const doc = { ...data };
        await firebase_1.db.collection(HISTORY_COL).doc(id).set(doc);
        return { id, ...doc };
    }
    async findJobHistory(limitCount = 50) {
        const snap = await firebase_1.db.collection(HISTORY_COL)
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
    async createSchedulerRun(name) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date();
        const doc = { name, status: 'started', startedAt: now };
        await firebase_1.db.collection(RUNS_COL).doc(id).set(doc);
        return { id, ...doc };
    }
    async finishSchedulerRun(id, status) {
        const now = new Date();
        await firebase_1.db.collection(RUNS_COL).doc(id).update({ status, finishedAt: now });
        const doc = await firebase_1.db.collection(RUNS_COL).doc(id).get();
        const d = doc.data();
        return {
            id: doc.id,
            name: d['name'],
            status: d['status'],
            startedAt: d['startedAt']?.toDate?.() ?? new Date(d['startedAt']),
            finishedAt: d['finishedAt']?.toDate?.() ?? new Date(d['finishedAt']),
        };
    }
    async findSchedulerRuns(limitCount = 20) {
        const snap = await firebase_1.db.collection(RUNS_COL)
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
exports.JobRepository = JobRepository;
//# sourceMappingURL=job.repository.js.map