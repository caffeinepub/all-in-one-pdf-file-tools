import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ToolUsage {
    timestamp: Time;
    toolName: string;
}
export type Time = bigint;
export interface backendInterface {
    getAllPreferences(): Promise<Array<string>>;
    getHistory(): Promise<Array<ToolUsage>>;
    hasPreference(pref: string): Promise<boolean>;
    logToolUsage(toolName: string): Promise<void>;
    togglePreference(pref: string): Promise<void>;
}
