export class TimerEntity {
    public name: string;
    public time: number;

    public constructor(name: string, time: number) {
        this.name = name;
        this.time = time;
    }
}