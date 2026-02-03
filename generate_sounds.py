"""
BNI 抽獎系統音效生成器
使用 Python 生成三種音效：
1. rolling.mp3 - 抽獎滾動音效
2. win.mp3 - 中獎慶祝音效
3. bgm.mp3 - 背景音樂

需要安裝: pip install numpy scipy pydub

注意：pydub 需要 ffmpeg 來輸出 mp3
Windows: 下載 ffmpeg 並加入 PATH
或使用 conda: conda install ffmpeg
"""

import numpy as np
from scipy.io import wavfile
import os

# 設定輸出目錄
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'public', 'sounds')
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 44100  # CD 音質


def generate_sine_wave(frequency, duration, sample_rate=SAMPLE_RATE, amplitude=0.5):
    """生成正弦波"""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    wave = amplitude * np.sin(2 * np.pi * frequency * t)
    return wave


def generate_noise(duration, sample_rate=SAMPLE_RATE, amplitude=0.1):
    """生成白噪音"""
    samples = int(sample_rate * duration)
    noise = amplitude * np.random.uniform(-1, 1, samples)
    return noise


def apply_envelope(wave, attack=0.01, decay=0.1, sustain=0.7, release=0.2):
    """應用 ADSR 包絡"""
    length = len(wave)
    envelope = np.ones(length)

    attack_samples = int(attack * length)
    decay_samples = int(decay * length)
    release_samples = int(release * length)

    # Attack
    if attack_samples > 0:
        envelope[:attack_samples] = np.linspace(0, 1, attack_samples)

    # Decay
    decay_end = attack_samples + decay_samples
    if decay_samples > 0 and decay_end < length:
        envelope[attack_samples:decay_end] = np.linspace(1, sustain, decay_samples)

    # Sustain (維持 sustain 值)
    sustain_end = length - release_samples
    if sustain_end > decay_end:
        envelope[decay_end:sustain_end] = sustain

    # Release
    if release_samples > 0:
        envelope[-release_samples:] = np.linspace(sustain, 0, release_samples)

    return wave * envelope


def save_wav(filename, audio, sample_rate=SAMPLE_RATE):
    """儲存為 WAV 檔案"""
    # 正規化到 16-bit 範圍
    audio = np.clip(audio, -1, 1)
    audio_int16 = (audio * 32767).astype(np.int16)
    filepath = os.path.join(OUTPUT_DIR, filename)
    wavfile.write(filepath, sample_rate, audio_int16)
    print(f"已生成: {filepath}")
    return filepath


def generate_rolling_sound():
    """
    生成抽獎滾動音效
    模擬老虎機或轉盤的聲音 - 快速的咔嗒聲
    """
    duration = 3.0  # 3 秒循環
    samples = int(SAMPLE_RATE * duration)
    audio = np.zeros(samples)

    # 每秒 15 次咔嗒聲
    clicks_per_second = 15
    click_interval = SAMPLE_RATE // clicks_per_second

    for i in range(0, samples, click_interval):
        # 短促的咔嗒聲
        click_duration = 0.02  # 20ms
        click_samples = int(SAMPLE_RATE * click_duration)

        if i + click_samples < samples:
            # 混合多個頻率製造金屬感
            click = generate_sine_wave(800, click_duration, amplitude=0.4)
            click += generate_sine_wave(1200, click_duration, amplitude=0.3)
            click += generate_sine_wave(2000, click_duration, amplitude=0.2)
            click += generate_noise(click_duration, amplitude=0.1)

            # 快速衰減
            click = apply_envelope(click, attack=0.01, decay=0.3, sustain=0.1, release=0.5)

            audio[i:i + len(click)] += click

    # 加入輕微的背景嗡嗡聲
    hum = generate_sine_wave(100, duration, amplitude=0.05)
    audio += hum

    # 正規化
    audio = audio / np.max(np.abs(audio)) * 0.8

    return save_wav('rolling.wav', audio)


