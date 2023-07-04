export interface TimerEntity {
    name: string;
    description?: string;
    referenceDate?: number;
    
    time: number;
    archived: boolean;

    _running?: boolean;
    _lastTickTime?: number;
}