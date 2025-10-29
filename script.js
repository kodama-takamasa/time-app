// ===== 共通ユーティリティ =====
const Utils = (() => {
  // 安全な要素取得
  const getElement = (id) => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with id "${id}" not found`);
    }
    return element;
  };

  // 安全なクラス操作
  const safeClassList = (element, operation, className) => {
    if (element && element.classList) {
      element.classList[operation](className);
    }
  };

  // 時間フォーマット
  const formatTime = {
    mmss: (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    },
    hms: (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
  };

  // 定数
  const CONSTANTS = {
    HOUR_IN_MS: 60 * 60 * 1000,
    DEFAULT_TIMER_MINUTES: 10,
    DEFAULT_VOLUME: 1.0,
    DEFAULT_SOUND_TYPE: "beep",
  };

  // エラーハンドリング
  const handleError = (error, context = "") => {
    console.error(`Error in ${context}:`, error);
    // 必要に応じてユーザーに通知
  };

  // 安全な関数実行
  const safeExecute = (fn, context = "", fallback = null) => {
    try {
      return fn();
    } catch (error) {
      handleError(error, context);
      return fallback;
    }
  };

  return {
    getElement,
    safeClassList,
    formatTime,
    CONSTANTS,
    handleError,
    safeExecute,
  };
})();

// ===== アラーム音モジュール =====
const AlarmSound = (() => {
  let audioContext = null;
  let isPlaying = false;
  let lastPlayTime = 0;
  let volume = 0.5; // デフォルト音量
  let currentSoundType = "beep"; // 現在の音声種類
  let vibrationEnabled = true; // バイブレーション有効フラグ
  let silentModeWarningShown = false; // 消音モード警告表示済みフラグ

  // 音声種類の定義
  const SOUND_TYPES = {
    beep: {
      name: "ビープ音",
      play: (volume) => {
        // 電子機器のビープ音：短くて高音（鋭い方形波）
        playBeep(1200, 50, volume, "square");
        setTimeout(() => {
          playBeep(1200, 50, volume, "square");
        }, 100);
      },
    },
    chime: {
      name: "チャイム音",
      play: (volume) => {
        // 美しい上昇音階：ドレミファソ（純粋な正弦波で心地よく）
        playBeep(523, 120, volume, "sine"); // C5
        setTimeout(() => {
          playBeep(587, 120, volume, "sine"); // D5
          setTimeout(() => {
            playBeep(659, 120, volume, "sine"); // E5
            setTimeout(() => {
              playBeep(698, 120, volume, "sine"); // F5
              setTimeout(() => {
                playBeep(784, 200, volume, "sine"); // G5
              }, 80);
            }, 80);
          }, 80);
        }, 80);
      },
    },
    bell: {
      name: "ベル音",
      play: (volume) => {
        // 教会の鐘のような深い音：長くて低い
        playBeep(220, 500, volume, "sine"); // A3
        setTimeout(() => {
          playBeep(165, 400, volume, "sine"); // E3
          setTimeout(() => {
            playBeep(110, 600, volume, "sine"); // A2
          }, 300);
        }, 400);
      },
    },
    alarm: {
      name: "アラーム音",
      play: (volume) => {
        // 音量が0の場合は再生しない（消音モード対応）
        if (volume === 0) {
          console.log("🔇 音量0のため再生をスキップ");
          return;
        }

        // alarm_clock.mp3を再生（1秒で停止）
        alarmAudio = new Audio("sound/alarm_clock.mp3");
        alarmAudio.volume = volume;
        alarmAudio.play().catch((error) => {
          console.error("アラーム音の再生エラー:", error);
        });

        // 1秒後に停止
        setTimeout(() => {
          if (alarmAudio) {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
          }
        }, 1000);
      },
    },
    notification: {
      name: "通知音",
      play: (volume) => {
        // ソフトな通知音：短い3音（柔らかいトライアングル波）
        playBeep(800, 80, volume, "triangle");
        setTimeout(() => {
          playBeep(1000, 80, volume, "triangle");
          setTimeout(() => {
            playBeep(1200, 120, volume, "triangle");
          }, 100);
        }, 100);
      },
    },
    whistle: {
      name: "ホイッスル音",
      play: (volume) => {
        // サッカーホイッスルのような音：上昇→下降→上昇
        playWhistle(800, 60, volume);
        setTimeout(() => {
          playWhistle(1200, 80, volume);
          setTimeout(() => {
            playWhistle(1000, 100, volume);
            setTimeout(() => {
              playWhistle(1500, 150, volume);
            }, 80);
          }, 80);
        }, 60);
      },
    },
    marimba: {
      name: "マリンバ音",
      play: (volume) => {
        // マリンバのような木製楽器の音色
        playMallet(392, 120, volume); // G4
        setTimeout(() => {
          playMallet(440, 120, volume); // A4
          setTimeout(() => {
            playMallet(494, 140, volume); // B4
            setTimeout(() => {
              playMallet(523, 160, volume); // C5
            }, 100);
          }, 100);
        }, 100);
      },
    },
    gong: {
      name: "ゴング音",
      play: (volume) => {
        // 音量が0の場合は再生しない（消音モード対応）
        if (volume === 0) {
          console.log("🔇 音量0のため再生をスキップ");
          return;
        }

        // alarm_gong.mp3を再生（1秒で停止）
        alarmAudio = new Audio("sound/alarm_gong.mp3");
        alarmAudio.volume = volume;
        alarmAudio.play().catch((error) => {
          console.error("ゴング音の再生エラー:", error);
        });

        // 1秒後に停止
        setTimeout(() => {
          if (alarmAudio) {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
          }
        }, 1000);
      },
    },
  };

  const initAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // ブラウザの音声制限を回避するため、AudioContextを再開
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    // スマホ対応：ダミー音声でアンロック
    try {
      const dummyAudio = new Audio();
      dummyAudio.volume = 0;
      dummyAudio
        .play()
        .then(() => {
          dummyAudio.pause();
          console.log("✅ 音声コンテキストを初期化しました");
        })
        .catch(() => {
          // エラーは無視
        });
    } catch (err) {
      // エラーは無視
    }

    return audioContext;
  };

  const playBeep = (
    frequency = 800,
    duration = 100,
    volume = 0.3,
    type = "sine"
  ) => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // 立ち上がりと立ち下がりを滑らかに
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration / 1000
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  };

  // より複雑な音色を作成する関数（マリンバ用）
  const playMallet = (frequency = 392, duration = 120, volume = 0.3) => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // トライアングル波で柔らかい音色
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;

    // ローパスフィルターで柔らかい音にする
    filter.type = "lowpass";
    filter.frequency.value = frequency * 3;
    filter.Q.value = 5;

    // 急激な減衰で木製楽器の特徴を作る
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration / 1000
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  };

  // ホイッスルのような鋭い音を作る関数
  const playWhistle = (frequency = 800, duration = 60, volume = 0.4) => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // サーキットフィルター風の音色
    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency;

    // 鋭い立ち上がり
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration / 1000
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  };

  // ゴングのような深く響く音を作る関数
  const playGong = (frequency = 110, duration = 300, volume = 0.5) => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 複雑な倍音を持つ波形
    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency;

    // ローパスフィルターで深みのある音に
    filter.type = "lowpass";
    filter.frequency.value = frequency * 8;
    filter.Q.value = 2;

    // ゆっくりと減衰する深い響き
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration / 1000
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  };

  const playAlarm = () => {
    const now = Date.now();
    // 500ms以内の重複呼び出しを防ぐ
    if (isPlaying || now - lastPlayTime < 500) return;

    isPlaying = true;
    lastPlayTime = now;

    console.log(`🔊 アラーム音を再生開始 (種類: ${currentSoundType})`);
    console.log(`📳 バイブレーション設定: ${vibrationEnabled ? "ON" : "OFF"}`);

    // バイブレーション機能（Android専用、iOSでは動作しません）
    if (vibrationEnabled) {
      if ("vibrate" in navigator) {
        try {
          // より強力なバイブレーションパターン
          const pattern = [500, 100, 500, 100, 500];
          const vibrated = navigator.vibrate(pattern);
          
          // iOSの判定
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isIOS) {
            console.log("ℹ️ iOSではバイブレーション機能は動作しません（制限あり）");
          } else {
            console.log(
              `📳 バイブレーション実行: ${vibrated ? "✅ 成功" : "❌ 失敗"}`
            );
          }

          // さらに長いバイブレーション（2秒間）
          setTimeout(() => {
            if (vibrationEnabled && !isIOS) {
              navigator.vibrate(1000);
            }
          }, 1500);
        } catch (err) {
          console.error("❌ バイブレーションエラー:", err);
        }
      } else {
        console.log("⚠️ このデバイスはバイブレーションAPIに対応していません");
      }
    } else {
      console.log("📳 バイブレーション機能はOFFに設定されています");
    }

    // 現在選択されている音声種類で再生
    const soundType = SOUND_TYPES[currentSoundType];
    if (soundType) {
      soundType.play(volume);
      // アラーム音を1秒に統一
      setTimeout(() => {
        isPlaying = false; // 再生完了後にフラグをリセット
        console.log("🔊 アラーム音再生完了");
      }, 1000); // 1秒でアラーム音終了
    }
  };

  // テスト用の音声再生関数（実際のアラーム音と同じ）
  const testSound = () => {
    console.log(`🔊 テスト音声を再生 (種類: ${currentSoundType})`);

    // 前のテスト音を停止
    if (testAudio) {
      testAudio.pause();
      testAudio.currentTime = 0;
      testAudio = null;
    }

    // 音量が0の場合は再生しない
    if (volume === 0) {
      console.log("🔇 音量0のため再生をスキップ");
      return;
    }

    // alarm/gongの場合は、testAudioで再生（alarmAudioは使わない）
    if (currentSoundType === "alarm") {
      testAudio = new Audio("sound/alarm_clock.mp3");
      testAudio.volume = volume;
      testAudio.play().catch((error) => {
        console.error("テスト音の再生エラー:", error);
      });
    } else if (currentSoundType === "gong") {
      testAudio = new Audio("sound/alarm_gong.mp3");
      testAudio.volume = volume;
      testAudio.play().catch((error) => {
        console.error("テスト音の再生エラー:", error);
      });
    } else {
      // その他の合成音
      const soundType = SOUND_TYPES[currentSoundType];
      if (soundType) {
        soundType.play(volume);
      }
    }
  };

  // 音量設定関数
  const setVolume = (newVolume) => {
    volume = Math.max(0, Math.min(1, newVolume)); // 0-1の範囲に制限
    console.log(`🔊 音量を${Math.round(volume * 100)}%に設定`);

    // テスト音声が再生中の場合、リアルタイムで音量を更新
    if (testAudio) {
      testAudio.volume = volume;
    }

    // アラーム音が再生中の場合も音量を更新
    if (alarmAudio) {
      alarmAudio.volume = volume;
    }
  };

  // 音量取得関数
  const getVolume = () => volume;

  // 音声種類設定関数
  const setSoundType = (soundType) => {
    if (SOUND_TYPES[soundType]) {
      currentSoundType = soundType;
      console.log(`🔊 音声種類を${SOUND_TYPES[soundType].name}に設定`);
    }
  };

  // 音声種類取得関数
  const getSoundType = () => currentSoundType;

  // 音声種類一覧取得関数
  const getSoundTypes = () => SOUND_TYPES;

  // アラーム音声の管理
  let alarmAudio = null;

  // テスト音声の管理
  let testAudio = null;

  const stopAlarm = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
      alarmAudio = null;
    }
    isPlaying = false;
  };

  const stopTestSound = () => {
    if (testAudio) {
      testAudio.pause();
      testAudio.currentTime = 0;
      testAudio = null;
    }
  };

  // バイブレーション設定
  const setVibration = (enabled) => {
    vibrationEnabled = enabled;
    console.log(`📳 バイブレーション: ${enabled ? "ON" : "OFF"}`);
  };

  const getVibration = () => vibrationEnabled;

  // バイブレーション対応チェック
  const isVibrationSupported = () => {
    return "vibrate" in navigator;
  };

  return {
    playAlarm,
    stopAlarm,
    testSound,
    stopTestSound,
    setVolume,
    getVolume,
    setSoundType,
    getSoundType,
    getSoundTypes,
    setVibration,
    getVibration,
    isVibrationSupported,
  };
})();

// ===== 定数定義 =====
const SEGMENT_MAP = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "g", "e", "d"],
  3: ["a", "b", "g", "c", "d"],
  4: ["f", "g", "b", "c"],
  5: ["a", "f", "g", "c", "d"],
  6: ["a", "f", "g", "c", "d", "e"],
  7: ["a", "b", "c"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "f", "g"],
};

const TIMER_DURATIONS = [
  { label: "10秒", ms: 10 * 1000 },
  { label: "15秒", ms: 15 * 1000 },
  { label: "30秒", ms: 30 * 1000 },
  { label: "1分", ms: 60 * 1000 },
  { label: "1分30秒", ms: 90 * 1000 },
  { label: "2分", ms: 120 * 1000 },
  { label: "3分", ms: 180 * 1000 },
  { label: "5分", ms: 300 * 1000 },
  { label: "10分", ms: 600 * 1000 },
  { label: "15分", ms: 900 * 1000 },
  { label: "30分", ms: 1800 * 1000 },
  { label: "1時間", ms: 3600 * 1000 },
];

const COLOR_PRESETS = {
  dark: {
    off: "#000",
    options: [
      { key: "lime", name: "Lime", bg: "#000000", fg: "#00ff00" },
      { key: "white", name: "White", bg: "#000000", fg: "#ffffff" },
      { key: "neonpink", name: "Pink", bg: "#000000", fg: "#ff33bb" },
      { key: "neonblue", name: "Blue", bg: "#000000", fg: "#00eaff" },
      { key: "neonpurple", name: "Purple", bg: "#000000", fg: "#b678ff" },
      { key: "neonorange", name: "Orange", bg: "#000000", fg: "#ff7a1a" },
    ],
  },
  light: {
    off: "#fcfcfc",
    options: [
      { key: "black", name: "Black", bg: "#ffffff", fg: "#000000" },
      { key: "blue", name: "Blue", bg: "#ffffff", fg: "#2a5fd1" },
      { key: "red", name: "Red", bg: "#ffffff", fg: "#d14a4a" },
    ],
  },
};

// 定数はUtilsモジュールで定義済み
const INTERVAL_UPDATE_MS = 200;

// ===== ユーティリティ関数 =====
// formatTimeはUtilsモジュールで定義済み

const colorUtils = {
  rgbToHex: (color) => {
    let str = (color || "").toLowerCase().trim();
    if (str.startsWith("#")) {
      return str.length === 4
        ? `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`
        : str;
    }
    str = str.replace(/rgba?|\(|\)/g, "");
    const [r, g, b] = str.split(",").map((v) => parseInt(v, 10));
    const hex = (v) =>
      ("0" + Math.max(0, Math.min(255, v)).toString(16)).slice(-2);
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  },

  hexToRgb: (hexColor) => {
    const hex = colorUtils.rgbToHex(hexColor).slice(1);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  },

  luminance: (hex) => {
    const { r, g, b } = colorUtils.hexToRgb(hex);
    const srgb = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  },

  isDarkBackground: (hex) => colorUtils.luminance(hex) < 0.25,
};

// ===== 7セグメント表示 =====
const SevenSegmentDisplay = (() => {
  const displayElement = document.getElementById("display");
  let lastLayoutKey = "";

  const createSegmentPath = (segmentWidth) => {
    const halfWidth = segmentWidth / 2;
    const tip = Math.max(4, Math.round(segmentWidth * 0.4));
    const gap = Math.max(2, Math.round(segmentWidth * 0.2));
    const margin = 12;
    const xLeft = margin;
    const xRight = 72 - margin;
    const yTop = 18;
    const yMiddle = 66;
    const yBottom = 114;

    const horzX1 = xLeft + gap;
    const horzX2 = xRight - gap;
    const upperY1 = yTop + gap;
    const upperY2 = yMiddle - gap;
    const lowerY1 = yMiddle + gap;
    const lowerY2 = yBottom - gap;

    const makeHorizontal = (y) =>
      `M ${horzX1 + tip} ${y - halfWidth} L ${horzX2 - tip} ${
        y - halfWidth
      } L ${horzX2} ${y} L ${horzX2 - tip} ${y + halfWidth} L ${horzX1 + tip} ${
        y + halfWidth
      } L ${horzX1} ${y} Z`;

    const makeVertical = (x, y1, y2) =>
      `M ${x} ${y1} L ${x + halfWidth} ${y1 + tip} L ${x + halfWidth} ${
        y2 - tip
      } L ${x} ${y2} L ${x - halfWidth} ${y2 - tip} L ${x - halfWidth} ${
        y1 + tip
      } Z`;

    return {
      a: makeHorizontal(yTop),
      b: makeVertical(xRight, upperY1, upperY2),
      c: makeVertical(xRight, lowerY1, lowerY2),
      d: makeHorizontal(yBottom),
      e: makeVertical(xLeft, lowerY1, lowerY2),
      f: makeVertical(xLeft, upperY1, upperY2),
      g: makeHorizontal(yMiddle),
    };
  };

  const createDigit = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "digit";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 72 140");

    const computedStyle = getComputedStyle(document.documentElement);
    const segmentWidth =
      parseFloat(computedStyle.getPropertyValue("--seg-w")) || 16;
    const segments = createSegmentPath(segmentWidth);

    Object.entries(segments).forEach(([name, pathData]) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", pathData);
      path.setAttribute("class", `seg ${name}`);
      svg.appendChild(path);
    });

    wrapper.appendChild(svg);
    return wrapper;
  };

  const createColon = () => {
    const colon = document.createElement("div");
    colon.className = "colon";
    ["top", "bottom"].forEach((position) => {
      const dot = document.createElement("div");
      dot.className = `dot ${position}`;
      colon.appendChild(dot);
    });
    return colon;
  };

  const ensureLayout = (text) => {
    const layoutKey = text.replace(/\d/g, "D");
    if (layoutKey === lastLayoutKey) return;
    lastLayoutKey = layoutKey;
    displayElement.innerHTML = "";
    for (const char of text) {
      displayElement.appendChild(char === ":" ? createColon() : createDigit());
    }
  };

  const render = (text) => {
    ensureLayout(text);
    const characters = [...text];
    characters.forEach((char, index) => {
      if (char === ":") {
        displayElement.children[index]
          .querySelectorAll(".dot")
          .forEach((dot) => dot.classList.add("on"));
      } else {
        const segments = SEGMENT_MAP[char] || [];
        const digit = displayElement.children[index];
        digit
          .querySelectorAll(".seg")
          .forEach((seg) => seg.classList.remove("on"));
        segments.forEach((segmentName) => {
          const segment = digit.querySelector(`.seg.${segmentName}`);
          if (segment) segment.classList.add("on");
        });
      }
    });
  };

  return { render };
})();

// ===== タイマー/ストップウォッチの状態管理 =====
const TimerState = (() => {
  let state = {
    isStopwatch: false,
    isRunning: false,
    isCurrentTimeMode: false, // 現在時刻モードフラグ
    startTime: 0,
    elapsedTime: 0,
    countdownTime: Utils.CONSTANTS.DEFAULT_TIMER_MINUTES * 60 * 1000,
    totalTime: Utils.CONSTANTS.DEFAULT_TIMER_MINUTES * 60 * 1000,
    intervalId: null,
    circuitQueue: [],
    circuitIndex: 0,
    circuitActive: false,
    circuitName: "",
    circuitLoopMode: "none",
    circuitLoopCount: 1,
    circuitLoopRemaining: 1,
    circuitOriginalSteps: [],
    circuitCurrentLoopCount: 1, // 現在のループ回数（無限ループ用）
  };

  const savedCircuits = [];

  const get = () => ({ ...state });
  const set = (updates) => {
    state = { ...state, ...updates };
  };

  const resetCircuit = () => {
    set({
      circuitQueue: [],
      circuitIndex: 0,
      circuitActive: false,
      circuitName: "",
      circuitLoopMode: "none",
      circuitLoopCount: 1,
      circuitLoopRemaining: 1,
      circuitOriginalSteps: [],
      circuitCurrentLoopCount: 1,
    });
  };

  const startCircuit = (circuit) => {
    savedCircuits.push(circuit);
    const loop = circuit.loop || { mode: "none", count: 1 };

    // ステップの配列を処理（msのみの場合は互換性のため変換）
    const steps = circuit.steps.map((step) =>
      typeof step === "number" ? { ms: step, note: "" } : step
    );

    set({
      circuitQueue: steps,
      circuitIndex: 0,
      circuitActive: true,
      circuitName: circuit.name,
      countdownTime: steps[0].ms,
      totalTime: steps[0].ms,
      circuitLoopMode: loop.mode,
      circuitLoopCount: loop.count,
      circuitLoopRemaining: loop.count,
      circuitOriginalSteps: [...steps],
      circuitCurrentLoopCount: 1, // 1回目から開始
    });

    // サーキット進行状況の表示を更新
    TimerControl.updateCircuitProgressDisplay();
  };

  const getSavedCircuits = () => [...savedCircuits];

  return { get, set, resetCircuit, startCircuit, getSavedCircuits };
})();

// ===== タイマーコントロール =====
const TimerControl = (() => {
  const toggleButton = Utils.getElement("toggle");
  // circuitProgress要素は削除されたため、この変数は使用しない
  let isHandlingTimerEnd = false;

  const updateToggleButton = (isRunning) => {
    toggleButton.classList.toggle("active", isRunning);
    toggleButton.innerHTML = isRunning
      ? '<i class="fas fa-pause"></i>'
      : '<i class="fas fa-play"></i>';
    toggleButton.setAttribute("aria-label", isRunning ? "一時停止" : "開始");
  };

  const formatCircuitTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      if (minutes > 0) {
        return `${hours}時間${minutes}分`;
      }
      return `${hours}時間`;
    } else if (minutes > 0) {
      if (seconds > 0) {
        return `${minutes}分${seconds}秒`;
      }
      return `${minutes}分`;
    } else {
      return `${seconds}秒`;
    }
  };

  const formatStepTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(" ");
  };

  const updateCircuitProgress = () => {
    const state = TimerState.get();
    const circuitProgressEl = document.getElementById("circuitProgress");
    const circuitTimeInfo = document.getElementById("circuitTimeInfo");
    const circuitStepInfo = document.getElementById("circuitStepInfo");
    const circuitLoopInfo = document.getElementById("circuitLoopInfo");

    if (state.circuitActive && state.circuitQueue.length > 0) {
      const currentStep = state.circuitIndex + 1;
      const totalSteps = state.circuitQueue.length;

      // 現在のステップの設定時間を表示
      const timeDisplay = formatStepTime(state.totalTime);

      let loopInfo = "";
      if (state.circuitLoopMode === "infinite") {
        loopInfo = `∞ Loop ${state.circuitCurrentLoopCount}`;
      } else if (
        state.circuitLoopMode === "count" &&
        state.circuitLoopCount > 1
      ) {
        const currentLoop =
          state.circuitLoopCount - state.circuitLoopRemaining + 1;
        loopInfo = `Loop ${currentLoop}/${state.circuitLoopCount}`;
      }

      // サーキット進行状況を表示
      if (
        circuitProgressEl &&
        circuitTimeInfo &&
        circuitStepInfo &&
        circuitLoopInfo
      ) {
        circuitProgressEl.style.display = "block";
        circuitTimeInfo.textContent = timeDisplay;
        circuitStepInfo.textContent = `Step ${currentStep}/${totalSteps}`;
        circuitLoopInfo.textContent = loopInfo;
      }

      // 現在のステップのメモを表示
      const currentStepData = state.circuitQueue[state.circuitIndex];
      const stepNote =
        typeof currentStepData === "object" ? currentStepData.note : "";
      if (stepNote && stepNote.trim()) {
        displayCircuitNote(stepNote);
      } else {
        hideCircuitNote();
      }
    } else {
      // サーキットが非アクティブの場合は非表示
      if (circuitProgressEl) {
        circuitProgressEl.style.display = "none";
      }
      hideCircuitNote();
    }
  };

  const updateDisplay = () => {
    const state = TimerState.get();

    if (state.isStopwatch) {
      // ストップウォッチモード：実行中のみ時間を計算
      const elapsed = state.isRunning
        ? Date.now() - state.startTime + state.elapsedTime
        : state.elapsedTime;

      // 現在時刻モードの時は表示を更新しない（バックグラウンドで動き続ける）
      if (!state.isCurrentTimeMode) {
        SevenSegmentDisplay.render(Utils.formatTime.hms(elapsed));
      }
      // ストップウォッチモードではサーキット進行状況を非表示にする
      // circuitProgress要素は削除されたため、処理をスキップ
    } else {
      // タイマーモード：残り時間を計算
      const remaining = state.countdownTime - (Date.now() - state.startTime);

      // タイマー終了チェック（現在時刻モードでも検知する）
      if (remaining <= 0) {
        handleTimerEnd();
        return; // 終了処理を実行したらここで終了
      }

      // 現在時刻モードの時は表示を更新しない（バックグラウンドで動き続ける）
      if (!state.isCurrentTimeMode) {
        const format =
          state.totalTime <= Utils.CONSTANTS.HOUR_IN_MS
            ? Utils.formatTime.mmss
            : Utils.formatTime.hms;
        SevenSegmentDisplay.render(format(remaining));
        updateCircuitProgress();
      }
    }
  };

  const handleTimerEnd = () => {
    // 重複処理を防ぐ
    if (isHandlingTimerEnd) return;
    isHandlingTimerEnd = true;

    const state = TimerState.get();

    if (
      state.circuitActive &&
      state.circuitIndex < state.circuitQueue.length - 1
    ) {
      // 次のサーキットステップへ（各ステップ完了時にアラーム音を鳴らす）
      console.log(
        `サーキットステップ${state.circuitIndex + 1}完了 - アラーム音を再生`
      );
      AlarmSound.playAlarm();

      const nextIndex = state.circuitIndex + 1;
      const nextStep = state.circuitQueue[nextIndex];
      const nextTime = typeof nextStep === "number" ? nextStep : nextStep.ms;
      TimerState.set({
        circuitIndex: nextIndex,
        countdownTime: nextTime,
        totalTime: nextTime,
        startTime: Date.now(),
      });
      // 現在時刻モードでは表示を更新しない
      if (!state.isCurrentTimeMode) {
        SevenSegmentDisplay.render(Utils.formatTime.mmss(nextTime));
        updateCircuitProgress();
      }
      isHandlingTimerEnd = false;
      return;
    }

    // サーキットの最後のステップが完了した場合、ループを確認
    if (state.circuitActive) {
      console.log("サーキット完了 - ループモード:", state.circuitLoopMode);

      // まず、どの場合でもアラーム音を鳴らす（ループ完了時）
      console.log("ループ完了 - アラーム音を再生");
      AlarmSound.playAlarm();

      // ループ処理
      if (state.circuitLoopMode === "infinite") {
        // 無限ループ：最初のステップから再開
        const newLoopCount = state.circuitCurrentLoopCount + 1;
        console.log(`無限ループ - ${newLoopCount}回目を開始`);
        const nextStep = state.circuitOriginalSteps[0];
        const nextTime = typeof nextStep === "number" ? nextStep : nextStep.ms;
        TimerState.set({
          circuitIndex: 0,
          countdownTime: nextTime,
          totalTime: nextTime,
          startTime: Date.now(),
          circuitCurrentLoopCount: newLoopCount,
        });
        // 現在時刻モードでは表示を更新しない
        if (!state.isCurrentTimeMode) {
          SevenSegmentDisplay.render(Utils.formatTime.mmss(nextTime));
          updateCircuitProgress();
        }
        isHandlingTimerEnd = false;
        return;
      } else if (state.circuitLoopMode === "count") {
        // 回数指定ループ
        const remaining = state.circuitLoopRemaining - 1;
        if (remaining > 0) {
          // まだループが残っている：最初のステップから再開
          console.log(
            `回数指定ループ - 残り${remaining}回、最初のステップから再開`
          );
          const nextStep = state.circuitOriginalSteps[0];
          const nextTime =
            typeof nextStep === "number" ? nextStep : nextStep.ms;
          TimerState.set({
            circuitIndex: 0,
            countdownTime: nextTime,
            totalTime: nextTime,
            startTime: Date.now(),
            circuitLoopRemaining: remaining,
          });
          // 現在時刻モードでは表示を更新しない
          if (!state.isCurrentTimeMode) {
            SevenSegmentDisplay.render(Utils.formatTime.mmss(nextTime));
            updateCircuitProgress();
          }
          isHandlingTimerEnd = false;
          return;
        }
      }

      // ループなし、またはループ完了
      console.log("サーキット完了 - ループなしまたはループ完了");
      stop();

      // 現在時刻モードでは表示を更新しない
      if (!state.isCurrentTimeMode) {
        const format =
          state.totalTime <= Utils.CONSTANTS.HOUR_IN_MS
            ? Utils.formatTime.mmss
            : Utils.formatTime.hms;
        SevenSegmentDisplay.render(format(0));
        // circuitProgress要素は削除されたため、処理をスキップ
      }

      // メモ表示を非表示
      hideCircuitNote();

      setTimeout(() => {
        showAlert(
          "サーキット完了！",
          state.circuitName
            ? `名称: ${state.circuitName}`
            : "すべてのステップが完了しました"
        );
        isHandlingTimerEnd = false;
      }, 300);
      return;
    }

    // 通常のタイマー終了
    stop();

    // 現在時刻モードでは表示を更新しない
    if (!state.isCurrentTimeMode) {
      const format =
        state.totalTime <= Utils.CONSTANTS.HOUR_IN_MS
          ? Utils.formatTime.mmss
          : Utils.formatTime.hms;
      SevenSegmentDisplay.render(format(0));
      // circuitProgress要素は削除されたため、処理をスキップ
    }

    // アラーム音を再生してからアラート表示
    AlarmSound.playAlarm();
    setTimeout(() => {
      showAlert("タイマー終了！", "時間が経過しました");
      isHandlingTimerEnd = false;
    }, 300);
  };

  const start = () => {
    const state = TimerState.get();
    const intervalId = setInterval(updateDisplay, INTERVAL_UPDATE_MS);
    TimerState.set({
      isRunning: true,
      startTime: Date.now(),
      intervalId,
    });
    updateToggleButton(true);
    updateCircuitProgress();
  };

  const pause = () => {
    const state = TimerState.get();
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }

    if (state.isStopwatch) {
      TimerState.set({
        elapsedTime: state.elapsedTime + (Date.now() - state.startTime),
      });
    } else {
      TimerState.set({
        countdownTime: state.countdownTime - (Date.now() - state.startTime),
      });
    }

    TimerState.set({ isRunning: false, intervalId: null });
    updateToggleButton(false);
  };

  const stop = () => {
    const state = TimerState.get();
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
    TimerState.set({ isRunning: false, intervalId: null });
    updateToggleButton(false);
  };

  const reset = () => {
    stop();
    const state = TimerState.get();

    if (state.isStopwatch) {
      TimerState.set({ elapsedTime: 0, startTime: 0 });
      SevenSegmentDisplay.render("00:00:00");
      // circuitProgress要素は削除されたため、処理をスキップ
    } else {
      if (state.circuitActive && state.circuitQueue.length) {
        const firstStep = state.circuitQueue[0];
        const firstStepTime =
          typeof firstStep === "number" ? firstStep : firstStep.ms;
        TimerState.set({
          circuitIndex: 0,
          countdownTime: firstStepTime,
          totalTime: firstStepTime,
        });
        updateCircuitProgress();
        const format =
          firstStepTime <= Utils.CONSTANTS.HOUR_IN_MS
            ? Utils.formatTime.mmss
            : Utils.formatTime.hms;
        SevenSegmentDisplay.render(format(firstStepTime));
      } else {
        // タイマーモードの場合、totalTimeをリセット時間として使用
        const resetTime = state.totalTime;
        TimerState.set({ countdownTime: resetTime });
        // circuitProgress要素は削除されたため、処理をスキップ
        const format =
          resetTime <= Utils.CONSTANTS.HOUR_IN_MS
            ? Utils.formatTime.mmss
            : Utils.formatTime.hms;
        SevenSegmentDisplay.render(format(resetTime));
      }
    }
  };

  const setTimer = (milliseconds) => {
    stop();
    TimerState.resetCircuit();
    TimerState.set({
      countdownTime: milliseconds,
      totalTime: milliseconds,
    });
    const format =
      milliseconds <= Utils.CONSTANTS.HOUR_IN_MS
        ? Utils.formatTime.mmss
        : Utils.formatTime.hms;
    SevenSegmentDisplay.render(format(milliseconds));
    // サーキット進行状況とメモを非表示
    updateCircuitProgress();
    hideCircuitNote();
  };

  toggleButton.addEventListener("click", () => {
    const state = TimerState.get();
    state.isRunning ? pause() : start();
  });

  document.getElementById("reset").addEventListener("click", reset);

  return {
    start,
    pause,
    stop,
    reset,
    setTimer,
    updateToggleButton,
    updateCircuitProgressDisplay: updateCircuitProgress,
  };
})();

// ===== モード切り替え =====
const ModeSwitch = (() => {
  const timerButton = document.getElementById("timerMode");
  const stopwatchButton = document.getElementById("stopwatchMode");
  const currentTimeButton = document.getElementById("currentTimeMode");
  const menuToggle = document.getElementById("openMenu");
  const sideMenu = document.getElementById("sideMenu");
  let currentTimeInterval = null;
  let backgroundTimerCheckInterval = null; // バックグラウンドタイマーチェック用

  // タイマーとストップウォッチの状態を独立して保存
  let timerSavedState = null;
  let stopwatchSavedState = null;

  // 現在時刻モード用のバックグラウンド状態
  let backgroundState = {
    mode: null, // 'timer' or 'stopwatch'
    isRunning: false,
    startTime: 0,
    elapsedTime: 0,
    countdownTime: 0,
    totalTime: 0,
    intervalId: null,
    circuitQueue: [],
    circuitIndex: 0,
    circuitActive: false,
    circuitName: "",
    circuitNote: "",
    circuitLoopMode: "none",
    circuitLoopCount: 1,
    circuitLoopRemaining: 1,
    circuitOriginalSteps: [],
    circuitCurrentLoopCount: 1,
  };

  // タイマーの状態を保存
  const saveTimerState = () => {
    const state = TimerState.get();
    if (state.isStopwatch) return; // ストップウォッチモードの場合は何もしない

    let savedCountdownTime = state.countdownTime;
    let pausedAt = null;

    if (state.isRunning && state.intervalId) {
      pausedAt = Date.now();
      const elapsed = pausedAt - state.startTime;
      savedCountdownTime = state.countdownTime - elapsed;
      if (savedCountdownTime < 0) savedCountdownTime = 0;
    }

    timerSavedState = {
      isRunning: state.isRunning,
      startTime: state.startTime,
      countdownTime: savedCountdownTime,
      totalTime: state.totalTime,
      intervalId: state.intervalId,
      pausedAt: pausedAt,
      circuitQueue: state.circuitQueue,
      circuitIndex: state.circuitIndex,
      circuitActive: state.circuitActive,
      circuitName: state.circuitName,
      circuitLoopMode: state.circuitLoopMode,
      circuitLoopCount: state.circuitLoopCount,
      circuitLoopRemaining: state.circuitLoopRemaining,
      circuitOriginalSteps: state.circuitOriginalSteps,
      circuitCurrentLoopCount: state.circuitCurrentLoopCount,
    };

    console.log("💾 タイマー状態を保存:", timerSavedState);
  };

  // ストップウォッチの状態を保存
  const saveStopwatchState = () => {
    const state = TimerState.get();
    if (!state.isStopwatch) return; // タイマーモードの場合は何もしない

    let savedElapsedTime = state.elapsedTime;
    let pausedAt = null;

    if (state.isRunning && state.intervalId) {
      pausedAt = Date.now();
      const elapsed = pausedAt - state.startTime;
      savedElapsedTime = state.elapsedTime + elapsed;
    }

    stopwatchSavedState = {
      isRunning: state.isRunning,
      startTime: state.startTime,
      elapsedTime: savedElapsedTime,
      intervalId: state.intervalId,
      pausedAt: pausedAt,
    };

    console.log("💾 ストップウォッチ状態を保存:", stopwatchSavedState);
  };

  const saveBackgroundState = () => {
    const state = TimerState.get();

    // 実行中の場合は、現在時刻を保存して時間差を計算できるようにする
    let pausedAt = null;
    let savedElapsedTime = state.elapsedTime;
    let savedCountdownTime = state.countdownTime;

    if (state.isRunning && state.intervalId) {
      pausedAt = Date.now();
      // 現在時刻までの経過時間を計算
      const elapsed = pausedAt - state.startTime;

      if (state.isStopwatch) {
        savedElapsedTime = state.elapsedTime + elapsed;
      } else {
        savedCountdownTime = state.countdownTime - elapsed;
        if (savedCountdownTime < 0) savedCountdownTime = 0;
      }
    }

    backgroundState = {
      mode: state.isStopwatch ? "stopwatch" : "timer",
      isRunning: state.isRunning,
      startTime: state.startTime,
      elapsedTime: savedElapsedTime,
      countdownTime: savedCountdownTime,
      totalTime: state.totalTime,
      intervalId: state.intervalId,
      pausedAt: pausedAt, // 一時停止時の時刻
      // サーキット情報も保存
      circuitQueue: state.circuitQueue,
      circuitIndex: state.circuitIndex,
      circuitActive: state.circuitActive,
      circuitName: state.circuitName,
      circuitLoopMode: state.circuitLoopMode,
      circuitLoopCount: state.circuitLoopCount,
      circuitLoopRemaining: state.circuitLoopRemaining,
      circuitOriginalSteps: state.circuitOriginalSteps,
      circuitCurrentLoopCount: state.circuitCurrentLoopCount,
    };
    console.log(
      "💾 バックグラウンド状態を保存（タイマーは継続実行）:",
      backgroundState
    );
  };

  // バックグラウンドタイマーのチェックを開始
  const startBackgroundTimerCheck = () => {
    // 既存のチェックをクリア
    if (backgroundTimerCheckInterval) {
      clearInterval(backgroundTimerCheckInterval);
      backgroundTimerCheckInterval = null;
    }

    // タイマーの保存状態がない、または実行中でない場合は何もしない
    if (!timerSavedState || !timerSavedState.isRunning) {
      return;
    }

    console.log("🔄 バックグラウンドタイマーチェックを開始");

    // 100msごとにタイマー終了をチェック
    backgroundTimerCheckInterval = setInterval(() => {
      if (!timerSavedState || !timerSavedState.isRunning) {
        clearInterval(backgroundTimerCheckInterval);
        backgroundTimerCheckInterval = null;
        return;
      }

      // 経過時間を計算
      const now = Date.now();
      const elapsed = now - timerSavedState.pausedAt;
      const remainingTime = timerSavedState.countdownTime - elapsed;

      // タイマー終了をチェック
      if (remainingTime <= 0) {
        console.log("⏰ バックグラウンドタイマーが終了しました");

        // サーキットの場合
        if (
          timerSavedState.circuitActive &&
          timerSavedState.circuitQueue &&
          timerSavedState.circuitQueue.length > 0
        ) {
          // アラーム音を再生
          AlarmSound.playAlarm();

          // 次のステップがあるかチェック
          if (
            timerSavedState.circuitIndex <
            timerSavedState.circuitQueue.length - 1
          ) {
            // 次のサーキットステップへ
            console.log(
              `サーキットステップ${
                timerSavedState.circuitIndex + 1
              }完了 - 次のステップへ`
            );
            const nextIndex = timerSavedState.circuitIndex + 1;
            const nextStep = timerSavedState.circuitQueue[nextIndex];
            const nextTime =
              typeof nextStep === "number" ? nextStep : nextStep.ms;

            timerSavedState.circuitIndex = nextIndex;
            timerSavedState.countdownTime = nextTime;
            timerSavedState.totalTime = nextTime;
            timerSavedState.pausedAt = Date.now();

            return; // 次のステップに進んだので継続
          } else {
            // サーキットの最後のステップ - ループをチェック
            console.log(
              "サーキット完了 - ループモード:",
              timerSavedState.circuitLoopMode
            );

            if (timerSavedState.circuitLoopMode === "infinite") {
              // 無限ループ：最初のステップから再開
              const newLoopCount = timerSavedState.circuitCurrentLoopCount + 1;
              console.log(`無限ループ - ${newLoopCount}回目を開始`);
              const nextStep = timerSavedState.circuitOriginalSteps[0];
              const nextTime =
                typeof nextStep === "number" ? nextStep : nextStep.ms;

              timerSavedState.circuitIndex = 0;
              timerSavedState.countdownTime = nextTime;
              timerSavedState.totalTime = nextTime;
              timerSavedState.pausedAt = Date.now();
              timerSavedState.circuitCurrentLoopCount = newLoopCount;

              return; // ループ継続
            } else if (timerSavedState.circuitLoopMode === "count") {
              // 回数指定ループ
              const remaining = timerSavedState.circuitLoopRemaining - 1;
              if (remaining > 0) {
                // まだループが残っている：最初のステップから再開
                console.log(
                  `回数指定ループ - 残り${remaining}回、最初のステップから再開`
                );
                const nextStep = timerSavedState.circuitOriginalSteps[0];
                const nextTime =
                  typeof nextStep === "number" ? nextStep : nextStep.ms;

                timerSavedState.circuitIndex = 0;
                timerSavedState.countdownTime = nextTime;
                timerSavedState.totalTime = nextTime;
                timerSavedState.pausedAt = Date.now();
                timerSavedState.circuitLoopRemaining = remaining;

                return; // ループ継続
              }
            }

            // ループなし、またはループ完了
            console.log("サーキット完了 - ループなしまたはループ完了");
            clearInterval(backgroundTimerCheckInterval);
            backgroundTimerCheckInterval = null;

            timerSavedState.isRunning = false;
            timerSavedState.countdownTime = 0;

            setTimeout(() => {
              showAlert(
                "サーキット完了！",
                timerSavedState.circuitName
                  ? `名称: ${timerSavedState.circuitName}`
                  : "すべてのステップが完了しました"
              );
            }, 300);
          }
        } else {
          // 通常のタイマー終了
          clearInterval(backgroundTimerCheckInterval);
          backgroundTimerCheckInterval = null;

          timerSavedState.isRunning = false;
          timerSavedState.countdownTime = 0;

          // アラーム音を再生
          AlarmSound.playAlarm();

          // アラートを表示
          setTimeout(() => {
            showAlert("タイマー終了！", "時間が経過しました");
          }, 300);
        }
      }
    }, 100);
  };

  // バックグラウンドタイマーのチェックを停止
  const stopBackgroundTimerCheck = () => {
    if (backgroundTimerCheckInterval) {
      clearInterval(backgroundTimerCheckInterval);
      backgroundTimerCheckInterval = null;
      console.log("🛑 バックグラウンドタイマーチェックを停止");
    }
  };

  const restoreBackgroundState = () => {
    if (!backgroundState.mode) return;

    // バックグラウンドタイマーチェックを停止（タイマー/ストップウォッチに戻るため）
    stopBackgroundTimerCheck();

    console.log(
      "🔄 タイマーをバックグラウンドから復元します:",
      backgroundState
    );

    // 現在時刻モードを解除
    const wasRunning = backgroundState.isRunning;
    TimerState.set({ isCurrentTimeMode: false });

    // バックグラウンドで経過した時間を計算
    let elapsedTime = 0;
    let countdownTime = 0;

    if (backgroundState.isRunning && backgroundState.pausedAt) {
      // pausedAt以降に経過した時間を加算
      const now = Date.now();
      const additionalElapsed = now - backgroundState.pausedAt;

      if (backgroundState.mode === "stopwatch") {
        elapsedTime = backgroundState.elapsedTime + additionalElapsed;
      } else if (backgroundState.mode === "timer") {
        countdownTime = backgroundState.countdownTime - additionalElapsed;
        if (countdownTime < 0) countdownTime = 0;
      }
    } else {
      // 実行していなかった場合は保存された値をそのまま使用
      elapsedTime = backgroundState.elapsedTime;
      countdownTime = backgroundState.countdownTime;
    }

    if (backgroundState.mode === "stopwatch") {
      // ストップウォッチモードに切り替え（shouldRestore=trueなので何もしない）
      switchToStopwatch(true);

      // 計算した経過時間を設定
      TimerState.set({
        isStopwatch: true,
        elapsedTime: elapsedTime,
        startTime: 0,
        countdownTime: 0,
        totalTime: 0,
      });

      // 表示を更新
      SevenSegmentDisplay.render(Utils.formatTime.hms(elapsedTime));

      // 実行中だった場合は再開
      if (wasRunning) {
        TimerControl.start();
      }
    } else if (backgroundState.mode === "timer") {
      // タイマーモードに切り替え
      // backgroundStateの内容をtimerSavedStateに反映してからswitchToTimer()で処理
      if (timerSavedState === null) {
        timerSavedState = {
          isRunning: backgroundState.isRunning,
          startTime: backgroundState.startTime,
          countdownTime: backgroundState.countdownTime,
          totalTime: backgroundState.totalTime,
          intervalId: backgroundState.intervalId,
          pausedAt: backgroundState.pausedAt,
          circuitQueue: backgroundState.circuitQueue || [],
          circuitIndex: backgroundState.circuitIndex || 0,
          circuitActive: backgroundState.circuitActive || false,
          circuitName: backgroundState.circuitName || "",
          circuitLoopMode: backgroundState.circuitLoopMode || "none",
          circuitLoopCount: backgroundState.circuitLoopCount || 1,
          circuitLoopRemaining: backgroundState.circuitLoopRemaining || 1,
          circuitOriginalSteps: backgroundState.circuitOriginalSteps || [],
          circuitCurrentLoopCount: backgroundState.circuitCurrentLoopCount || 1,
        };
      }

      switchToTimer();
    }

    // 状態をクリア
    backgroundState = {
      mode: null,
      isRunning: false,
      startTime: 0,
      elapsedTime: 0,
      countdownTime: 0,
      totalTime: 0,
      intervalId: null,
      circuitQueue: [],
      circuitIndex: 0,
      circuitActive: false,
      circuitName: "",
      circuitLoopMode: "none",
      circuitLoopCount: 1,
      circuitLoopRemaining: 1,
      circuitOriginalSteps: [],
      circuitCurrentLoopCount: 1,
    };
  };

  const switchToStopwatch = (shouldRestore = false) => {
    // タイマーの状態を保存
    saveTimerState();

    // 前のモードのインターバルをクリア
    const prevState = TimerState.get();
    if (prevState.intervalId) {
      clearInterval(prevState.intervalId);
    }
    TimerControl.stop();

    // ストップウォッチの保存状態があれば復元、なければ初期化
    if (stopwatchSavedState) {
      console.log("🔄 ストップウォッチ状態を復元:", stopwatchSavedState);

      let elapsedTime = stopwatchSavedState.elapsedTime;

      // 保存時に実行中だった場合、経過時間を加算
      if (stopwatchSavedState.isRunning && stopwatchSavedState.pausedAt) {
        const additionalElapsed = Date.now() - stopwatchSavedState.pausedAt;
        elapsedTime += additionalElapsed;
      }

      TimerState.set({
        isStopwatch: true,
        isCurrentTimeMode: false,
        elapsedTime: elapsedTime,
        startTime: 0,
        isRunning: false,
        intervalId: null,
        // サーキット情報をクリア
        circuitQueue: [],
        circuitIndex: 0,
        circuitActive: false,
        circuitName: "",
        circuitLoopMode: "none",
        circuitLoopCount: 1,
        circuitLoopRemaining: 1,
        circuitOriginalSteps: [],
        circuitCurrentLoopCount: 1,
      });

      SevenSegmentDisplay.render(Utils.formatTime.hms(elapsedTime));

      // 実行中だった場合は再開
      if (stopwatchSavedState.isRunning) {
        TimerControl.start();
      }
    } else if (!shouldRestore) {
      // 保存状態がなく、復元フラグもない場合は初期化
      TimerState.set({
        isStopwatch: true,
        isCurrentTimeMode: false,
        elapsedTime: 0,
        startTime: 0,
        isRunning: false,
        intervalId: null,
        // サーキット情報をクリア
        circuitQueue: [],
        circuitIndex: 0,
        circuitActive: false,
        circuitName: "",
        circuitLoopMode: "none",
        circuitLoopCount: 1,
        circuitLoopRemaining: 1,
        circuitOriginalSteps: [],
        circuitCurrentLoopCount: 1,
      });
      SevenSegmentDisplay.render("00:00:00");
    } else {
      // 復元時はモードだけ変更
      TimerState.set({
        isStopwatch: true,
        isCurrentTimeMode: false,
        // サーキット情報をクリア
        circuitQueue: [],
        circuitIndex: 0,
        circuitActive: false,
        circuitName: "",
        circuitLoopMode: "none",
        circuitLoopCount: 1,
        circuitLoopRemaining: 1,
        circuitOriginalSteps: [],
        circuitCurrentLoopCount: 1,
      });
    }
    // メニュー内容をタイマーに戻す
    const timerMenuContent = document.getElementById("timer-menu-content");
    const alarmMenuContent = document.getElementById("alarm-menu-content");
    if (timerMenuContent) timerMenuContent.style.display = "block";
    if (alarmMenuContent) alarmMenuContent.style.display = "none";

    sideMenu.classList.remove("open");
    menuToggle.style.display = "none"; // ストップウォッチモードではメニューボタンを非表示

    // コントロールボタンを再表示（現在時刻モードから戻る場合）
    const controls = document.querySelector(".controls");
    if (controls) {
      controls.style.display = "flex";
    }

    // 日付表示を非表示
    const dateDisplay = document.getElementById("dateDisplay");
    if (dateDisplay) {
      dateDisplay.style.display = "none";
    }

    // メモ表示を非表示
    hideCircuitNote();

    // bodyにストップウォッチモードクラスを追加
    document.body.classList.add("stopwatch-mode");
    document.body.classList.remove("timer-mode");

    // ストップウォッチモードではサーキット進行状況を非表示にする
    const circuitProgressEl = document.getElementById("circuitProgress");
    if (circuitProgressEl) {
      circuitProgressEl.style.display = "none";
    }

    // ストップウォッチモード（hh:mm:ss形式）では表示サイズを80%に調整
    const currentScale = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--disp-scale"
      )
    );
    if (!currentScale || currentScale === 1.0) {
      document.documentElement.style.setProperty("--disp-scale", "0.8");
    }

    // ストップウォッチモードのクラスを追加
    const display = document.getElementById("display");
    if (display) {
      display.classList.add("stopwatch-mode");
      display.classList.remove("timer-mode");
      console.log(
        "Stopwatch mode: classes added",
        display.classList.toString()
      );
    }

    timerButton.classList.remove("active");
    stopwatchButton.classList.add("active");
    if (currentTimeButton) {
      currentTimeButton.classList.remove("active");
      currentTimeButton.setAttribute("aria-pressed", "false");
      // アイコンを非アクティブ状態に戻す
      const icon = currentTimeButton.querySelector(".mode-icon i");
      if (icon) {
        icon.className = "fas fa-calendar";
      }
    }
    timerButton.setAttribute("aria-pressed", "false");
    stopwatchButton.setAttribute("aria-pressed", "true");

    // バックグラウンドでタイマーをチェック（タイマーが実行中の場合）
    startBackgroundTimerCheck();
  };

  const switchToTimer = (shouldRestore = false) => {
    // バックグラウンドタイマーチェックを停止
    stopBackgroundTimerCheck();
    // ストップウォッチの状態を保存
    saveStopwatchState();

    // 前のモードのインターバルをクリア
    const prevState = TimerState.get();
    if (prevState.intervalId) {
      clearInterval(prevState.intervalId);
    }
    TimerControl.stop();

    // タイマーの保存状態があれば復元、なければ初期化
    if (timerSavedState) {
      console.log("🔄 タイマー状態を復元:", timerSavedState);

      let countdownTime = timerSavedState.countdownTime;

      // 保存時に実行中だった場合、経過時間を減算
      if (timerSavedState.isRunning && timerSavedState.pausedAt) {
        const additionalElapsed = Date.now() - timerSavedState.pausedAt;
        countdownTime -= additionalElapsed;
        if (countdownTime < 0) countdownTime = 0;
      }

      TimerState.set({
        isStopwatch: false,
        isCurrentTimeMode: false,
        elapsedTime: 0,
        countdownTime: countdownTime,
        totalTime: timerSavedState.totalTime,
        isRunning: false,
        intervalId: null,
        startTime: 0,
        circuitQueue: timerSavedState.circuitQueue || [],
        circuitIndex: timerSavedState.circuitIndex || 0,
        circuitActive: timerSavedState.circuitActive || false,
        circuitName: timerSavedState.circuitName || "",
        circuitLoopMode: timerSavedState.circuitLoopMode || "none",
        circuitLoopCount: timerSavedState.circuitLoopCount || 1,
        circuitLoopRemaining: timerSavedState.circuitLoopRemaining || 1,
        circuitOriginalSteps: timerSavedState.circuitOriginalSteps || [],
        circuitCurrentLoopCount: timerSavedState.circuitCurrentLoopCount || 1,
      });

      const format =
        timerSavedState.totalTime <= Utils.CONSTANTS.HOUR_IN_MS
          ? Utils.formatTime.mmss
          : Utils.formatTime.hms;
      SevenSegmentDisplay.render(format(Math.max(0, countdownTime)));

      // サーキット進行状況を更新
      if (timerSavedState.circuitActive) {
        TimerControl.updateCircuitProgressDisplay();
      }

      // 実行中だった場合は再開（タイマーが終了していない場合のみ）
      if (timerSavedState.isRunning && countdownTime > 0) {
        TimerControl.start();
      }
    } else if (!shouldRestore) {
      // 保存状態がなく、復元フラグもない場合は初期化
      const activeButton = document.querySelector(
        "#timerOptions button.active"
      );
      let timerTime = 10 * 60 * 1000; // デフォルト10分
      if (activeButton) {
        const minutes = parseInt(activeButton.dataset.minutes, 10);
        timerTime = minutes * 60 * 1000;
      }

      TimerState.set({
        isStopwatch: false,
        isCurrentTimeMode: false,
        elapsedTime: 0,
        countdownTime: timerTime,
        totalTime: timerTime,
        isRunning: false,
        intervalId: null,
        startTime: 0,
      });

      const format =
        timerTime <= Utils.CONSTANTS.HOUR_IN_MS
          ? Utils.formatTime.mmss
          : Utils.formatTime.hms;
      SevenSegmentDisplay.render(format(timerTime));
    } else {
      // 復元時はモードだけ変更
      TimerState.set({
        isStopwatch: false,
        isCurrentTimeMode: false,
      });
    }

    // タイマーモード（mm:ss形式）では表示サイズを100%に調整
    const currentScale = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--disp-scale"
      )
    );
    if (!currentScale || currentScale === 1.0) {
      document.documentElement.style.setProperty("--disp-scale", "1.0");
    }

    // タイマーモードのクラスを追加
    const display = document.getElementById("display");
    if (display) {
      display.classList.add("timer-mode");
      display.classList.remove("stopwatch-mode");
      console.log("Timer mode: classes added", display.classList.toString());
    }

    // bodyにタイマーモードクラスを追加
    document.body.classList.add("timer-mode");
    document.body.classList.remove("stopwatch-mode");

    // メニュー内容をタイマーに戻す
    const timerMenuContent = document.getElementById("timer-menu-content");
    const alarmMenuContent = document.getElementById("alarm-menu-content");
    if (timerMenuContent) timerMenuContent.style.display = "block";
    if (alarmMenuContent) alarmMenuContent.style.display = "none";

    // タイマーモードではメニューボタンを表示
    menuToggle.style.display = "block";

    // コントロールボタンを再表示（現在時刻モードから戻る場合）
    const controls = document.querySelector(".controls");
    if (controls) {
      controls.style.display = "flex";
    }

    // 日付表示を非表示
    const dateDisplay = document.getElementById("dateDisplay");
    if (dateDisplay) {
      dateDisplay.style.display = "none";
    }

    timerButton.classList.add("active");
    stopwatchButton.classList.remove("active");
    if (currentTimeButton) {
      currentTimeButton.classList.remove("active");
      currentTimeButton.setAttribute("aria-pressed", "false");
      // アイコンを非アクティブ状態に戻す
      const icon = currentTimeButton.querySelector(".mode-icon i");
      if (icon) {
        icon.className = "fas fa-calendar";
      }
    }
    timerButton.setAttribute("aria-pressed", "true");
    stopwatchButton.setAttribute("aria-pressed", "false");

    // サーキット進行状況を更新（サーキットがアクティブな場合）
    TimerControl.updateCircuitProgressDisplay();
  };

  const updateCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    SevenSegmentDisplay.render(`${hours}:${minutes}`);

    // 日付と曜日を更新
    const dateDisplay = document.getElementById("dateDisplay");
    const dateText = document.getElementById("dateText");
    const dayText = document.getElementById("dayText");

    if (dateDisplay && dateText && dayText) {
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[now.getDay()];

      dateText.textContent = `${month}/${date}`;
      dayText.textContent = dayName;
    }
  };

  const switchToCurrentTime = () => {
    // 既存のインターバルをクリア
    if (currentTimeInterval) {
      clearInterval(currentTimeInterval);
      currentTimeInterval = null;
    }

    // 現在のモードの状態を保存（タイマーまたはストップウォッチ）
    const state = TimerState.get();
    if (state.isStopwatch) {
      saveStopwatchState();
    } else {
      saveTimerState();
    }

    // 現在の状態を保存（タイマーは動き続ける）
    saveBackgroundState();

    // 現在時刻モードに設定（タイマーは動き続けるが表示は更新しない）
    TimerState.set({ isCurrentTimeMode: true });

    // タイマーは動き続ける（intervalIdは保持）
    // 表示だけ現在時刻に切り替える

    // タイマーモードのクラスを追加
    const display = document.getElementById("display");
    if (display) {
      display.classList.add("timer-mode");
      display.classList.remove("stopwatch-mode");
    }

    // bodyにタイマーモードクラスを追加
    document.body.classList.add("timer-mode");
    document.body.classList.remove("stopwatch-mode");

    // メニュー内容を切り替え（タイマー→アラーム）
    const timerMenuContent = document.getElementById("timer-menu-content");
    const alarmMenuContent = document.getElementById("alarm-menu-content");
    if (timerMenuContent) timerMenuContent.style.display = "none";
    if (alarmMenuContent) alarmMenuContent.style.display = "block";

    // メニューボタンを表示（現在時刻モードでもメニューが使える）
    menuToggle.style.display = "block";

    // コントロールボタンを非表示
    const controls = document.querySelector(".controls");
    if (controls) {
      controls.style.display = "none";
    }

    // 日付表示を表示
    const dateDisplay = document.getElementById("dateDisplay");
    if (dateDisplay) {
      dateDisplay.style.display = "block";
    }

    // サーキット進行状況を非表示
    const circuitProgressEl = document.getElementById("circuitProgress");
    if (circuitProgressEl) {
      circuitProgressEl.style.display = "none";
    }

    // メモ表示を非表示
    hideCircuitNote();

    // 時刻を表示
    updateCurrentTime();

    // 1分ごとに時刻を更新
    currentTimeInterval = setInterval(updateCurrentTime, 60000);

    // ボタンの状態を更新
    timerButton.classList.remove("active");
    stopwatchButton.classList.remove("active");
    currentTimeButton.classList.add("active");
    timerButton.setAttribute("aria-pressed", "false");
    stopwatchButton.setAttribute("aria-pressed", "false");
    currentTimeButton.setAttribute("aria-pressed", "true");

    // アイコンをアクティブ状態に切り替え
    const icon = currentTimeButton.querySelector(".mode-icon i");
    if (icon) {
      icon.className = "fas fa-calendar-alt";
    }

    console.log("🕐 現在時刻モードに切り替えました");

    // バックグラウンドでタイマーをチェック（タイマーが実行中の場合）
    // 現在時刻モードでは元からタイマーが継続する設計だが、
    // ストップウォッチから切り替えた場合もあるため、念のためチェック
    if (state.isStopwatch && timerSavedState && timerSavedState.isRunning) {
      startBackgroundTimerCheck();
    }
  };

  const stopCurrentTime = () => {
    if (currentTimeInterval) {
      clearInterval(currentTimeInterval);
      currentTimeInterval = null;
    }
  };

  stopwatchButton.addEventListener("click", () => {
    stopCurrentTime();

    // 現在時刻モードからストップウォッチモードに復元する場合
    if (backgroundState.mode === "stopwatch") {
      restoreBackgroundState();
    } else {
      // バックグラウンド状態をクリア（別のモードから来た場合）
      backgroundState = {
        mode: null,
        isRunning: false,
        startTime: 0,
        elapsedTime: 0,
        countdownTime: 0,
        totalTime: 0,
        intervalId: null,
        circuitQueue: [],
        circuitIndex: 0,
        circuitActive: false,
        circuitName: "",
        circuitLoopMode: "none",
        circuitLoopCount: 1,
        circuitLoopRemaining: 1,
        circuitOriginalSteps: [],
        circuitCurrentLoopCount: 1,
      };
      // ストップウォッチモードに切り替え（状態を保持）
      switchToStopwatch();
    }
  });

  timerButton.addEventListener("click", () => {
    stopCurrentTime();

    // 現在時刻モードからタイマーモードに復元する場合
    if (backgroundState.mode === "timer") {
      restoreBackgroundState();
    } else {
      // バックグラウンド状態をクリア（別のモードから来た場合）
      backgroundState = {
        mode: null,
        isRunning: false,
        startTime: 0,
        elapsedTime: 0,
        countdownTime: 0,
        totalTime: 0,
        intervalId: null,
        circuitQueue: [],
        circuitIndex: 0,
        circuitActive: false,
        circuitName: "",
        circuitLoopMode: "none",
        circuitLoopCount: 1,
        circuitLoopRemaining: 1,
        circuitOriginalSteps: [],
        circuitCurrentLoopCount: 1,
      };
      // タイマーモードに切り替え（状態を保持）
      switchToTimer();
    }
  });
  if (currentTimeButton) {
    currentTimeButton.addEventListener("click", () => {
      stopCurrentTime();
      switchToCurrentTime();
    });
  }

  // 初期化時にクラスを設定
  const initializeDisplayMode = () => {
    const display = document.getElementById("display");
    if (display) {
      // 初期状態はタイマーモード
      display.classList.add("timer-mode");
      display.classList.remove("stopwatch-mode");
    }
  };

  // 初期化を実行
  initializeDisplayMode();

  // ページ読み込み時にも初期化を実行
  document.addEventListener("DOMContentLoaded", initializeDisplayMode);

  return { switchToStopwatch, switchToTimer };
})();

// ===== ミニマルモード =====
const MinimalMode = (() => {
  const toggleButton = document.getElementById("minimalToggle");
  const body = document.body;
  let isMinimalMode = false;

  const toggle = async () => {
    isMinimalMode = !isMinimalMode;

    if (isMinimalMode) {
      // ミニマルモードに切り替え
      body.classList.add("minimal-mode");
      toggleButton.setAttribute("aria-label", "通常モードに戻る");

      // サイドメニューが開いている場合は閉じる
      const sideMenu = document.getElementById("sideMenu");
      if (sideMenu && sideMenu.classList.contains("open")) {
        SideMenu.close();
      }

      // フルスクリーンモードを試みる（サポートされている場合）
      console.log("🖥️ フルスクリーンを試みます...");
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          console.log("✅ フルスクリーンモードに切り替えました");
        } else if (document.documentElement.webkitRequestFullscreen) {
          // iOS Safari対応
          await document.documentElement.webkitRequestFullscreen();
          console.log("✅ フルスクリーンモードに切り替えました（webkit）");
        } else {
          console.log("⚠️ フルスクリーンAPIはサポートされていません");
        }
      } catch (err) {
        console.log("⚠️ フルスクリーンモードエラー:", err);
      }

      // 画面の向きを横向きにロック（サポートされている場合）
      console.log("🔄 画面の向き制御を試みます...");
      console.log(
        "📱 現在の画面サイズ:",
        window.innerWidth,
        "x",
        window.innerHeight
      );
      console.log("📱 screen.orientation:", screen.orientation);
      console.log("📱 フルスクリーン状態:", !!document.fullscreenElement);

      try {
        if (screen.orientation && screen.orientation.lock) {
          console.log("🔒 orientation.lock('landscape')を実行します...");

          await screen.orientation
            .lock("landscape")
            .then(() => {
              console.log("✅ 画面を横向きにロックしました");
            })
            .catch((err) => {
              console.log("ℹ️ 画面の向きロック:", err.name);

              // NotSupportedErrorは正常（iOS等では未対応）なのでエラーログ出力しない
              if (err.name !== "NotSupportedError") {
                console.warn("⚠️ 画面の向きロック失敗:", err.message);
              }

              // iOS等では画面の向きを自動制御できないため、アラートは表示しない
              // ユーザーが手動で横向きにすることで最適な表示になる
              console.log("💡 画面を横向きにすると、より見やすくなります");
            });
        } else {
          console.log(
            "ℹ️ screen.orientation.lock()はサポートされていません（iOS制限）"
          );
          console.log("💡 画面を横向きにすると、より見やすくなります");
        }
      } catch (err) {
        console.error("❌ 画面の向きロックエラー:", err);
      }
    } else {
      // 通常モードに戻る
      body.classList.remove("minimal-mode");
      toggleButton.setAttribute("aria-label", "ミニマルモード切り替え");

      // フルスクリーンモードを解除
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
          console.log("✅ フルスクリーンモードを解除しました");
        } else if (
          document.webkitFullscreenElement &&
          document.webkitExitFullscreen
        ) {
          // iOS Safari対応
          await document.webkitExitFullscreen();
          console.log("✅ フルスクリーンモードを解除しました（webkit）");
        }
      } catch (err) {
        console.log("⚠️ フルスクリーン解除エラー", err);
      }

      // 画面の向きロックを解除
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (err) {
        console.log("画面の向きロック解除エラー", err);
      }
    }
  };

  const isActive = () => isMinimalMode;

  // イベントリスナーを設定
  toggleButton.addEventListener("click", toggle);

  return { toggle, isActive };
})();

// ===== サイドメニュー =====
const SideMenu = (() => {
  const menu = document.getElementById("sideMenu");
  const toggleButton = document.getElementById("openMenu");

  // 画面幅をチェックしてレスポンシブ対応
  const isMobile = () => window.innerWidth <= 768;

  const updateIcon = (isOpen) => {
    const desktopIcon = toggleButton.querySelector(".desktop-icon");
    const mobileIcon = toggleButton.querySelector(".mobile-icon");

    if (isMobile()) {
      // モバイルでは上下矢印を使用（開く時：上向き、閉じる時：下向き）
      if (mobileIcon) {
        mobileIcon.classList.toggle("fa-chevron-up", !isOpen); // 閉じている時は上向き
        mobileIcon.classList.toggle("fa-chevron-down", isOpen); // 開いている時は下向き
      }
    } else {
      // デスクトップでは左右矢印を使用
      if (desktopIcon) {
        desktopIcon.classList.toggle("fa-angle-double-right", isOpen);
        desktopIcon.classList.toggle("fa-angle-double-left", !isOpen);
      }
    }
    toggleButton.setAttribute(
      "aria-label",
      isOpen ? "メニューを閉じる" : "メニューを開く"
    );
  };

  const open = () => {
    // ミニマルモードの場合は開かない
    if (MinimalMode.isActive()) {
      return;
    }

    menu.classList.add("open");
    updateIcon(true);
  };

  const close = () => {
    menu.classList.remove("open");
    updateIcon(false);
  };

  const toggle = () => {
    // ミニマルモードの場合は何もしない
    if (MinimalMode.isActive()) {
      return;
    }

    menu.classList.contains("open") ? close() : open();
  };

  toggleButton.addEventListener("click", toggle);

  // 画面サイズ変更時のイベントリスナー
  window.addEventListener("resize", () => {
    // メニューが開いている場合、アイコンを更新
    if (menu.classList.contains("open")) {
      updateIcon(true);
    } else {
      updateIcon(false);
    }
  });

  return { open, close, toggle };
})();

// ===== タイマープリセット =====
const TimerPresets = (() => {
  const optionsContainer = document.getElementById("timerOptions");
  const applyButton = document.getElementById("ctApply");

  const buttons = Array.from(optionsContainer.querySelectorAll("button"));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const minutes = parseInt(button.dataset.minutes, 10);
      TimerControl.setTimer(minutes * 60 * 1000);

      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      applyButton.classList.remove("active");

      SideMenu.close();
    });
  });

  return { buttons };
})();

// ===== カスタム時間設定 =====
const CustomTime = (() => {
  const hoursInput = document.getElementById("ctHours");
  const minutesInput = document.getElementById("ctMinutes");
  const secondsInput = document.getElementById("ctSeconds");
  const applyButton = document.getElementById("ctApply");

  const apply = () => {
    const hours = Math.max(0, parseInt(hoursInput.value || "0", 10));
    const minutes = Math.max(
      0,
      Math.min(59, parseInt(minutesInput.value || "0", 10))
    );
    const seconds = Math.max(
      0,
      Math.min(59, parseInt(secondsInput.value || "0", 10))
    );
    const totalMs = ((hours * 60 + minutes) * 60 + seconds) * 1000;

    TimerControl.setTimer(totalMs);

    document.querySelectorAll("#timerOptions button").forEach((btn) => {
      btn.classList.remove("active");
    });
    applyButton.classList.add("active");

    SideMenu.close();
  };

  const bindStepper = (inputId) => {
    const upButton = document.querySelector(
      `.step.up[data-target="${inputId}"]`
    );
    const downButton = document.querySelector(
      `.step.down[data-target="${inputId}"]`
    );
    const input = document.getElementById(inputId);

    if (!upButton || !downButton || !input) return;

    let holdInterval = null;

    // min/maxが設定されている場合は循環、設定されていない場合は通常のclamp
    const processValue = (value) => {
      const min = input.min === "" ? -Infinity : parseInt(input.min, 10);
      const max = input.max === "" ? Infinity : parseInt(input.max, 10);

      // min/maxが両方設定されている場合は循環
      if (min !== -Infinity && max !== Infinity) {
        if (value > max) {
          return min;
        } else if (value < min) {
          return max;
        }
        return value;
      }

      // それ以外は通常のclamp
      return Math.max(min, Math.min(max, value));
    };

    const step = (delta) => {
      const current = parseInt(input.value || "0", 10);
      const newValue = isNaN(current) ? 0 : current + delta;
      input.value = String(processValue(newValue));
    };

    const startHold = (delta) => {
      step(delta);
      holdInterval = setInterval(() => step(delta), 120);
    };

    const endHold = () => {
      if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
      }
    };

    [
      [upButton, +1],
      [downButton, -1],
    ].forEach(([button, delta]) => {
      button.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        try {
          button.setPointerCapture(e.pointerId);
        } catch {}
        startHold(delta);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((event) => {
        button.addEventListener(event, endHold);
      });
    });
  };

  applyButton.addEventListener("click", apply);
  [hoursInput, minutesInput, secondsInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") apply();
    });
  });

  ["ctHours", "ctMinutes", "ctSeconds"].forEach(bindStepper);

  // 外部から利用できるようにbindStepperを公開
  return { apply, bindStepperForElement: bindStepper };
})();

// ===== デザイン設定 =====
const DesignSettings = (() => {
  const fab = document.getElementById("designFab");
  const modal = document.getElementById("designModal");
  const card = modal.querySelector(".design-card");
  const scaleSlider = document.getElementById("dispScale");
  const cancelButton = document.getElementById("designCancel");
  const applyButton = document.getElementById("designApply");
  const paletteList = document.getElementById("paletteList");
  const bgSwitch = document.getElementById("bgSwitch");

  // 音声設定モーダル
  const soundModal = document.getElementById("soundModal");
  const soundCard = soundModal.querySelector(".design-card");
  const soundVolumeSlider = document.getElementById("soundVolumeSlider");
  const soundVolumeDisplay = document.getElementById("soundVolumeDisplay");
  const soundCancelButton = document.getElementById("soundCancel");
  const soundApplyButton = document.getElementById("soundApply");
  const soundModalTypeList = document.getElementById("soundModalTypeList");
  const soundTestButton = document.getElementById("soundModalTest");

  let selectedBg = "dark";
  let selectedKey = "lime";
  let designSnapshot = null;
  let previewTimeout = null;

  // 表示フォーマットを判定する関数
  const getDisplayFormat = () => {
    const display = document.getElementById("display");
    if (!display) return "mm:ss";

    const text = display.textContent || display.innerText;
    // コロンの数を数えてフォーマットを判定
    const colonCount = (text.match(/:/g) || []).length;
    return colonCount >= 2 ? "hh:mm:ss" : "mm:ss";
  };

  // フォーマットに応じたデフォルトスケール値を取得
  const getDefaultScale = () => {
    const format = getDisplayFormat();
    return format === "hh:mm:ss" ? 1.0 : 1.0; // 00:00:00形式も100%、00:00形式も100%
  };

  const snapshotDesign = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const getProperty = (name) =>
      (computedStyle.getPropertyValue(name) || "").trim();
    return {
      bg: getProperty("--bg"),
      panel: getProperty("--panel"),
      fg: getProperty("--fg"),
      fgDim: getProperty("--fg-dim"),
      glow: getProperty("--glow"),
      menuBg: getProperty("--menu-bg"),
      scale: getProperty("--disp-scale"),
      volume: AlarmSound.getVolume(), // 音量設定をスナップショットに追加
      soundType: AlarmSound.getSoundType(), // 音声種類をスナップショットに追加
    };
  };

  const restoreDesign = (snapshot) => {
    if (!snapshot) return;
    const root = document.documentElement.style;
    root.setProperty("--bg", snapshot.bg);
    root.setProperty("--panel", snapshot.panel);
    root.setProperty("--fg", snapshot.fg);
    root.setProperty("--fg-dim", snapshot.fgDim);
    root.setProperty("--glow", snapshot.glow);
    root.setProperty("--menu-bg", snapshot.menuBg);
    root.setProperty("--disp-scale", snapshot.scale);

    const rgb = colorUtils.hexToRgb(snapshot.fg || "#00ff00");
    root.setProperty("--fg-r", rgb.r);
    root.setProperty("--fg-g", rgb.g);
    root.setProperty("--fg-b", rgb.b);

    // 音量設定を復元（SoundSettingsモジュールで管理）
    if (snapshot.volume !== undefined) {
      AlarmSound.setVolume(snapshot.volume);
    }

    // 音声種類を復元
    if (snapshot.soundType !== undefined) {
      AlarmSound.setSoundType(snapshot.soundType);
    }

    document.body.style.background = "var(--bg)";
    updateModalTheme();
  };

  const applyPalette = (palette) => {
    if (!palette) return;
    const root = document.documentElement.style;
    root.setProperty("--bg", palette.bg);
    root.setProperty("--panel", palette.bg);
    root.setProperty("--fg", palette.fg);

    const baseColor = colorUtils.isDarkBackground(palette.bg)
      ? "#000000"
      : COLOR_PRESETS.light.off;
    const { r, g, b } = colorUtils.hexToRgb(baseColor);
    root.setProperty("--fg-dim", `rgba(${r}, ${g}, ${b}, 0)`);

    const fgRgb = colorUtils.hexToRgb(palette.fg);
    root.setProperty("--fg-r", fgRgb.r);
    root.setProperty("--fg-g", fgRgb.g);
    root.setProperty("--fg-b", fgRgb.b);

    const glowValue = colorUtils.isDarkBackground(palette.bg)
      ? `0 0 5px ${palette.fg}`
      : `0 0 3px rgba(${fgRgb.r},${fgRgb.g},${fgRgb.b},.55)`;
    root.setProperty("--glow", glowValue);
    root.setProperty(
      "--menu-bg",
      colorUtils.isDarkBackground(palette.bg) ? "#111" : "#ffffff"
    );

    document.body.style.background = "var(--bg)";
  };

  const updateModalTheme = () => {
    card.classList.toggle("light", selectedBg === "light");

    // 音声設定モーダルとサイドメニューにも適用
    const soundModal = document.querySelector("#soundModal .design-card");
    if (soundModal) {
      soundModal.classList.toggle("light", selectedBg === "light");
    }

    const sideMenu = document.getElementById("sideMenu");
    if (sideMenu) {
      sideMenu.classList.toggle("light", selectedBg === "light");
    }

    // アラートモーダル内のカードにも適用
    const alertCard = document.querySelector("#alertModal .alert-card");
    if (alertCard) {
      alertCard.classList.toggle("light", selectedBg === "light");
    }

    // 現在時刻モーダル内のカードにも適用
    const timeCard = document.querySelector("#timeModal .time-card");
    if (timeCard) {
      timeCard.classList.toggle("light", selectedBg === "light");
    }
  };

  const updateDragHandles = () => {
    // すべてのドラッグハンドルの色を更新
    document.querySelectorAll(".circuit-card, .design-card").forEach((card) => {
      const dragHandle = card.querySelector(
        '[style*="background: linear-gradient"]'
      );
      if (dragHandle) {
        const fgR = getComputedStyle(document.documentElement)
          .getPropertyValue("--fg-r")
          .trim();
        const fgG = getComputedStyle(document.documentElement)
          .getPropertyValue("--fg-g")
          .trim();
        const fgB = getComputedStyle(document.documentElement)
          .getPropertyValue("--fg-b")
          .trim();

        dragHandle.style.background = `linear-gradient(135deg, rgba(${fgR}, ${fgG}, ${fgB}, 0.1), rgba(${fgR}, ${fgG}, ${fgB}, 0.05))`;
        dragHandle.style.borderBottom = `1px solid rgba(${fgR}, ${fgG}, ${fgB}, 0.2)`;
      }
    });
  };

  const updateSevenSegmentGlow = () => {
    // 7セグメントディスプレイの光彩効果を更新
    const displayElement = document.getElementById("display");
    if (displayElement) {
      // 現在の時間を再レンダリングして光彩効果を更新
      const state = TimerState.get();
      const timeString = state.isRunning
        ? Utils.formatTime.mmss(
            state.countdownTime - (Date.now() - state.startTime)
          )
        : Utils.formatTime.mmss(state.countdownTime);

      SevenSegmentDisplay.render(timeString);
    }
  };

  const updateBgUI = () => {
    console.log("updateBgUI called, selectedBg:", selectedBg);
    bgSwitch.querySelectorAll("button").forEach((button) => {
      const isActive = button.dataset.bg === selectedBg;
      console.log("Button:", button.dataset.bg, "isActive:", isActive);
      button.classList.toggle("active", isActive);
    });
  };

  const updatePaletteUI = () => {
    document.querySelectorAll(".palette").forEach((palette) => {
      palette.classList.toggle("active", palette.dataset.key === selectedKey);
    });
  };

  const buildPaletteUI = () => {
    paletteList.innerHTML = "";
    (COLOR_PRESETS[selectedBg].options || []).forEach((option) => {
      const item = document.createElement("div");
      item.className = "palette";
      item.dataset.key = option.key;
      item.innerHTML = `<span class="swatch" style="background:${option.fg}"></span><span class="name">${option.name}</span>`;
      paletteList.appendChild(item);
    });
    updatePaletteUI();
    paletteList.classList.toggle("grid2", selectedBg === "dark");
  };

  const buildSoundTypeUI = () => {
    const designSoundTypeList = document.getElementById("soundTypeList");
    if (!designSoundTypeList) return;

    designSoundTypeList.innerHTML = "";
    const soundTypes = AlarmSound.getSoundTypes();
    const currentSoundType = AlarmSound.getSoundType();

    Object.entries(soundTypes).forEach(([key, soundType]) => {
      const item = document.createElement("div");
      item.className = `sound-type-item ${
        key === currentSoundType ? "active" : ""
      }`;
      item.dataset.soundType = key;

      item.innerHTML = `
        <input type="radio" name="soundType" value="${key}" ${
        key === currentSoundType ? "checked" : ""
      }>
        <span class="sound-name">${soundType.name.replace("音", "")}</span>
      `;

      designSoundTypeList.appendChild(item);
    });
  };

  const updateSoundTypeUI = () => {
    const currentSoundType = AlarmSound.getSoundType();
    document.querySelectorAll(".sound-type-item").forEach((item) => {
      const isActive = item.dataset.soundType === currentSoundType;
      item.classList.toggle("active", isActive);
      const radio = item.querySelector('input[type="radio"]');
      if (radio) radio.checked = isActive;
    });
  };

  const open = () => {
    designSnapshot = snapshotDesign();
    const computedStyle = getComputedStyle(document.documentElement);
    const currentBg = colorUtils.rgbToHex(
      (computedStyle.getPropertyValue("--bg") || "#111").trim()
    );
    const currentFg = colorUtils.rgbToHex(
      (computedStyle.getPropertyValue("--fg") || "#00ff00").trim()
    );

    selectedBg = colorUtils.isDarkBackground(currentBg) ? "dark" : "light";
    const options = COLOR_PRESETS[selectedBg].options || [];
    const found = options.find(
      (opt) => colorUtils.rgbToHex(opt.fg) === currentFg
    );
    selectedKey = found ? found.key : options[0]?.key;

    updateBgUI();
    buildPaletteUI();
    buildSoundTypeUI();

    // 現在のスケール値を取得、設定されていない場合はフォーマットに応じたデフォルト値を使用
    const currentScale = parseFloat(
      computedStyle.getPropertyValue("--disp-scale")
    );
    const defaultScale = getDefaultScale();
    scaleSlider.value = currentScale || defaultScale;

    // スライダーの最大値を調整
    updateSliderMax();

    updateModalTheme();

    // モーダル背景の時間表示を現在のモードに応じて更新
    const state = TimerState.get();
    if (state.isCurrentTimeMode) {
      // 現在時刻モードの場合、現在時刻を表示
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      SevenSegmentDisplay.render(`${hours}:${minutes}`);
    } else if (state.isStopwatch) {
      // ストップウォッチモードの場合、経過時間を表示
      const elapsed = state.isRunning
        ? Date.now() - state.startTime + state.elapsedTime
        : state.elapsedTime;
      SevenSegmentDisplay.render(Utils.formatTime.hms(elapsed));
    } else {
      // タイマーモードの場合、残り時間を表示
      const remaining = state.isRunning
        ? state.countdownTime - (Date.now() - state.startTime)
        : state.countdownTime;
      const format =
        state.totalTime <= Utils.CONSTANTS.HOUR_IN_MS
          ? Utils.formatTime.mmss
          : Utils.formatTime.hms;
      SevenSegmentDisplay.render(format(Math.max(0, remaining)));
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    // モーダルを中央にリセット
    if (card) {
      card.style.transform = "translate(0, 0)";
      card.style.left = "auto";
      card.style.top = "auto";
      card.style.right = "auto";
      card.style.bottom = "auto";
      card.style.position = "static";
    }
  };

  const close = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    // フォーカスをモーダル外に移動してアクセシビリティエラーを防ぐ
    if (document.activeElement && modal.contains(document.activeElement)) {
      fab.focus();
    }
  };

  const cancel = () => {
    // プレビュータイマーをクリア
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }

    restoreDesign(designSnapshot);
    designSnapshot = null;
    close();
  };

  const apply = () => {
    // プレビュータイマーをクリア
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }

    const option =
      (COLOR_PRESETS[selectedBg].options || []).find(
        (opt) => opt.key === selectedKey
      ) || (COLOR_PRESETS[selectedBg].options || [])[0];
    if (option) applyPalette(option);

    // 現在のモードに応じて表示を更新
    const state = TimerState.get();
    if (state.isCurrentTimeMode) {
      // 現在時刻モードの場合、現在時刻を表示
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      SevenSegmentDisplay.render(`${hours}:${minutes}`);
    } else if (state.isStopwatch) {
      // ストップウォッチモードの場合は経過時間を表示
      SevenSegmentDisplay.render(Utils.formatTime.hms(state.elapsedTime));
    } else {
      // タイマーモードの場合は残り時間を表示
      const format =
        state.totalTime <= Utils.CONSTANTS.HOUR_IN_MS
          ? Utils.formatTime.mmss
          : Utils.formatTime.hms;
      SevenSegmentDisplay.render(format(state.countdownTime));
    }

    designSnapshot = null;
    close();
  };

  // クリック判定を改善
  const handleFabClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    open();
  };

  // 複数のイベントタイプに対応
  ["click", "pointerup", "touchend"].forEach((event) => {
    fab.addEventListener(event, handleFabClick, {
      passive: false,
      capture: true,
    });
  });

  // タッチデバイスでの追加対応
  fab.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  cancelButton.addEventListener("click", cancel);
  applyButton.addEventListener("click", apply);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cancel();
  });

  // ESCキーでモーダルを閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      cancel();
    }
  });

  scaleSlider.addEventListener("input", () => {
    const scale = parseFloat(scaleSlider.value);
    document.documentElement.style.setProperty("--disp-scale", scale);
  });

  // 表示フォーマットに応じてスライダーの最大値を調整
  const updateSliderMax = () => {
    const format = getDisplayFormat();
    // 両方の形式で最大値を1.0に設定
    scaleSlider.max = 1.0;
  };

  bgSwitch.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-bg]");
    if (!button) return;
    selectedBg = button.dataset.bg;
    updateBgUI();

    // カラー選択を保持するため、現在のカラーを新しい背景で検索
    const currentFg = getComputedStyle(document.documentElement)
      .getPropertyValue("--fg")
      .trim();
    const options = COLOR_PRESETS[selectedBg].options || [];
    const found = options.find(
      (opt) => colorUtils.rgbToHex(opt.fg) === currentFg
    );
    selectedKey = found ? found.key : options[0]?.key;

    buildPaletteUI();
    updateModalTheme();

    // 光彩効果のCSS変数も更新
    const currentFgValue = getComputedStyle(document.documentElement)
      .getPropertyValue("--fg")
      .trim();
    const root = document.documentElement.style;
    root.setProperty(
      "--glow",
      `0 0 10px ${currentFgValue}, 0 0 20px ${currentFgValue}, 0 0 30px ${currentFgValue}`
    );

    // ドラッグハンドルの色も更新
    updateDragHandles();

    // 7セグメントディスプレイの光彩効果も更新
    updateSevenSegmentGlow();
  });

  paletteList.addEventListener("click", (e) => {
    const element = e.target.closest(".palette");
    if (!element) return;
    selectedKey = element.dataset.key;
    updatePaletteUI();

    // 既存のプレビュータイマーをクリア
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }

    // リアルタイムプレビュー: 選択したカラーを即座に適用
    const colorOption = COLOR_PRESETS[selectedBg].options.find(
      (option) => option.key === selectedKey
    );
    if (colorOption) {
      // 完全なカラープレビューを適用
      const root = document.documentElement.style;
      root.setProperty("--fg", colorOption.fg);
      root.setProperty("--bg", colorOption.bg);
      root.setProperty("--panel", colorOption.bg);

      // 背景色も更新
      document.body.style.background = colorOption.bg;

      // 光彩外側（シャドウ）部分の色も更新
      const { r, g, b } = colorUtils.hexToRgb(colorOption.fg);
      root.setProperty("--fg-r", r);
      root.setProperty("--fg-g", g);
      root.setProperty("--fg-b", b);

      // 光彩効果のCSS変数も更新
      root.setProperty(
        "--glow",
        `0 0 10px ${colorOption.fg}, 0 0 20px ${colorOption.fg}, 0 0 30px ${colorOption.fg}`
      );

      // ドラッグハンドルの色も更新
      updateDragHandles();

      // 7セグメントディスプレイの光彩効果も更新
      updateSevenSegmentGlow();

      // カラー選択時に現在のモードに応じて時間表示を更新
      const state = TimerState.get();
      if (state.isCurrentTimeMode) {
        // 現在時刻モードの場合、現在時刻を表示
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        SevenSegmentDisplay.render(`${hours}:${minutes}`);
      } else if (state.isStopwatch) {
        // ストップウォッチモードの場合、経過時間を表示
        const elapsed = state.isRunning
          ? Date.now() - state.startTime + state.elapsedTime
          : state.elapsedTime;
        SevenSegmentDisplay.render(Utils.formatTime.hms(elapsed));
      } else {
        // タイマーモードの場合、残り時間を表示
        const remaining = state.isRunning
          ? state.countdownTime - (Date.now() - state.startTime)
          : state.countdownTime;
        const format =
          state.totalTime <= Utils.CONSTANTS.HOUR_IN_MS
            ? Utils.formatTime.mmss
            : Utils.formatTime.hms;
        SevenSegmentDisplay.render(format(Math.max(0, remaining)));
      }
    }
  });

  // 音声種類選択のイベントリスナー
  const designSoundTypeList = document.getElementById("soundTypeList");
  if (designSoundTypeList) {
    designSoundTypeList.addEventListener("click", (e) => {
      const soundTypeItem = e.target.closest(".sound-type-item");
      if (!soundTypeItem) return;

      const soundType = soundTypeItem.dataset.soundType;
      AlarmSound.setSoundType(soundType);
      updateSoundTypeUI();
    });
  }

  return { open, close };
})();

// ===== サーキットメモ表示用のヘルパー関数 =====
const displayCircuitNote = (note) => {
  const noteDisplayEl = document.getElementById("circuitNoteDisplay");
  const noteTextEl = document.getElementById("circuitNoteText");

  if (noteDisplayEl && noteTextEl) {
    if (note && note.trim()) {
      noteTextEl.textContent = note;
      noteDisplayEl.style.display = "block";
    } else {
      noteDisplayEl.style.display = "none";
    }
  }
};

const hideCircuitNote = () => {
  const noteDisplayEl = document.getElementById("circuitNoteDisplay");
  if (noteDisplayEl) {
    noteDisplayEl.style.display = "none";
  }
};

// ===== サーキット機能 =====
const CircuitFeature = (() => {
  const modal = document.getElementById("circuitModal");
  const canvas = document.getElementById("circuitCanvas");
  const presetList = document.getElementById("circuitPresetList");

  console.log("Canvas element:", canvas);
  console.log("Preset list element:", presetList);
  const openButton = document.getElementById("openCircuit");
  const clearButton = document.getElementById("circuitClear");
  const createButton = document.getElementById("circuitCreate");
  const nameModal = document.getElementById("circuitNameModal");
  const nameInput = document.getElementById("circuitNameInput");
  const nameOkButton = document.getElementById("circuitNameOk");
  const nameBackButton = document.getElementById("circuitNameBack");
  const savedCircuitsEl = document.getElementById("savedCircuits");

  // ステップメモ関連要素
  const stepNoteModal = document.getElementById("stepNoteModal");
  const stepNoteInput = document.getElementById("stepNoteInput");
  const stepNoteOkButton = document.getElementById("stepNoteOk");
  const stepNoteCancelButton = document.getElementById("stepNoteCancel");

  // ループ設定要素
  const loopNoneRadio = document.getElementById("loopNone");
  const loopInfiniteRadio = document.getElementById("loopInfinite");
  const loopCountRadio = document.getElementById("loopCount");
  const loopCountInput = document.getElementById("loopCountInput");
  const loopCountValue = document.getElementById("loopCountValue");

  let pendingSteps = null;
  let pendingLoop = null;
  let pendingStepNote = ""; // ステップメモの一時保存
  let currentStepChip = null; // 現在編集中のステップチップ
  let dragSource = null;
  let customTimeDropped = false;

  const makeChip = (label, ms, note = "") => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.draggable = true;
    chip.dataset.ms = ms;
    chip.dataset.note = note || "";
    chip.innerHTML = `
      <span class="label">${label}</span>
      <span class="hint">(${Utils.formatTime.mmss(ms)})</span>
      <div class="chip-actions">
        <button class="chip-note-btn" data-note aria-label="メモを編集">
          <i class="fas fa-pen"></i>
        </button>
        <span class="x" data-x>&times;</span>
      </div>
    `;
    return chip;
  };

  const renderPresetChips = () => {
    presetList.innerHTML = "";
    console.log("Rendering preset chips, count:", TIMER_DURATIONS.length);
    TIMER_DURATIONS.forEach((duration) => {
      // プリセットチップはメモボタンなしで作成
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.draggable = true;
      chip.dataset.ms = duration.ms;
      chip.dataset.note = "";
      chip.innerHTML = `
        <span class="label">${duration.label}</span>
        <span class="hint">(${Utils.formatTime.mmss(duration.ms)})</span>
        <span class="x" data-x style="display: none;">&times;</span>
      `;
      console.log(
        "Created chip:",
        duration.label,
        "ms:",
        duration.ms,
        "draggable:",
        chip.draggable
      );
      // イベント委譲を使用するため、個別のイベントリスナーは設定しない
      presetList.appendChild(chip);
    });
    console.log(
      "Preset chips rendered, total children:",
      presetList.children.length
    );
  };

  const buildDefaultName = (steps, loopSettings = null) => {
    const timeString = steps
      .map((s) => s.label || Utils.formatTime.mmss(s.ms))
      .join("-");

    if (!loopSettings) return timeString;

    let loopString = "";
    if (loopSettings.mode === "infinite") {
      loopString = " (∞ループ)";
    } else if (loopSettings.mode === "count" && loopSettings.count > 1) {
      loopString = ` (${loopSettings.count}回ループ)`;
    }

    return timeString + loopString;
  };

  const renderSavedCircuits = () => {
    savedCircuitsEl.innerHTML = "";
    const circuits = TimerState.getSavedCircuits();
    if (!circuits.length) return;

    circuits.forEach((circuit) => {
      const button = document.createElement("button");
      button.className = "btn";
      button.textContent = circuit.name;
      button.addEventListener("click", () => {
        TimerState.set({ isStopwatch: false });
        TimerControl.stop();
        document.querySelectorAll("#timerOptions button").forEach((btn) => {
          btn.classList.remove("active");
        });
        document.getElementById("ctApply").classList.add("active");

        TimerState.startCircuit(circuit);
        const state = TimerState.get();
        SevenSegmentDisplay.render(Utils.formatTime.mmss(state.totalTime));

        // サーキット進行状況を表示
        TimerControl.updateCircuitProgressDisplay();

        SideMenu.close();
      });
      savedCircuitsEl.appendChild(button);
    });
  };

  const updateCircuitModalTheme = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const currentBg = colorUtils.rgbToHex(
      (computedStyle.getPropertyValue("--bg") || "#111").trim()
    );
    const isLight = !colorUtils.isDarkBackground(currentBg);

    const circuitCard = modal.querySelector(".circuit-card");
    const nameCard = nameModal.querySelector(".design-card");
    if (circuitCard) circuitCard.classList.toggle("light", isLight);
    if (nameCard) nameCard.classList.toggle("light", isLight);
  };

  const openCircuitModal = () => {
    updateCircuitModalTheme();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    // モーダルを中央にリセット
    const card = modal.querySelector(".circuit-card");
    if (card) {
      card.style.transform = "translate(0, 0)";
      card.style.left = "auto";
      card.style.top = "auto";
      card.style.right = "auto";
      card.style.bottom = "auto";
      card.style.position = "static";
    }
  };
  const closeCircuitModal = () => {
    // フォーカスをモーダル外に移動
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };
  const openNameModal = () => {
    updateCircuitModalTheme();
    nameModal.classList.add("open");
    nameModal.setAttribute("aria-hidden", "false");

    // モーダルを中央にリセット
    const nameCard = nameModal.querySelector(".design-card");
    if (nameCard) {
      nameCard.style.transform = "translate(0, 0)";
      nameCard.style.left = "auto";
      nameCard.style.top = "auto";
      nameCard.style.right = "auto";
      nameCard.style.bottom = "auto";
      nameCard.style.position = "static";
    }
  };
  const closeNameModal = () => {
    // フォーカスをモーダル外に移動
    if (document.activeElement && nameModal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    nameModal.classList.remove("open");
    nameModal.setAttribute("aria-hidden", "true");
  };

  const openStepNoteModal = (chip) => {
    updateCircuitModalTheme();
    stepNoteModal.classList.add("open");
    stepNoteModal.setAttribute("aria-hidden", "false");
    currentStepChip = chip;
    stepNoteInput.value = chip.dataset.note || "";

    // モーダルを中央にリセット
    const stepNoteCard = stepNoteModal.querySelector(".design-card");
    if (stepNoteCard) {
      stepNoteCard.style.transform = "translate(0, 0)";
      stepNoteCard.style.left = "auto";
      stepNoteCard.style.top = "auto";
      stepNoteCard.style.right = "auto";
      stepNoteCard.style.bottom = "auto";
      stepNoteCard.style.position = "static";
    }
  };

  const closeStepNoteModal = () => {
    // フォーカスをモーダル外に移動
    if (
      document.activeElement &&
      stepNoteModal.contains(document.activeElement)
    ) {
      document.activeElement.blur();
    }
    stepNoteModal.classList.remove("open");
    stepNoteModal.setAttribute("aria-hidden", "true");
    currentStepChip = null;
  };

  const getDragAfterElement = (container, y) => {
    const elements = [...container.querySelectorAll(".chip:not(.dragging)")];
    return elements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: -Infinity, element: null }
    ).element;
  };

  // ドラッグ＆ドロップイベント
  const onDragStart = (e) => {
    const target = e.target.closest(".chip");
    if (!target) {
      console.log("Drag start - no chip target found");
      return;
    }

    console.log("Drag start - target:", target);
    console.log("Drag start - target classList:", target.classList.toString());
    console.log("Drag start - target draggable:", target.draggable);
    console.log("Drag start - dataset.ms:", target.dataset.ms);
    console.log(
      "Drag start - label:",
      target.querySelector(".label")?.textContent
    );
    console.log("Drag start - parent:", target.parentElement);

    dragSource = target;
    target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "copyMove"; // copyとmoveの両方を許可
    e.dataTransfer.setData("text/plain", target.dataset.ms);

    // プリセット時間のチップでもラベルデータを設定
    const label =
      target.querySelector(".label")?.textContent ||
      Utils.formatTime.mmss(parseInt(target.dataset.ms, 10));
    e.dataTransfer.setData("text/label", label);

    console.log("Drag data set - ms:", target.dataset.ms);
    console.log("Drag data set - label:", label);
    console.log("Drag data set - effectAllowed:", e.dataTransfer.effectAllowed);
  };

  const onDragEnd = (e) => {
    const target = e.target.closest(".chip");
    if (target) target.classList.remove("dragging");
    dragSource = null;
  };

  const onCanvasDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy"; // カスタム時間の場合はcopyに変更
    console.log("Canvas drag over - dropEffect set to copy");
    console.log("Canvas drag over - target:", e.target);
    console.log("Canvas drag over - currentTarget:", e.currentTarget);

    const afterElement = getDragAfterElement(canvas, e.clientY);
    if (dragSource && dragSource.parentElement === canvas) {
      if (afterElement == null) {
        canvas.appendChild(dragSource);
      } else if (afterElement !== dragSource) {
        canvas.insertBefore(dragSource, afterElement);
      }
    }
  };

  const onCanvasDrop = (e) => {
    e.preventDefault();

    console.log("Canvas drop event triggered");
    console.log("DataTransfer types:", e.dataTransfer.types);
    console.log("DataTransfer items:", e.dataTransfer.items.length);
    console.log("dragSource:", dragSource);
    console.log("dragSource parent:", dragSource?.parentElement);

    // 既存のチップの移動の場合は処理しない
    if (dragSource && dragSource.parentElement === canvas) {
      console.log("Skipping - existing chip move");
      return;
    }

    // データ転送から情報を取得
    const msText = e.dataTransfer.getData("text/plain");
    const labelText = e.dataTransfer.getData("text/label");

    console.log("Raw data - ms:", msText, "label:", labelText);

    const ms = parseInt(msText || dragSource?.dataset.ms || "0", 10);

    console.log("Parsed ms:", ms);

    // 0ミリ秒の場合は処理しない
    if (ms <= 0) {
      console.log("Skipping - invalid ms:", ms);
      return;
    }

    const label =
      labelText ||
      dragSource?.querySelector(".label")?.textContent ||
      Utils.formatTime.mmss(ms);

    console.log("Final label:", label, "ms:", ms);

    const note = dragSource?.dataset.note || "";
    const chip = makeChip(label, ms, note);
    const afterElement = getDragAfterElement(canvas, e.clientY);

    if (afterElement == null) {
      canvas.appendChild(chip);
      console.log("Chip appended to canvas");
    } else {
      canvas.insertBefore(chip, afterElement);
      console.log("Chip inserted before element");
    }

    // カスタム時間のドロップ成功を記録
    customTimeDropped = true;
    console.log("Custom time drop successful, flag set to true");
  };

  // クリックでチップを追加する処理
  const onChipClick = (e) => {
    const target = e.target.closest(".chip");
    if (!target) return;

    // 既存のチップの移動の場合は処理しない
    if (target.parentElement === canvas) {
      console.log("Skipping - existing chip click");
      return;
    }

    console.log("Chip clicked:", target);

    // プリセット時間の場合
    const ms = parseInt(target.dataset.ms || "0", 10);
    if (ms <= 0) {
      console.log("Skipping - invalid ms:", ms);
      return;
    }

    const label =
      target.querySelector(".label")?.textContent || Utils.formatTime.mmss(ms);
    const note = target.dataset.note || "";
    const chip = makeChip(label, ms, note);

    // キャンバスに追加
    canvas.appendChild(chip);
    console.log("Preset chip added to canvas");
  };

  const onListClick = (e) => {
    const deleteButton = e.target.closest("[data-x]");
    if (deleteButton) {
      const chip = deleteButton.closest(".chip");
      if (chip && chip.parentElement === canvas) {
        chip.remove();
        updateReorderButtons();
      }
    }
  };

  // 上下移動機能
  const moveChipUp = () => {
    const selectedChip = canvas.querySelector(".chip.selected");
    if (!selectedChip) return;

    const prevChip = selectedChip.previousElementSibling;
    if (prevChip) {
      canvas.insertBefore(selectedChip, prevChip);
      updateReorderButtons();
    }
  };

  const moveChipDown = () => {
    const selectedChip = canvas.querySelector(".chip.selected");
    if (!selectedChip) return;

    const nextChip = selectedChip.nextElementSibling;
    if (nextChip) {
      canvas.insertBefore(nextChip, selectedChip);
      updateReorderButtons();
    }
  };

  // チップ選択機能
  const selectChip = (chip) => {
    // 既存の選択を解除
    canvas
      .querySelectorAll(".chip.selected")
      .forEach((c) => c.classList.remove("selected"));

    // 新しいチップを選択
    chip.classList.add("selected");
    updateReorderButtons();
  };

  // リオーダーボタンの状態更新
  const updateReorderButtons = () => {
    const selectedChip = canvas.querySelector(".chip.selected");
    const moveUpBtn = document.getElementById("circuitMoveUp");
    const moveDownBtn = document.getElementById("circuitMoveDown");

    if (!selectedChip || !moveUpBtn || !moveDownBtn) {
      if (moveUpBtn) moveUpBtn.disabled = true;
      if (moveDownBtn) moveDownBtn.disabled = true;
      return;
    }

    // 上ボタン：最初の要素でない場合は有効
    moveUpBtn.disabled = !selectedChip.previousElementSibling;

    // 下ボタン：最後の要素でない場合は有効
    moveDownBtn.disabled = !selectedChip.nextElementSibling;
  };

  // チップクリック時の選択処理
  const onCanvasClick = (e) => {
    const chip = e.target.closest(".chip");
    if (chip && chip.parentElement === canvas) {
      selectChip(chip);
    }

    // ステップメモボタンのクリック処理
    const noteBtn = e.target.closest(".chip-note-btn");
    if (noteBtn) {
      e.stopPropagation();
      const chip = noteBtn.closest(".chip");
      if (chip) {
        openStepNoteModal(chip);
      }
    }
  };

  // ループ設定を取得する関数
  const getLoopSettings = () => {
    if (loopInfiniteRadio.checked) {
      return { mode: "infinite", count: -1 };
    } else if (loopCountRadio.checked) {
      const count = parseInt(loopCountValue.value || "2", 10);
      return { mode: "count", count: Math.max(2, Math.min(99, count)) };
    } else {
      return { mode: "none", count: 1 };
    }
  };

  // ループ設定をリセットする関数
  const resetLoopSettings = () => {
    loopNoneRadio.checked = true;
    loopCountInput.style.display = "none";
    loopCountValue.value = "2";
  };

  // イベントリスナー設定
  if (openButton) openButton.addEventListener("click", openCircuitModal);

  // ループ設定のラジオボタンイベント
  if (loopNoneRadio) {
    loopNoneRadio.addEventListener("change", () => {
      if (loopNoneRadio.checked) {
        loopCountInput.style.display = "none";
      }
    });
  }
  if (loopInfiniteRadio) {
    loopInfiniteRadio.addEventListener("change", () => {
      if (loopInfiniteRadio.checked) {
        loopCountInput.style.display = "none";
      }
    });
  }
  if (loopCountRadio) {
    loopCountRadio.addEventListener("change", () => {
      if (loopCountRadio.checked) {
        loopCountInput.style.display = "flex";
        loopCountValue.focus();
      }
    });
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeCircuitModal();
    });
  }
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      canvas.innerHTML = "";
      resetLoopSettings();
    });
  }
  // カスタム時間入力の機能
  const circuitMinutesInput = document.getElementById("circuitMinutes");
  const circuitSecondsInput = document.getElementById("circuitSeconds");
  const customTimeContainer = document.querySelector(".circuit-custom-time");

  // カスタム時間のドラッグ&ドロップ機能
  if (customTimeContainer) {
    customTimeContainer.draggable = true;
    customTimeContainer.addEventListener("dragstart", (e) => {
      const minutes = parseInt(circuitMinutesInput.value || "0", 10);
      const seconds = parseInt(circuitSecondsInput.value || "0", 10);
      const totalMs = (minutes * 60 + seconds) * 1000;

      console.log(
        "Custom time drag start:",
        minutes,
        "min",
        seconds,
        "sec",
        "=",
        totalMs,
        "ms"
      );

      if (totalMs <= 0) {
        console.log("Preventing drag - invalid time");
        e.preventDefault();
        return;
      }

      if (totalMs > 60 * 60 * 1000) {
        console.log("Preventing drag - time too long");
        e.preventDefault();
        return;
      }

      const label = Utils.formatTime.mmss(totalMs);
      e.dataTransfer.setData("text/plain", totalMs.toString());
      e.dataTransfer.setData("text/label", label);
      e.dataTransfer.effectAllowed = "copy";

      console.log("Drag data set - ms:", totalMs.toString(), "label:", label);
      console.log("DataTransfer effectAllowed:", e.dataTransfer.effectAllowed);

      // ドラッグ中の視覚的フィードバック
      customTimeContainer.style.opacity = "0.5";

      // ドラッグ中は入力値を保持（リセットしない）
    });

    customTimeContainer.addEventListener("dragend", (e) => {
      customTimeContainer.style.opacity = "1";

      // カスタム時間のドロップが成功した場合のみリセット
      if (customTimeDropped) {
        console.log("Custom time dropped successfully, resetting inputs");
        circuitMinutesInput.value = "0";
        circuitSecondsInput.value = "0";
        customTimeDropped = false; // フラグをリセット
      } else {
        console.log("Drag cancelled or failed, keeping inputs");
      }
    });

    // カスタム時間のクリックイベント追加（画面幅が狭い時用）
    customTimeContainer.addEventListener("click", (e) => {
      // ステップボタンや入力フィールドのクリックは除外
      if (e.target.closest(".step") || e.target.closest("input")) {
        return;
      }

      const minutes = parseInt(circuitMinutesInput.value || "0", 10);
      const seconds = parseInt(circuitSecondsInput.value || "0", 10);
      const totalMs = (minutes * 60 + seconds) * 1000;

      if (totalMs <= 0) {
        console.log("Skipping - invalid custom time:", totalMs);
        return;
      }

      const label = Utils.formatTime.mmss(totalMs);
      const chip = makeChip(label, totalMs, "");

      // キャンバスに追加
      canvas.appendChild(chip);
      console.log("Custom time chip added to canvas via click");

      // カスタム時間をリセット
      circuitMinutesInput.value = "0";
      circuitSecondsInput.value = "0";
    });
  }

  // ステップボタンの機能
  const setupStepButtons = () => {
    const stepButtons = document.querySelectorAll(".circuit-ct-field .step");
    stepButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = button.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (!input) return;

        const isUp = button.classList.contains("up");
        const currentValue = parseInt(input.value || "0", 10);
        const min = parseInt(input.getAttribute("min") || "0", 10);
        const max = parseInt(input.getAttribute("max") || "59", 10);

        let newValue = isUp ? currentValue + 1 : currentValue - 1;
        newValue = Math.max(min, Math.min(max, newValue));

        input.value = newValue;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
  };

  setupStepButtons();

  if (createButton) {
    createButton.addEventListener("click", () => {
      const steps = [];
      canvas.querySelectorAll(".chip").forEach((chip) => {
        const ms = parseInt(chip.dataset.ms || "0", 10);
        const label = (chip.querySelector(".label")?.textContent || "").trim();
        const note = chip.dataset.note || "";
        if (ms > 0) steps.push({ ms, label, note });
      });

      if (!steps.length) {
        alert("サーキットに時間がありません。右の一覧から追加してください。");
        return;
      }

      pendingSteps = steps;
      pendingLoop = getLoopSettings();
      nameInput.value = buildDefaultName(steps, pendingLoop);
      closeCircuitModal();
      openNameModal();
    });
  }
  if (nameOkButton) {
    nameOkButton.addEventListener("click", () => {
      const name = (nameInput.value || "").trim();
      const steps = pendingSteps || [];

      if (!steps.length) {
        closeNameModal();
        return;
      }

      let finalName = name || buildDefaultName(steps);
      let counter = 2;
      const circuits = TimerState.getSavedCircuits();
      while (circuits.some((c) => c.name === finalName)) {
        finalName = `${name || buildDefaultName(steps)} (${counter++})`;
      }

      const loopSettings = pendingLoop || { mode: "none", count: 1 };
      const circuit = {
        name: finalName,
        steps: steps.map((s) => ({ ms: s.ms, note: s.note || "" })),
        loop: loopSettings,
      };

      TimerState.startCircuit(circuit);
      TimerState.set({ isStopwatch: false });
      TimerControl.stop();

      document.querySelectorAll("#timerOptions button").forEach((btn) => {
        btn.classList.remove("active");
      });
      document.getElementById("ctApply").classList.add("active");

      const state = TimerState.get();
      SevenSegmentDisplay.render(Utils.formatTime.mmss(state.totalTime));

      // サーキット進行状況を表示
      TimerControl.updateCircuitProgressDisplay();

      renderSavedCircuits();
      canvas.innerHTML = "";
      resetLoopSettings();
      SideMenu.close();
      closeNameModal();
    });
  }
  if (nameBackButton) {
    nameBackButton.addEventListener("click", () => {
      closeNameModal();
      openCircuitModal();
    });
  }

  // ステップメモモーダルのイベントリスナー
  if (stepNoteOkButton) {
    stepNoteOkButton.addEventListener("click", () => {
      if (currentStepChip) {
        const note = (stepNoteInput.value || "").trim();
        currentStepChip.dataset.note = note;
        closeStepNoteModal();
      }
    });
  }

  if (stepNoteCancelButton) {
    stepNoteCancelButton.addEventListener("click", () => {
      closeStepNoteModal();
    });
  }

  // ドラッグ＆ドロップ設定
  if (presetList) {
    presetList.addEventListener("dragstart", onDragStart);
    presetList.addEventListener("dragend", onDragEnd);
    // クリックイベント追加
    presetList.addEventListener("click", onChipClick);
    console.log("Preset list event listeners added");
  }
  if (canvas) {
    canvas.addEventListener("dragstart", onDragStart);
    canvas.addEventListener("dragend", onDragEnd);
    canvas.addEventListener("dragover", onCanvasDragOver);
    canvas.addEventListener("drop", onCanvasDrop);
    canvas.addEventListener("click", onListClick);
    canvas.addEventListener("click", onCanvasClick);
    console.log("Canvas event listeners added:", canvas);
    console.log("Canvas drop event listener added:", canvas.addEventListener);
  }
  // カスタム時間のクリックイベントは既に上で設定済み

  // 上下移動ボタンのイベントリスナー
  const moveUpBtn = document.getElementById("circuitMoveUp");
  const moveDownBtn = document.getElementById("circuitMoveDown");

  if (moveUpBtn) {
    moveUpBtn.addEventListener("click", moveChipUp);
    console.log("Move up button event listener added");
  }

  if (moveDownBtn) {
    moveDownBtn.addEventListener("click", moveChipDown);
    console.log("Move down button event listener added");
  }

  renderPresetChips();
  renderSavedCircuits();

  // ヒント文言はCSSで自動的に切り替わるため、JavaScriptでの更新は不要
  const updateHintText = () => {
    // CSSで自動的に切り替わるため、何もしない
    console.log("Hint text is controlled by CSS media queries");
  };

  // 初期化時にヒント文言を設定
  updateHintText();

  // 画面サイズ変更時にヒント文言を更新
  window.addEventListener("resize", updateHintText);

  // ループ回数入力の上下ボタンをバインド
  const bindLoopStepper = (inputId) => {
    const upButton = document.querySelector(
      `.step.up[data-target="${inputId}"]`
    );
    const downButton = document.querySelector(
      `.step.down[data-target="${inputId}"]`
    );
    const input = document.getElementById(inputId);

    if (!upButton || !downButton || !input) return;

    let holdInterval = null;

    const clamp = (value) => {
      const min = input.min === "" ? -Infinity : parseInt(input.min, 10);
      const max = input.max === "" ? Infinity : parseInt(input.max, 10);
      return Math.max(min, Math.min(max, value));
    };

    const step = (delta) => {
      const current = parseInt(input.value || "0", 10);
      input.value = String(clamp((isNaN(current) ? 0 : current) + delta));
    };

    const startHold = (delta) => {
      step(delta);
      holdInterval = setInterval(() => step(delta), 120);
    };

    const endHold = () => {
      if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
      }
    };

    [
      [upButton, +1],
      [downButton, -1],
    ].forEach(([button, delta]) => {
      button.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        try {
          button.setPointerCapture(e.pointerId);
        } catch {}
        startHold(delta);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((event) => {
        button.addEventListener(event, endHold);
      });
    });
  };

  // ループ回数入力にステッパーを適用
  bindLoopStepper("loopCountValue");

  // サーキットカスタム時間入力に循環ステッパーを適用
  if (typeof CustomTime !== "undefined" && CustomTime.bindStepperForElement) {
    CustomTime.bindStepperForElement("circuitMinutes");
    CustomTime.bindStepperForElement("circuitSeconds");
  }

  return { renderSavedCircuits };
})();

// ===== モーダルドラッグ機能 =====
const ModalDrag = (() => {
  const makeDraggable = (modalId, cardSelector) => {
    const modal = document.getElementById(modalId);
    const card = modal?.querySelector(cardSelector);

    if (!modal || !card) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const startDrag = (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = card.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;

      card.style.position = "fixed";
      card.style.left = initialX + "px";
      card.style.top = initialY + "px";
      card.style.margin = "0";
      card.style.transform = "none";

      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", stopDrag);
      e.preventDefault();
    };

    const drag = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newX = initialX + deltaX;
      const newY = initialY + deltaY;

      // 画面外にも移動可能（確認しやすくするため）
      card.style.left = newX + "px";
      card.style.top = newY + "px";
    };

    const stopDrag = () => {
      isDragging = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDrag);
    };

    // ドラッグハンドルを追加
    const dragHandle = document.createElement("div");
    dragHandle.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40px;
      cursor: move;
      z-index: 10;
      background: linear-gradient(135deg, rgba(var(--fg-r), var(--fg-g), var(--fg-b), 0.1), rgba(var(--fg-r), var(--fg-g), var(--fg-b), 0.05));
      border-bottom: 1px solid rgba(var(--fg-r), var(--fg-g), var(--fg-b), 0.2);
    `;
    card.style.position = "relative";
    card.appendChild(dragHandle);

    dragHandle.addEventListener("mousedown", startDrag);
  };

  const init = () => {
    // 各モーダルにドラッグ機能を追加
    makeDraggable("circuitModal", ".circuit-card");
    makeDraggable("circuitNameModal", ".design-card");
    makeDraggable("stepNoteModal", ".design-card");
    makeDraggable("designModal", ".design-card");
  };

  return { init };
})();