def generate_win_sound():
    """
    生成中獎慶祝音效
    歡快的上升音階 + 閃亮音效
    """
    duration = 2.5
    samples = int(SAMPLE_RATE * duration)
    audio = np.zeros(samples)

    # 上升音階 (C大調)
    frequencies = [523, 587, 659, 784, 880, 988, 1047, 1175, 1319]  # C5 到 E6
    note_duration = 0.12

    for i, freq in enumerate(frequencies):
        start = int(i * note_duration * 0.8 * SAMPLE_RATE)
        note = generate_sine_wave(freq, note_duration, amplitude=0.4)
        # 加入泛音
        note += generate_sine_wave(freq * 2, note_duration, amplitude=0.2)
        note += generate_sine_wave(freq * 3, note_duration, amplitude=0.1)
        note = apply_envelope(note, attack=0.05, decay=0.2, sustain=0.5, release=0.3)

        if start + len(note) < samples:
            audio[start:start + len(note)] += note

    # 加入閃亮音效 (高頻短音)
    sparkle_times = [0.3, 0.5, 0.7, 1.0, 1.2, 1.5, 1.8, 2.0]
    for t in sparkle_times:
        start = int(t * SAMPLE_RATE)
        sparkle_freq = np.random.randint(2000, 4000)
        sparkle = generate_sine_wave(sparkle_freq, 0.05, amplitude=0.2)
        sparkle = apply_envelope(sparkle, attack=0.1, decay=0.3, sustain=0.2, release=0.4)

        if start + len(sparkle) < samples:
            audio[start:start + len(sparkle)] += sparkle

    # 最後的和弦 (勝利感)
    chord_start = int(1.5 * SAMPLE_RATE)
    chord_duration = 1.0
    # C 大調和弦
    chord_freqs = [523, 659, 784, 1047]  # C, E, G, C (高八度)
    chord = np.zeros(int(SAMPLE_RATE * chord_duration))
    for freq in chord_freqs:
        chord += generate_sine_wave(freq, chord_duration, amplitude=0.25)
    chord = apply_envelope(chord, attack=0.1, decay=0.2, sustain=0.6, release=0.3)

    if chord_start + len(chord) < samples:
        audio[chord_start:chord_start + len(chord)] += chord

    # 正規化
    audio = audio / np.max(np.abs(audio)) * 0.85

    return save_wav('win.wav', audio)


def generate_bgm():
    """
    生成背景音樂
    簡單歡快的循環音樂
    """
    duration = 8.0  # 8 秒循環
    samples = int(SAMPLE_RATE * duration)
    audio = np.zeros(samples)

    # 基礎節奏 (每秒 2 拍)
    bpm = 120
    beat_duration = 60.0 / bpm
    beat_samples = int(beat_duration * SAMPLE_RATE)

    # 低音 bass line (根音)
    bass_notes = [130, 146, 164, 146]  # C3, D3, E3, D3
    for beat in range(int(duration / beat_duration)):
        start = beat * beat_samples
        bass_freq = bass_notes[beat % len(bass_notes)]

        bass = generate_sine_wave(bass_freq, beat_duration * 0.8, amplitude=0.3)
        bass += generate_sine_wave(bass_freq * 0.5, beat_duration * 0.8, amplitude=0.15)  # 低八度
        bass = apply_envelope(bass, attack=0.05, decay=0.2, sustain=0.6, release=0.2)

        if start + len(bass) < samples:
            audio[start:start + len(bass)] += bass

    # 和弦 (每兩拍換一次)
    chord_progressions = [
        [261, 329, 392],  # C major
        [293, 369, 440],  # D minor (調整)
        [329, 415, 493],  # E minor
        [293, 369, 440],  # D minor
    ]

    chord_duration = beat_duration * 2
    for i, chord_freqs in enumerate(chord_progressions * 2):  # 重複兩次
        start = int(i * chord_duration * SAMPLE_RATE)

        chord = np.zeros(int(SAMPLE_RATE * chord_duration * 0.9))
        for freq in chord_freqs:
            chord += generate_sine_wave(freq, chord_duration * 0.9, amplitude=0.12)
        chord = apply_envelope(chord, attack=0.1, decay=0.2, sustain=0.5, release=0.3)

        if start + len(chord) < samples:
            audio[start:start + len(chord)] += chord

    # 簡單旋律
    melody_notes = [
        (523, 0.5), (587, 0.5), (659, 0.5), (587, 0.5),
        (523, 0.5), (493, 0.5), (523, 1.0),
        (659, 0.5), (698, 0.5), (784, 0.5), (698, 0.5),
        (659, 0.5), (587, 0.5), (523, 1.0),
    ]

    melody_start = 0
    for freq, dur in melody_notes:
        note_duration = dur * beat_duration
        start = int(melody_start * SAMPLE_RATE)

        note = generate_sine_wave(freq, note_duration * 0.9, amplitude=0.2)
        note += generate_sine_wave(freq * 2, note_duration * 0.9, amplitude=0.08)
        note = apply_envelope(note, attack=0.08, decay=0.15, sustain=0.5, release=0.25)

        if start + len(note) < samples:
            audio[start:start + len(note)] += note

        melody_start += note_duration

    # 淡入淡出處理
    fade_samples = int(0.5 * SAMPLE_RATE)
    audio[:fade_samples] *= np.linspace(0, 1, fade_samples)
    audio[-fade_samples:] *= np.linspace(1, 0, fade_samples)

    # 正規化
    audio = audio / np.max(np.abs(audio)) * 0.7

    return save_wav('bgm.wav', audio)


