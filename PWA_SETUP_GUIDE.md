# タイマー＆ストップウォッチ PWA セットアップガイド

このガイドでは、タイマー＆ストップウォッチアプリを PWA（Progressive Web App）として完成させる手順を説明します。

## 📋 現在の状態

以下のファイルは既に作成済みです：

- ✅ `manifest.json` - アプリ設定ファイル
- ✅ `service-worker.js` - オフライン対応・キャッシュ管理
- ✅ `index.html` - PWA 設定を追加済み

## 🎨 必要な作業：アイコン画像の準備

PWA として完全に機能させるには、アイコン画像が必要です。

### 必要なアイコンサイズ

`icons` フォルダを作成し、以下のサイズのアイコンを用意してください：

```
timer_stop/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png    ← 最重要
│   ├── icon-384x384.png
│   └── icon-512x512.png    ← 最重要
```

### アイコン作成方法

#### 方法 1: オンラインツールで自動生成（推奨）

1. **元画像を準備**

   - 512x512px 以上の正方形画像を用意
   - タイマーやストップウォッチのイメージ
   - 背景は透明または単色推奨

2. **PWA Icon Generator を使用**
   - https://www.pwabuilder.com/imageGenerator
   - または https://favicon.io/favicon-converter/
3. **手順**
   - 元画像をアップロード
   - 必要なサイズを選択（72, 96, 128, 144, 152, 192, 384, 512）
   - ダウンロードして `icons/` フォルダに配置

#### 方法 2: Canva で作成

1. Canva にアクセス: https://www.canva.com/
2. カスタムサイズで 512x512px を作成
3. タイマー/ストップウォッチのデザインを作成
4. PNG 形式でダウンロード
5. オンラインツールで各サイズに変換

#### 方法 3: 既存の絵文字を使用（簡易版）

一時的に絵文字をアイコンとして使用する場合：

```bash
# iconsフォルダを作成
mkdir icons
```

以下の HTML を開いて、各サイズのアイコンを手動で保存：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Icon Generator</title>
  </head>
  <body>
    <canvas id="canvas"></canvas>
    <script>
      const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      sizes.forEach((size) => {
        canvas.width = size;
        canvas.height = size;

        // 背景
        ctx.fillStyle = "#16213e";
        ctx.fillRect(0, 0, size, size);

        // 絵文字
        ctx.font = `${size * 0.7}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⏱️", size / 2, size / 2);

        // ダウンロード
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `icon-${size}x${size}.png`;
          a.click();
        });
      });
    </script>
  </body>
</html>
```

## 🚀 デプロイ方法

### ローカルでテスト

1. **HTTPS サーバーで起動**（Service Worker には HTTPS が必須）

   ```bash
   # Python 3を使用
   cd timer_stop
   python3 -m http.server 8000

   # または Node.jsのhttp-serverを使用
   npx http-server -p 8000
   ```

2. **ブラウザで開く**
   - `http://localhost:8000` にアクセス
   - 開発者ツール（F12）を開く
   - Console で「✅ Service Worker 登録成功」を確認

### オンラインでデプロイ

#### GitHub Pages を使用（無料・簡単）

1. **GitHub リポジトリを作成**

   ```bash
   cd timer_stop
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ユーザー名/timer-app.git
   git push -u origin main
   ```

2. **GitHub Pages を有効化**

   - リポジトリの Settings > Pages
   - Source: main branch
   - Save

3. **公開 URL**
   - `https://ユーザー名.github.io/timer-app/`

#### Netlify を使用（無料・高機能）

1. https://www.netlify.com/ にアクセス
2. 「Add new site」→「Deploy manually」
3. `timer_stop` フォルダをドラッグ&ドロップ
4. 自動的に HTTPS で公開される

#### Vercel を使用（無料・高速）

1. https://vercel.com/ にアクセス
2. 「New Project」
3. `timer_stop` フォルダをインポート
4. 自動的にデプロイ

## 📱 インストール方法

### Android Chrome

1. デプロイした URL にアクセス
2. ブラウザのメニュー（⋮）を開く
3. 「ホーム画面に追加」または「アプリをインストール」を選択
4. アプリ名を確認して「追加」

### iOS Safari

1. デプロイした URL にアクセス
2. 共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. アプリ名を確認して「追加」

### デスクトップ Chrome

1. デプロイした URL にアクセス
2. アドレスバーの右側にインストールアイコン（⊕）が表示される
3. クリックして「インストール」

## ✅ 動作確認チェックリスト

- [ ] アイコン画像（icons/）を作成・配置
- [ ] ローカルで HTTPS サーバーを起動
- [ ] ブラウザで開いて Console を確認
- [ ] Service Worker が登録されているか確認
- [ ] Application > Service Workers で状態確認
- [ ] Application > Manifest で設定確認
- [ ] オフラインモードでも動作するか確認
- [ ] インストールプロンプトが表示されるか確認
- [ ] 実際にインストールして動作確認

## 🔧 トラブルシューティング

### Service Worker が登録されない

- HTTPS で接続されているか確認（localhost は例外）
- Console でエラーメッセージを確認
- ブラウザのキャッシュをクリア

### アイコンが表示されない

- `icons/` フォルダのパスが正しいか確認
- manifest.json のパスが正しいか確認
- 画像ファイルが存在するか確認

### インストールボタンが表示されない

- HTTPS 接続か確認
- manifest.json が正しく読み込まれているか確認
- 最低限必要な設定（name, start_url, icons）があるか確認

## 📚 参考リンク

- [PWA Builder](https://www.pwabuilder.com/)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)
- [Google - PWA チェックリスト](https://web.dev/pwa-checklist/)

## 🎉 完了後

PWA 化が完了すると：

- ✅ オフラインでも動作
- ✅ ホーム画面から起動可能
- ✅ ネイティブアプリのような体験
- ✅ 自動アップデート対応
- ✅ プッシュ通知も追加可能（今後拡張可能）

質問や問題があれば、お気軽にお尋ねください！
