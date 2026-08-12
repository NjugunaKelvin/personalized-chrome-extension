/**
 * VIN Chrome Environment — Procedural Web Audio Soundscape Engine
 * Generates high-fidelity ambient focus sounds (Deep Brown Noise, Soft Rain, Warm Drone)
 * using native browser Web Audio API with zero external audio assets.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.currentPreset = 'none'; // 'none' | 'brown-noise' | 'soft-rain' | 'warm-drone'
    this.masterGain = null;
    this.activeNodes = [];
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.25; // Default comfortable volume
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) { // val between 0.0 and 1.0
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }
  }

  stop() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.currentPreset = 'none';
  }

  playPreset(preset) {
    this.initContext();
    if (!this.ctx) return;

    this.stop();
    this.currentPreset = preset;

    if (preset === 'brown-noise') {
      this.createBrownNoise();
    } else if (preset === 'soft-rain') {
      this.createSoftRain();
    } else if (preset === 'warm-drone') {
      this.createWarmDrone();
    }
  }

  /**
   * Deep Brown Noise Generator
   */
  createBrownNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Boost amplitude
    }

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    // Lowpass filter for deep warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;

    noiseSrc.connect(filter);
    filter.connect(this.masterGain);
    noiseSrc.start();

    this.activeNodes.push(noiseSrc, filter);
  }

  /**
   * Soft Rain Synthesis Generator
   */
  createSoftRain() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const rainSrc = this.ctx.createBufferSource();
    rainSrc.buffer = noiseBuffer;
    rainSrc.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 850;
    bandpass.Q.value = 0.5;

    rainSrc.connect(bandpass);
    bandpass.connect(this.masterGain);
    rainSrc.start();

    this.activeNodes.push(rainSrc, bandpass);
  }

  /**
   * Warm 432Hz Meditative Sine Drone Generator
   */
  createWarmDrone() {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.value = 216; // Sub-octave harmonic

    osc2.type = 'sine';
    osc2.frequency.value = 432; // Meditative warmth frequency

    // LFO for slow breathing volume modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.1; // 10s period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.08;

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.18;

    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);

    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    lfo.start();

    this.activeNodes.push(osc1, osc2, lfo, lfoGain, droneGain);
  }
}

export const SoundEngine = new AudioEngine();