def convert_to_mp3():
    """
    將 WAV 轉換為 MP3
    需要安裝 pydub 和 ffmpeg
    """
    try:
        from pydub import AudioSegment

        wav_files = ['rolling.wav', 'win.wav', 'bgm.wav']

        for wav_file in wav_files:
            wav_path = os.path.join(OUTPUT_DIR, wav_file)
            mp3_path = wav_path.replace('.wav', '.mp3')

            if os.path.exists(wav_path):
                audio = AudioSegment.from_wav(wav_path)
                audio.export(mp3_path, format='mp3', bitrate='192k')
                print(f"已轉換為 MP3: {mp3_path}")

                # 刪除 WAV 檔案
                os.remove(wav_path)
                print(f"已刪除 WAV: {wav_path}")

        return True
    except ImportError:
        print("\n提示: 無法轉換為 MP3，請安裝 pydub 和 ffmpeg")
        print("pip install pydub")
        print("然後安裝 ffmpeg (Windows 可用 choco install ffmpeg 或從官網下載)")
        print("\nWAV 檔案已生成，瀏覽器也支援 WAV 格式")
        return False
    except Exception as e:
        print(f"MP3 轉換失敗: {e}")
        print("WAV 檔案已生成，您可以手動轉換或直接使用")
        return False


def update_lottery_audio_paths():
    """
    更新 Lottery.tsx 中的音效路徑（如果使用 WAV）
    """
    lottery_path = os.path.join(os.path.dirname(__file__), 'src', 'pages', 'Lottery.tsx')

    # 檢查是否需要更新（如果 MP3 轉換失敗）
    wav_exists = os.path.exists(os.path.join(OUTPUT_DIR, 'rolling.wav'))

    if wav_exists:
        print("\n注意: 音效為 WAV 格式")
        print("如需使用 WAV，請手動更新 Lottery.tsx 中的路徑：")
        print("  /sounds/rolling.mp3 -> /sounds/rolling.wav")
        print("  /sounds/win.mp3 -> /sounds/win.wav")
        print("  /sounds/bgm.mp3 -> /sounds/bgm.wav")


def main():
    print("=" * 50)
    print("BNI 抽獎系統音效生成器")
    print("=" * 50)
    print(f"\n輸出目錄: {OUTPUT_DIR}\n")

    # 生成音效
    print("正在生成滾動音效...")
    generate_rolling_sound()

    print("\n正在生成中獎音效...")
    generate_win_sound()

    print("\n正在生成背景音樂...")
    generate_bgm()

    # 嘗試轉換為 MP3
    print("\n嘗試轉換為 MP3 格式...")
    mp3_success = convert_to_mp3()

    if not mp3_success:
        update_lottery_audio_paths()

    print("\n" + "=" * 50)
    print("音效生成完成！")
    print("=" * 50)

    # 列出生成的檔案
    print("\n生成的檔案:")
    for f in os.listdir(OUTPUT_DIR):
        filepath = os.path.join(OUTPUT_DIR, f)
        size = os.path.getsize(filepath)
        print(f"  - {f} ({size / 1024:.1f} KB)")


if __name__ == '__main__':
    main()