// ===== アラートモーダル =====
const AlertModal = (() => {
  const modal = document.getElementById("alertModal");
  const titleElement = modal.querySelector(".alert-title");
  const messageElement = document.getElementById("alertMessage");
  const closeButton = document.getElementById("alertClose");

  const show = (title, message) => {
    titleElement.textContent = title;
    messageElement.textContent = message;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  const hide = () => {
    // フォーカスを外してからモーダルを閉じる
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    // アラーム音を停止
    AlarmSound.stopAlarm();
  };

  // イベントリスナー
  closeButton.addEventListener("click", hide);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hide();
  });

  // ESCキーで閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      hide();
    }
  });

  return { show, hide };
})();

// グローバル関数として公開
const showAlert = (title, message) => {
  AlertModal.show(title, message);
};

// ===== アラーム機能 =====
const AlarmManager = (() => {
  let alarms = []; // 設定済みアラームのリスト
  let checkInterval = null;

  const alarmListEl = document.getElementById("alarmList");
  const alarmSetBtn = document.getElementById("alarmSet");
  const alarmHoursInput = document.getElementById("alarmHours");
  const alarmMinutesInput = document.getElementById("alarmMinutes");
  const alarmOnceRadio = document.getElementById("alarmOnce");
  const alarmDailyRadio = document.getElementById("alarmDaily");

  // アラームを追加
  const addAlarm = (hours, minutes, repeat = "daily") => {
    const timeStr = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    // 既に同じ時刻のアラームがあるかチェック
    if (alarms.some((a) => a.time === timeStr && a.repeat === repeat)) {
      alert("同じ時刻・同じ繰り返し設定のアラームが既に設定されています");
      return;
    }

    alarms.push({
      time: timeStr,
      hours: hours,
      minutes: minutes,
      repeat: repeat, // "once" or "daily"
      enabled: true,
      triggered: false, // 1回限りアラームが発動済みかどうか
    });

    // アラームを時刻順にソート
    alarms.sort((a, b) => {
      if (a.hours !== b.hours) return a.hours - b.hours;
      return a.minutes - b.minutes;
    });

    renderAlarmList();
    startChecking();
    console.log(
      "🔔 アラーム追加:",
      timeStr,
      repeat === "daily" ? "(毎日)" : "(1回限り)"
    );
  };

  // アラームを削除
  const removeAlarm = (index) => {
    const removedAlarm = alarms[index];
    alarms.splice(index, 1);
    renderAlarmList();

    if (alarms.length === 0) {
      stopChecking();
    }
    console.log("🔔 アラーム削除:", removedAlarm?.time);
  };

  // アラームリストを表示
  const renderAlarmList = () => {
    if (!alarmListEl) return;

    alarmListEl.innerHTML = "";

    if (alarms.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.className = "alarm-empty";
      emptyMsg.textContent = "アラームが設定されていません";
      alarmListEl.appendChild(emptyMsg);
      return;
    }

    alarms.forEach((alarm, index) => {
      const item = document.createElement("div");
      item.className = "alarm-item";
      const repeatIcon =
        alarm.repeat === "daily"
          ? '<i class="fas fa-redo-alt" title="毎日"></i>'
          : '<i class="fas fa-bell" title="1回限り"></i>';
      const repeatText = alarm.repeat === "daily" ? "毎日" : "1回";

      item.innerHTML = `
        <div class="alarm-info">
          <div class="alarm-time">${alarm.time}</div>
          <div class="alarm-repeat-badge">${repeatIcon} ${repeatText}</div>
        </div>
        <button class="alarm-delete" data-index="${index}" aria-label="削除">
          <i class="fas fa-trash"></i>
        </button>
      `;
      alarmListEl.appendChild(item);
    });
  };

  // アラームチェックを開始
  const startChecking = () => {
    if (checkInterval) return;

    checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();

      // 秒が0の時のみチェック（1分に1回）
      if (currentSeconds === 0) {
        alarms.forEach((alarm, index) => {
          if (
            alarm.enabled &&
            alarm.hours === currentHours &&
            alarm.minutes === currentMinutes
          ) {
            // 1回限りアラームで既に発動済みの場合はスキップ
            if (alarm.repeat === "once" && alarm.triggered) {
              return;
            }

            triggerAlarm(alarm, index);
          }
        });
      }
    }, 1000);
  };

  // アラームチェックを停止
  const stopChecking = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };

  // アラームを鳴らす
  const triggerAlarm = (alarm, index) => {
    const repeatText = alarm.repeat === "daily" ? "(毎日)" : "(1回限り)";
    console.log("🔔 アラーム発動:", alarm.time, repeatText);
    AlarmSound.playAlarm();
    showAlert("アラーム", `設定時刻: ${alarm.time} ${repeatText}`);

    // 1回限りアラームの場合、発動済みフラグを立てて無効化
    if (alarm.repeat === "once") {
      alarm.triggered = true;
      alarm.enabled = false;
      console.log("🔔 1回限りアラームを無効化:", alarm.time);

      // 次の日の0時にリセットするタイマーを設定
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      );
      const timeUntilMidnight = tomorrow - now;

      setTimeout(() => {
        // 発動済みの1回限りアラームを削除
        alarms = alarms.filter((a) => !(a.repeat === "once" && a.triggered));
        renderAlarmList();
        if (alarms.length === 0) {
          stopChecking();
        }
      }, timeUntilMidnight);
    }
  };

  // イベントリスナー
  if (alarmSetBtn) {
    alarmSetBtn.addEventListener("click", () => {
      const hours = parseInt(alarmHoursInput.value || "0", 10);
      const minutes = parseInt(alarmMinutesInput.value || "0", 10);
      const repeat = alarmDailyRadio?.checked ? "daily" : "once";
      addAlarm(hours, minutes, repeat);
      SideMenu.close();
    });
  }

  if (alarmListEl) {
    alarmListEl.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".alarm-delete");
      if (deleteBtn) {
        const index = parseInt(deleteBtn.dataset.index, 10);
        removeAlarm(index);
      }
    });
  }

  // ステッパーボタンの設定（CustomTimeモジュールのbindStepperを使用）
  ["alarmHours", "alarmMinutes"].forEach((id) => {
    if (typeof CustomTime !== "undefined" && CustomTime.bindStepperForElement) {
      CustomTime.bindStepperForElement(id);
    }
  });

  // 初期化
  renderAlarmList();

  return { addAlarm, removeAlarm, getAlarms: () => alarms };
})();

