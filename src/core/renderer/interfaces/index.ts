export interface TrackRenderer {
  render(
    notes: {
      id: string | number;
      pitch: number;
      velocity: number;
      time: number;
      duration: number;
    }[],
  ): void;

  clear(): void;
}
