# ⏱️ タイマー＆ストップウォッチ PWA

高機能なタイマー＆ストップウォッチアプリ。PWA（Progressive Web App）として動作し、スマホや PC にインストール可能です。

## ✨ 主な機能

- ⏱️ **ストップウォッチ** - 高精度な時間計測
- ⏰ **タイマー** - カウントダウンタイマー
- 🕐 **現在時刻表示** - デジタル時計
- 📋 **サーキットタイマー** - 複数のタイマーを連続実行
- 🔔 **多様なアラーム音** - アラーム音、ゴング音
- ⏰ **チクタク音** - 振り子時計音、タイマービープ音
- 🎨 **カスタマイズ可能** - 音量調整、音の種類選択
- 📱 **PWA 対応** - オフラインで動作、インストール可能
- 🌙 **ダークテーマ** - 目に優しいデザイン

## 🚀 クイックスタート

### ステップ 1: アイコン生成（初回のみ）

1. `generate-icons.html` をブラウザで開く
2. お好みで絵文字と背景色をカスタマイズ
3. 「生成してダウンロード」ボタンをクリック
4. ダウンロードされた 8 個の画像ファイルを `icons/` フォルダに移動

### ステップ 2: ローカルでテスト

```bash
# Python 3を使用してHTTPサーバーを起動
python3 -m http.server 8000

# または Node.jsのhttp-serverを使用
npx http-server -p 8000
```

ブラウザで `http://localhost:8000` を開く

### ステップ 3: オンラインにデプロイ

#### GitHub Pages を使用

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ユーザー名/timer-app.git
git push -u origin main
```

GitHub リポジトリの Settings > Pages で有効化

#### Netlify / Vercel を使用

1. https://www.netlify.com/ または https://vercel.com/ にアクセス
2. フォルダをドラッグ&ドロップしてデプロイ

### ステップ 4: アプリをインストール

**スマホ（iOS/Android）:**

- デプロイした URL にアクセス
- 「ホーム画面に追加」を選択

**PC（Chrome/Edge）:**

- デプロイした URL にアクセス
- アドレスバーのインストールアイコンをクリック

## 📁 ファイル構成

```
timer_stop/
├── index.html              # メインHTMLファイル
├── script.js               # アプリのロジック
├── styles.css              # スタイルシート
├── manifest.json           # PWA設定ファイル
├── service-worker.js       # Service Worker（オフライン対応）
├── generate-icons.html     # アイコン生成ツール
├── PWA_SETUP_GUIDE.md      # 詳細なセットアップガイド
├── README.md               # このファイル
├── icons/                  # アプリアイコン
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── sound/                  # 音声ファイル
    ├── alarm_clock.mp3
    ├── alarm_gong.mp3
    ├── pendulum_clock.mp3
    └── timer_beep.mp3
```

## 🔧 技術スタック

- HTML5 / CSS3 / JavaScript (ES6+)
- Service Worker API
- Web Audio API
- Canvas API
- LocalStorage API
- PWA Manifest

## 📱 対応ブラウザ

- ✅ Chrome / Edge（デスクトップ・モバイル）
- ✅ Safari（iOS 11.3+）
- ✅ Firefox
- ✅ Samsung Internet

## 🎯 PWA の特徴

- **オフライン動作**: インターネット接続なしでも使用可能
- **インストール可能**: ネイティブアプリのように使える
- **自動更新**: 新バージョンが自動的に適用される
- **高速起動**: キャッシュにより高速に起動
- **軽量**: 数 MB 程度の容量

## 📚 詳細ドキュメント

より詳しいセットアップ手順は `PWA_SETUP_GUIDE.md` を参照してください。

## 🐛 トラブルシューティング

### Service Worker が登録されない

- HTTPS 接続を確認（localhost は例外）
- ブラウザのキャッシュをクリア

### アイコンが表示されない

- `icons/` フォルダにアイコンが存在するか確認
- ファイル名が正しいか確認

### 音が鳴らない

- ブラウザの音声再生許可を確認
- 音量設定を確認

## 📝 ライセンス

このプロジェクトは自由に使用・改変できます。

## 🙋 サポート

問題や質問がある場合は、お気軽にお問い合わせください。

---

Made with ❤️ for productivity