// ===== 初期化 =====
(() => {
  // RGB値の初期設定
  const computedStyle = getComputedStyle(document.documentElement);
  const currentFg = computedStyle.getPropertyValue("--fg").trim() || "#00ff00";
  const { r, g, b } = colorUtils.hexToRgb(currentFg);
  const root = document.documentElement.style;
  root.setProperty("--fg-r", r);
  root.setProperty("--fg-g", g);
  root.setProperty("--fg-b", b);

  // カスタム時間の初期化
  ["ctHours", "ctMinutes", "ctSeconds"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.value = "0";
  });

  // デフォルトタイマー設定
  document.querySelectorAll("#timerOptions button").forEach((btn) => {
    btn.classList.remove("active");
  });
  const defaultButton = document.querySelector(
    '#timerOptions button[data-minutes="10"]'
  );
  if (defaultButton) {
    defaultButton.classList.add("active");
    TimerState.set({
      countdownTime: Utils.CONSTANTS.DEFAULT_TIMER_MINUTES * 60 * 1000,
      totalTime: Utils.CONSTANTS.DEFAULT_TIMER_MINUTES * 60 * 1000,
    });
  }

  // 初期表示
  const state = TimerState.get();
  SevenSegmentDisplay.render(Utils.formatTime.mmss(state.countdownTime));

  // サイドメニューはデフォルトで閉じる
  SideMenu.close();
  document.getElementById("openMenu").style.display = "block";

  // 初期状態はタイマーモード
  document.body.classList.add("timer-mode");
  document.body.classList.remove("stopwatch-mode");

  // モーダルドラッグ機能の初期化
  ModalDrag.init();

  // 音声テストボタンのイベントリスナー
  const soundTestButton = document.getElementById("soundTest");
  if (soundTestButton) {
    soundTestButton.addEventListener("click", () => {
      console.log("🔊 音声テストボタンがクリックされました");
      AlarmSound.testSound();
    });
  }

  // 音量スライダーのイベントリスナー（DesignSettingsモジュールで既に処理済みのため削除）

  // 初期表示サイズでのサーキット進行状況位置調整
  const initialScale = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--disp-scale"
    ) || "0.8"
  );
})();

