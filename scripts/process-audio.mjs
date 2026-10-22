import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const durations = {
  'portal-open.wav': 0.9,
  'portal-enter.wav': 0.7,
  'stage-complete.wav': 1.5,
  'lose.wav': 1.6,
  'boost-speed.wav': 0.45,
  'boost-damage.wav': 0.45,
  'boost-heal.wav': 0.5,
  'heal-skill.wav': 0.75,
  'fireball-cast.wav': 0.45,
  'fireball-hit.wav': 0.45,
  'ice-cast.wav': 0.4,
  'ice-hit.wav': 0.4,
  'bow-shot.wav': 0.35,
  'arrow-hit.wav': 0.25,
  'sword-hit.wav': 0.25,
  'enemy-cast.wav': 0.35,
  'boss-cast.wav': 0.7,
  'spikes-trigger.wav': 0.3,
  'companion-attack.wav': 0.3,
  'companion-hurt.wav': 0.2,
  'companion-down.wav': 0.7,
  'fake-card.wav': 0.7,
  'hell-card.wav': 1,
  'card-reroll.wav': 0.6,
  'land.wav': 0.2,
  'ui-confirm.wav': 0.12,
};

function chunks(buffer) {
  const result = new Map();
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    result.set(id, { header: offset, start: offset + 8, size });
    offset += 8 + size + (size & 1);
  }
  return result;
}

async function processFile(name, maxDuration) {
  const file = path.join(root, 'assets', 'sounds', name);
  const source = await readFile(file);
  if (source.toString('ascii', 0, 4) !== 'RIFF') throw new Error(`${name}: not RIFF`);
  const parts = chunks(source);
  const format = parts.get('fmt ');
  const data = parts.get('data');
  if (!format || !data) throw new Error(`${name}: incomplete WAV`);
  const audioFormat = source.readUInt16LE(format.start);
  const channels = source.readUInt16LE(format.start + 2);
  const sampleRate = source.readUInt32LE(format.start + 4);
  const blockAlign = source.readUInt16LE(format.start + 12);
  const bitDepth = source.readUInt16LE(format.start + 14);
  if (![1, 0xfffe].includes(audioFormat) || ![16, 24].includes(bitDepth))
    throw new Error(`${name}: expected PCM WAV, got format ${audioFormat}/${bitDepth}`);

  const bytesPerSample = bitDepth / 8;
  const readSample = (offset) => source.readIntLE(offset, bytesPerSample);

  const frameCount = Math.floor(data.size / blockAlign);
  let peak = 0;
  for (let offset = data.start; offset + bytesPerSample <= data.start + data.size; offset += bytesPerSample)
    peak = Math.max(peak, Math.abs(readSample(offset)));
  const threshold = peak * 0.018;
  let firstActive = 0;
  outer: for (let frame = 0; frame < frameCount; frame++) {
    for (let channel = 0; channel < channels; channel++) {
      const sample = Math.abs(readSample(data.start + frame * blockAlign + channel * bytesPerSample));
      if (sample >= threshold) { firstActive = frame; break outer; }
    }
  }
  const lookback = Math.round(sampleRate * 0.015);
  const startFrame = Math.max(0, firstActive - lookback);
  const outputFrames = Math.min(frameCount - startFrame, Math.round(maxDuration * sampleRate));
  const outputBlockAlign = channels * 2;
  const pcm = Buffer.alloc(outputFrames * outputBlockAlign);
  const targetPeak = 0.78 * 32767;
  const sourceScale = 32767 / (2 ** (bitDepth - 1) - 1);
  const gain = peak > 0 ? Math.min(4, targetPeak / (peak * sourceScale)) : 1;
  const fadeIn = Math.min(outputFrames, Math.round(sampleRate * 0.006));
  const fadeOut = Math.min(outputFrames, Math.round(sampleRate * 0.025));
  for (let frame = 0; frame < outputFrames; frame++) {
    const envelope = Math.min(1,
      fadeIn ? (frame + 1) / fadeIn : 1,
      fadeOut ? (outputFrames - frame) / fadeOut : 1);
    for (let channel = 0; channel < channels; channel++) {
      const input = data.start + (startFrame + frame) * blockAlign + channel * bytesPerSample;
      const sample = Math.max(-32768, Math.min(32767,
        Math.round(readSample(input) * sourceScale * gain * envelope)));
      pcm.writeInt16LE(sample, frame * outputBlockAlign + channel * 2);
    }
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * outputBlockAlign, 28);
  header.writeUInt16LE(outputBlockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  const output = Buffer.concat([header, pcm]);
  await writeFile(file, output);
  return `${name}: ${(outputFrames / sampleRate).toFixed(2)} s`;
}

for (const [name, duration] of Object.entries(durations))
  console.log(await processFile(name, duration));
