class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.bufferSize = 4096; // Buffer size for processing
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      
      // Convert to mono if stereo (take first channel)
      const monoData = channelData;
      
      // Add to buffer
      this.buffer.push(...monoData);
      
      // Send buffer when it reaches the desired size
      if (this.buffer.length >= this.bufferSize) {
        // Convert to Float32Array for Speechmatics
        const audioBuffer = new Float32Array(this.buffer);
        
        // Send the audio data
        this.port.postMessage({
          type: 'audioData',
          audioData: audioBuffer.buffer,
          sampleRate: sampleRate,
          channels: 1
        });
        
        // Clear buffer
        this.buffer = [];
      }
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
