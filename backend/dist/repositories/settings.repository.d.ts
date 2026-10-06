export interface PlatformSettingDoc {
    id: string;
    platform: string;
    key: string;
    value: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class SettingsRepository {
    getSetting(platform: string, key: string): Promise<PlatformSettingDoc | null>;
    setSetting(platform: string, key: string, value: string, description?: string): Promise<PlatformSettingDoc>;
    getAllSettings(): Promise<PlatformSettingDoc[]>;
}
//# sourceMappingURL=settings.repository.d.ts.map