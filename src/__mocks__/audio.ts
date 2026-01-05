import { vi } from "vitest";

export interface MockAnalyserNode {
  frequencyBinCount: number;
  getFloatFrequencyData: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
}

export interface MockOscillatorNode {
  type: string;
  frequency: {
    setValueAtTime: ReturnType<typeof vi.fn>;
  };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

export interface MockGainNode {
  gain: {
    setValueAtTime: ReturnType<typeof vi.fn>;
  };
  connect: ReturnType<typeof vi.fn>;
}

export interface MockDynamicsCompressorNode {
  threshold: { setValueAtTime: ReturnType<typeof vi.fn> };
  knee: { setValueAtTime: ReturnType<typeof vi.fn> };
  ratio: { setValueAtTime: ReturnType<typeof vi.fn> };
  attack: { setValueAtTime: ReturnType<typeof vi.fn> };
  release: { setValueAtTime: ReturnType<typeof vi.fn> };
  connect: ReturnType<typeof vi.fn>;
}

export interface MockAudioContext {
  currentTime: number;
  destination: object;
  createOscillator: ReturnType<typeof vi.fn>;
  createAnalyser: ReturnType<typeof vi.fn>;
  createGain: ReturnType<typeof vi.fn>;
  createDynamicsCompressor: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

export interface AudioMockOptions {
  frequencyBinCount?: number;
  frequencyData?: number[];
}

export function createMockAnalyserNode(options: AudioMockOptions = {}): MockAnalyserNode {
  const { frequencyBinCount = 128, frequencyData } = options;

  return {
    frequencyBinCount,
    getFloatFrequencyData: vi.fn().mockImplementation((array: Float32Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = frequencyData ? frequencyData[i] ?? -100 : -100 + i * 0.5;
      }
    }),
    connect: vi.fn(),
  };
}

export function createMockOscillatorNode(): MockOscillatorNode {
  return {
    type: "",
    frequency: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

export function createMockGainNode(): MockGainNode {
  return {
    gain: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
}

export function createMockDynamicsCompressorNode(): MockDynamicsCompressorNode {
  return {
    threshold: { setValueAtTime: vi.fn() },
    knee: { setValueAtTime: vi.fn() },
    ratio: { setValueAtTime: vi.fn() },
    attack: { setValueAtTime: vi.fn() },
    release: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
  };
}

export function createMockAudioContext(options: AudioMockOptions = {}): MockAudioContext {
  const mockAnalyser = createMockAnalyserNode(options);
  const mockOscillator = createMockOscillatorNode();
  const mockGain = createMockGainNode();
  const mockCompressor = createMockDynamicsCompressorNode();

  return {
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn().mockReturnValue(mockOscillator),
    createAnalyser: vi.fn().mockReturnValue(mockAnalyser),
    createGain: vi.fn().mockReturnValue(mockGain),
    createDynamicsCompressor: vi.fn().mockReturnValue(mockCompressor),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

export function setupAudioContextMock(options: AudioMockOptions = {}): MockAudioContext {
  const mockContext = createMockAudioContext(options);
  const MockAudioContextClass = vi.fn().mockImplementation(() => mockContext);

  Object.defineProperty(window, "AudioContext", {
    value: MockAudioContextClass,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, "webkitAudioContext", {
    value: MockAudioContextClass,
    writable: true,
    configurable: true,
  });

  return mockContext;
}

export function setupAudioContextUnavailable(): void {
  Object.defineProperty(window, "AudioContext", {
    value: undefined,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, "webkitAudioContext", {
    value: undefined,
    writable: true,
    configurable: true,
  });
}
