export interface TimerEntity {
    name: string;
    description?: string;
    time: number;

    _running?: boolean;
    _lastTickTime?: number;
}