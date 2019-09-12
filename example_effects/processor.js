import SuperpoweredModule from '../superpowered.js'

var Superpowered = null;

function calculateFrequency(value, minFreq, maxFreq) {
    if (value > 0.97) return maxFreq;
    if (value < 0.03) return minFreq;
    return Math.min(maxFreq, Math.pow(10.0, (value + ((0.4 - Math.abs(value - 0.4)) * 0.3)) * Math.log10(maxFreq - minFreq)) + minFreq);
}

class MyProcessor extends SuperpoweredModule.AudioWorkletProcessor {
    // runs after the constructor
    onReady() {
        Superpowered = this.Superpowered;

        this.reverb = Superpowered.new('Reverb', Superpowered.samplerate, Superpowered.samplerate);
        this.reverb.enabled = true;

        this.filter = Superpowered.new('Filter', Superpowered.FilterType.Resonant_Lowpass, Superpowered.samplerate);
        this.filter.resonance = 0.2;
        this.filter.enabled = true;
    }

    onMessageFromMainScope(message) {
        if (message.wet) {
            this.reverb.wet = message.wet / 100;
            console.log(message.wet + '%');
        } else if (message.freq) {
            let hz = calculateFrequency(parseFloat(message.freq) / 100, 100, 10000);
            this.filter.frequency = hz;
            console.log(parseInt(hz, 10) + ' hz');
        }
    }

    processAudio(inputBuffer, outputBuffer, buffersize, parameters) {
        this.reverb.process(inputBuffer.pointer, inputBuffer.pointer, buffersize);
        this.filter.process(inputBuffer.pointer, outputBuffer.pointer, buffersize);
        return true;
    }
}

if (typeof AudioWorkletProcessor === 'function') registerProcessor('MyProcessor', MyProcessor);
export default MyProcessor;
