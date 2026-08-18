export declare class SettingsRepository {
    getSetting(platform: string, key: string): Promise<{
        id: string;
        platform: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        description: string | null;
    } | null>;
    setSetting(platform: string, key: string, value: string, description?: string): Promise<{
        id: string;
        platform: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        description: string | null;
    }>;
    getAllSettings(): Promise<{
        id: string;
        platform: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        description: string | null;
    }[]>;
}
//# sourceMappingURL=settings.repository.d.ts.map