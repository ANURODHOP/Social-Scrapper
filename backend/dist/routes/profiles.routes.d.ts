declare const router: import("express-serve-static-core").Router;
export declare const dynamicHandlers: {
    processProfile: ((id: string) => Promise<unknown>) | null;
    scanProfile: ((id: string) => Promise<unknown>) | null;
};
export default router;
//# sourceMappingURL=profiles.routes.d.ts.map