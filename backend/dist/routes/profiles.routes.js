"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicHandlers = void 0;
// src/routes/profiles.routes.ts
const express_1 = require("express");
const profile_repository_1 = require("../repositories/profile.repository");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
const profileRepo = new profile_repository_1.ProfileRepository();
exports.dynamicHandlers = {
    processProfile: null,
    scanProfile: null,
};
// GET /api/profiles
router.get('/', async (_req, res) => {
    try {
        const profiles = await profileRepo.findAll();
        res.json((0, types_1.ok)(profiles));
    }
    catch (err) {
        logger_1.default.error('GET /profiles', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch profiles'));
    }
});
// GET /api/profiles/:id
router.get('/:id', async (req, res) => {
    try {
        const profile = await profileRepo.findById(req.params['id']);
        if (!profile) {
            res.status(404).json((0, types_1.fail)('Profile not found'));
            return;
        }
        res.json((0, types_1.ok)(profile));
    }
    catch (err) {
        logger_1.default.error(`GET /profiles/${req.params['id']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch profile'));
    }
});
// POST /api/profiles
router.post('/', async (req, res) => {
    const { platform, platformId, username, displayName, bio, followerCount, followingCount, profilePicUrl } = req.body;
    if (!platform || !platformId || !username) {
        res.status(400).json((0, types_1.fail)('platform, platformId, and username are required'));
        return;
    }
    try {
        const profile = await profileRepo.create({
            platform: String(platform),
            platformId: String(platformId),
            username: String(username),
            displayName: displayName ? String(displayName) : undefined,
            bio: bio ? String(bio) : undefined,
            followerCount: typeof followerCount === 'number' ? followerCount : undefined,
            followingCount: typeof followingCount === 'number' ? followingCount : undefined,
            profilePicUrl: profilePicUrl ? String(profilePicUrl) : undefined,
        });
        res.status(201).json((0, types_1.ok)(profile));
    }
    catch (err) {
        logger_1.default.error('POST /profiles', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to create profile'));
    }
});
// PATCH /api/profiles/:id
router.patch('/:id', async (req, res) => {
    try {
        const profile = await profileRepo.update(req.params['id'], req.body);
        res.json((0, types_1.ok)(profile));
    }
    catch (err) {
        logger_1.default.error(`PATCH /profiles/${req.params['id']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to update profile'));
    }
});
// DELETE /api/profiles/:id
router.delete('/:id', async (req, res) => {
    try {
        await profileRepo.softDelete(req.params['id']);
        res.json((0, types_1.ok)({ deleted: true }));
    }
    catch (err) {
        logger_1.default.error(`DELETE /profiles/${req.params['id']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to delete profile'));
    }
});
// POST /api/profiles/:id/process
router.post('/:id/process', async (req, res) => {
    if (!exports.dynamicHandlers.processProfile) {
        res.status(501).json((0, types_1.fail)('Pipeline orchestrator not yet wired'));
        return;
    }
    try {
        const result = await exports.dynamicHandlers.processProfile(req.params['id']);
        res.json((0, types_1.ok)(result));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json((0, types_1.fail)(message));
    }
});
// POST /api/profiles/:id/scan  (scrape new posts then run full pipeline)
router.post('/:id/scan', async (req, res) => {
    if (!exports.dynamicHandlers.scanProfile) {
        res.status(503).json((0, types_1.fail)('Scan orchestrator not yet wired — retry in a moment'));
        return;
    }
    try {
        const result = await exports.dynamicHandlers.scanProfile(req.params['id']);
        res.json((0, types_1.ok)(result));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.default.error(`POST /profiles/${req.params['id']}/scan`, { error: message });
        res.status(500).json((0, types_1.fail)(message));
    }
});
exports.default = router;
//# sourceMappingURL=profiles.routes.js.map