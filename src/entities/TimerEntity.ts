export interface TimerEntity {
    name: string;
    description?: string;
    time: number;
    archived: boolean;

    _running?: boolean;
    _lastTickTime?: number;
}