// ===== 音声設定 =====
const SoundSettings = (() => {
  const fab = document.getElementById("soundFab");
  const modal = document.getElementById("soundModal");
  const card = modal.querySelector(".design-card");
  const volumeSlider = document.getElementById("soundVolumeSlider");
  const volumeDisplay = document.getElementById("soundVolumeDisplay");
  const cancelButton = document.getElementById("soundCancel");
  const applyButton = document.getElementById("soundApply");
  const typeList = document.getElementById("soundModalTypeList");
  const testButton = document.getElementById("soundModalTest");

  let soundSnapshot = null;

  // 音声種類のデータ（AlarmSoundモジュールから取得）
  const soundTypes = [
    { key: "beep", name: "ビープ音" },
    { key: "chime", name: "チャイム" },
    { key: "bell", name: "ベル" },
    { key: "alarm", name: "アラーム" },
    { key: "notification", name: "通知音" },
    { key: "whistle", name: "ホイッスル" },
    { key: "marimba", name: "マリンバ" },
    { key: "gong", name: "ゴング" },
  ];

  // 音声種類リストを生成
  const createSoundTypeList = () => {
    typeList.innerHTML = "";
    soundTypes.forEach((type) => {
      const item = document.createElement("div");
      item.className = "sound-type-item";
      item.innerHTML = `
        <input type="radio" name="soundType" value="${type.key}" id="sound-${type.key}">
        <label for="sound-${type.key}">
          <span class="sound-name">${type.name}</span>
        </label>
        <button class="sound-test-btn" data-sound-type="${type.key}" title="音声テスト">
          <i class="fas fa-volume-up"></i>
        </button>
      `;
      typeList.appendChild(item);
    });
  };

  // スナップショットを作成
  const createSnapshot = () => {
    return {
      volume: AlarmSound.getVolume(),
      soundType: AlarmSound.getSoundType(),
      vibration: AlarmSound.getVibration(),
    };
  };

  // スナップショットを適用
  const applySnapshot = (snapshot) => {
    volumeSlider.value = snapshot.volume;
    if (snapshot.volume === 0) {
      volumeDisplay.textContent = "無音";
    } else {
      volumeDisplay.textContent = `${Math.round(snapshot.volume * 100)}%`;
    }

    // 音声種類を選択
    const soundTypeRadio = document.querySelector(
      `input[name="soundType"][value="${snapshot.soundType}"]`
    );
    if (soundTypeRadio) {
      soundTypeRadio.checked = true;
    }

    // バイブレーション設定を適用
    const vibrationToggle = document.getElementById("vibrationToggle");
    const vibrationLabel = document.querySelector(".vibration-switch-label");
    if (vibrationToggle && vibrationLabel) {
      vibrationToggle.checked = snapshot.vibration;
      vibrationLabel.textContent = snapshot.vibration ? "ON" : "OFF";
    }
  };

  // モーダルを開く
  const open = () => {
    soundSnapshot = createSnapshot();
    applySnapshot(soundSnapshot);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  // モーダルを閉じる
  const close = () => {
    modal.classList.remove("open");

    // フォーカスをモーダル外に移動してアクセシビリティエラーを防ぐ
    if (document.activeElement && modal.contains(document.activeElement)) {
      fab.focus();
    }

    modal.setAttribute("aria-hidden", "true");
    soundSnapshot = null;

    // テスト音を停止
    AlarmSound.stopTestSound();
  };

  // 適用
  const apply = () => {
    const volume = parseFloat(volumeSlider.value);
    const soundType =
      document.querySelector('input[name="soundType"]:checked')?.value ||
      "beep";
    const vibrationToggle = document.getElementById("vibrationToggle");
    const vibration = vibrationToggle ? vibrationToggle.checked : true;

    AlarmSound.setVolume(volume);
    AlarmSound.setSoundType(soundType);
    AlarmSound.setVibration(vibration);

    close();
  };

  // キャンセル
  const cancel = () => {
    if (soundSnapshot) {
      applySnapshot(soundSnapshot);
    }
    close();
  };

  // イベントリスナーを設定
  fab.addEventListener("click", open);
  cancelButton.addEventListener("click", cancel);
  applyButton.addEventListener("click", apply);

  // 音量スライダー
  let previousVolume = parseFloat(volumeSlider.value);
  let silentModeAlertShown = false;

  volumeSlider.addEventListener("input", () => {
    const volume = parseFloat(volumeSlider.value);
    const wasZero = previousVolume === 0;

    AlarmSound.setVolume(volume);
    if (volume === 0) {
      volumeDisplay.textContent = "無音";
    } else {
      volumeDisplay.textContent = `${Math.round(volume * 100)}%`;

      // 音量を0から上げた時、スマホのみアラート表示
      if (wasZero && !silentModeAlertShown && window.innerWidth <= 768) {
        silentModeAlertShown = true;
        setTimeout(() => {
          alert(
            "🔇 消音モードの確認\n\nスマホが消音モードになっている場合、音声は再生されません。\n\n消音モードを解除してください。\n（バイブレーション機能は動作します）"
          );
        }, 100);
      }
    }

    previousVolume = volume;
  });

  // スピーカーアイコンクリック時の音声テスト
  typeList.addEventListener("click", (e) => {
    const testBtn = e.target.closest(".sound-test-btn");
    if (testBtn) {
      e.preventDefault();
      const soundType = testBtn.dataset.soundType;
      // 一時的に音声種類を変更してテスト
      const originalSoundType = AlarmSound.getSoundType();
      AlarmSound.setSoundType(soundType);
      AlarmSound.testSound();
      // 元の音声種類に戻す
      AlarmSound.setSoundType(originalSoundType);
    }
  });

  // モーダル外クリックで閉じる
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      cancel();
    }
  });

  // ESCキーでモーダルを閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      cancel();
    }
  });

  // 初期化
  const init = () => {
    createSoundTypeList();

    // スマホの場合、消音モードを判定して音量をデフォルト設定
    let initialVolume = parseFloat(volumeSlider.value);

    if (window.innerWidth <= 768) {
      // スマホの場合、消音モード判定を試みる
      const testAudio = new Audio(
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
      );
      testAudio.volume = 0.1;

      testAudio
        .play()
        .then(() => {
          testAudio.pause();
          console.log("✅ 音声再生可能（消音モードOFF）");
        })
        .catch((error) => {
          console.log("🔇 消音モード検出：音量を無音に設定");
          // 消音モードの場合、音量を0に設定
          initialVolume = 0;
          volumeSlider.value = 0;
          AlarmSound.setVolume(0);
          volumeDisplay.textContent = "無音";
        });
    }

    // 音量設定
    AlarmSound.setVolume(initialVolume);
    if (initialVolume === 0) {
      volumeDisplay.textContent = "無音";
    } else {
      volumeDisplay.textContent = `${Math.round(initialVolume * 100)}%`;
    }

    // バイブレーション機能の初期化
    const vibrationToggle = document.getElementById("vibrationToggle");
    const vibrationLabel = document.querySelector(".vibration-switch-label");

    if (vibrationToggle && vibrationLabel) {
      // バイブレーション対応デバイスの場合のみ表示（CSSで制御）
      if (AlarmSound.isVibrationSupported()) {
        console.log("📳 バイブレーション機能が利用可能です");
      }

      vibrationToggle.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        vibrationLabel.textContent = enabled ? "ON" : "OFF";

        // バイブレーション設定を保存
        AlarmSound.setVibration(enabled);
        console.log(`📳 バイブレーション設定変更: ${enabled ? "ON" : "OFF"}`);

        // テストバイブレーション（強力なパターン）
        if (enabled && "vibrate" in navigator) {
          try {
            const testPattern = [200, 100, 200];
            const result = navigator.vibrate(testPattern);
            console.log(
              `📳 テストバイブレーション: ${result ? "✅ 成功" : "❌ 失敗"}`
            );
          } catch (err) {
            console.error("❌ テストバイブレーションエラー:", err);
          }
        }
      });
    }
  };

  // DOMContentLoadedで初期化
  document.addEventListener("DOMContentLoaded", init);

  return { open, close, apply };
})();

// ===== スマホ対応：音声コンテキストの初期化 =====
// スマホの自動再生ポリシー対策：最初のユーザー操作で音声を有効化
const initAudioOnFirstInteraction = () => {
  const initAudio = () => {
    // 音声コンテキストを初期化（ダミー音声を再生）
    try {
      const dummyAudio = new Audio();
      dummyAudio.volume = 0;
      dummyAudio
        .play()
        .then(() => {
          dummyAudio.pause();
          console.log("🎵 ユーザー操作により音声を有効化");
        })
        .catch(() => {
          // エラーは無視
        });
    } catch (err) {
      // エラーは無視
    }
  };

  document.addEventListener("click", initAudio, { once: true });
  document.addEventListener("touchstart", initAudio, { once: true });
};

// ページ読み込み時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAudioOnFirstInteraction);
} else {
  initAudioOnFirstInteraction();
}
