import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface MidiNote {
  id: string;
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

interface PianoRollConfig {
  pitchRange: [number, number];
  semitoneHeight: number;
  keyboardWidth: number;
  timeScale: number;
  scrollX: number;
  theme: {
    background: string;
    gridLine: string;
    whiteKey: string;
    blackKey: string;
    noteColor: string;
    noteBorder: string;
  };
}

interface DAWRenderer {
  render(notes: MidiNote[]): void;
  clearCanvas(): void;
}

class PianoRollRenderer implements DAWRenderer {
  private readonly blackKeys = new Set([1, 3, 6, 8, 10]);

  constructor(
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    private config: PianoRollConfig,
  ) {}

  public updateConfig(newConfig: Partial<PianoRollConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public render(notes: MidiNote[]) {
    this.clearCanvas();
    this.drawGrid();
    this.drawNotes(notes);
    this.drawKeyboard();
  }

  public clearCanvas() {
    this.ctx.fillStyle = this.config.theme.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private getYForPitch(pitch: number): number {
    const [, maxPitch] = this.config.pitchRange;
    return (maxPitch - pitch) * this.config.semitoneHeight;
  }

  private isBlackKey(pitch: number): boolean {
    return this.blackKeys.has(pitch % 12);
  }

  private drawGrid() {
    this.ctx.strokeStyle = this.config.theme.gridLine;
    this.ctx.lineWidth = 1;

    const [minPitch, maxPitch] = this.config.pitchRange;

    for (let pitch = minPitch; pitch <= maxPitch; pitch++) {
      const y = this.getYForPitch(pitch);

      this.ctx.beginPath();
      this.ctx.moveTo(this.config.keyboardWidth, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();

      if (this.isBlackKey(pitch)) {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.fillRect(
          this.config.keyboardWidth,
          y,
          this.width - this.config.keyboardWidth,
          this.config.semitoneHeight,
        );
      }
    }
  }

  private drawNotes(notes: MidiNote[]) {
    const [minPitch, maxPitch] = this.config.pitchRange;

    for (const note of notes) {
      if (note.pitch < minPitch || note.pitch > maxPitch) continue;

      const x =
        this.config.keyboardWidth +
        (note.start - this.config.scrollX) * this.config.timeScale;
      const y = this.getYForPitch(note.pitch);
      const w = note.duration * this.config.timeScale;
      const h = this.config.semitoneHeight;

      if (x + w < this.config.keyboardWidth || x > this.width) continue;

      this.ctx.fillStyle = this.config.theme.noteColor;
      this.ctx.fillRect(x, y + 1, w, h - 2);

      this.ctx.strokeStyle = this.config.theme.noteBorder;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y + 1, w, h - 2);
    }
  }

  private drawKeyboard() {
    const { keyboardWidth, semitoneHeight, pitchRange, theme } = this.config;
    const [minPitch, maxPitch] = pitchRange;

    this.ctx.fillStyle = theme.background;
    this.ctx.fillRect(0, 0, keyboardWidth, this.height);
    this.ctx.strokeStyle = theme.gridLine;
    this.ctx.beginPath();
    this.ctx.moveTo(keyboardWidth, 0);
    this.ctx.lineTo(keyboardWidth, this.height);
    this.ctx.stroke();

    for (let pitch = minPitch; pitch <= maxPitch; pitch++) {
      if (!this.isBlackKey(pitch)) {
        const y = this.getYForPitch(pitch);
        this.ctx.fillStyle = theme.whiteKey;
        this.ctx.fillRect(0, y, keyboardWidth, semitoneHeight);

        this.ctx.strokeStyle = "#ccc";
        this.ctx.strokeRect(0, y, keyboardWidth, semitoneHeight);
      }
    }

    const blackKeyWidth = keyboardWidth * 0.6;
    for (let pitch = minPitch; pitch <= maxPitch; pitch++) {
      if (this.isBlackKey(pitch)) {
        const y = this.getYForPitch(pitch);
        this.ctx.fillStyle = theme.blackKey;

        const padding = 2;
        this.ctx.fillRect(
          0,
          y + padding,
          blackKeyWidth,
          semitoneHeight - padding * 2,
        );
      }
    }
  }
}

const DEFAULT_CONFIG: PianoRollConfig = {
  pitchRange: [48, 83],
  semitoneHeight: 16,
  keyboardWidth: 64,
  timeScale: 100,
  scrollX: 0,
  theme: {
    background: "#1E1E2E",
    gridLine: "#313244",
    whiteKey: "#CDD6F4",
    blackKey: "#11111B",
    noteColor: "#89B4FA",
    noteBorder: "#B4BEFE",
  },
};

export interface PianoRollVisualizerProps {
  width: number;
  configOverrides?: Partial<PianoRollConfig>;
  initialNotes?: MidiNote[];
}

export interface PianoRollRef {
  updateScroll: (newScrollX: number) => void;
  updateNotes: (notes: MidiNote[]) => void;
}

export const PianoRollVisualizer = forwardRef<
  PianoRollRef,
  PianoRollVisualizerProps
>(({ width, configOverrides, initialNotes = [] }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PianoRollRenderer | null>(null);
  const noteRef = useRef<MidiNote[]>(initialNotes);

  const config = { ...DEFAULT_CONFIG, ...configOverrides };
  const totalPitches = config.pitchRange[1] - config.pitchRange[0] + 1;
  const canvasHeight = totalPitches * config.semitoneHeight;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(dpr, dpr);

    rendererRef.current = new PianoRollRenderer(
      ctx,
      width,
      canvasHeight,
      config,
    );
    rendererRef.current.render(noteRef.current);
  }, [width, canvasHeight]);

  useImperativeHandle(ref, () => ({
    updateScroll: (newScrollX: number) => {
      if (!rendererRef.current) return;
      rendererRef.current.updateConfig({ scrollX: newScrollX });
      rendererRef.current.render(noteRef.current);
    },
    updateNotes: (newNotes: MidiNote[]) => {
      if (!rendererRef.current) return;
      noteRef.current = newNotes;
      rendererRef.current.render(noteRef.current);
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={canvasHeight}
      className="bg-red-500"
      style={{
        display: "block",
        backgroundColor: config.theme.background,
        border: `1px solid ${config.theme.gridLine}`,
      }}
    />
  );
});

PianoRollVisualizer.displayName = "PianoRollVisualizer";
