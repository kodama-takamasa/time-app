# 個人使用向け - 最適なデプロイ方法

個人でのみ使用する場合の、最もシンプルで効率的な方法を説明します。

## 🎯 推奨方法：使用シーン別

### 方法 1: ローカルで使用（PC のみ）⭐ 最もシンプル

#### 手順

1. **サーバーを起動**

```bash
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"
python3 -m http.server 8000
```

2. **ブラウザで開く**

- `http://localhost:8000` にアクセス
- ブックマークに追加

3. **使い終わったら**

- ターミナルで `Ctrl+C` でサーバー停止

#### 自動起動スクリプトを作成（便利）

`start-timer.command` というファイルを作成：

```bash
#!/bin/bash
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"
echo "タイマーアプリを起動中..."
echo "ブラウザで http://localhost:8000 を開いてください"
echo "終了するには Ctrl+C を押してください"
python3 -m http.server 8000
```

実行権限を付与：

```bash
chmod +x start-timer.command
```

**使い方：**

- `start-timer.command` をダブルクリックするだけ！
- 自動でサーバーが起動します

---

### 方法 2: 同じ Wi-Fi 内のスマホでも使用 ⭐ 便利

#### 手順

1. **Mac の IP アドレスを確認**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

例：`inet 192.168.1.5` → IP アドレスは `192.168.1.5`

2. **サーバーを起動（外部アクセス許可）**

```bash
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"
python3 -m http.server 8000 --bind 0.0.0.0
```

3. **スマホでアクセス**

- スマホと Mac を同じ Wi-Fi に接続
- スマホのブラウザで `http://192.168.1.5:8000` を開く（自分の IP アドレスに置き換え）

4. **スマホにインストール**

- Android: メニュー（⋮）→「ホーム画面に追加」
- iOS: 共有ボタン（□↑）→「ホーム画面に追加」

#### 便利スクリプト（IP アドレス自動表示）

`start-timer-wifi.command` を作成：

```bash
#!/bin/bash
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"

# IPアドレスを取得
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "================================"
echo "タイマーアプリを起動しました！"
echo "================================"
echo ""
echo "PC: http://localhost:8000"
echo "スマホ: http://${IP}:8000"
echo ""
echo "スマホは同じWi-Fiに接続してください"
echo "終了するには Ctrl+C を押してください"
echo "================================"
echo ""

python3 -m http.server 8000 --bind 0.0.0.0
```

実行権限を付与：

```bash
chmod +x start-timer-wifi.command
```

---

### 方法 3: 外出先でもスマホで使用（GitHub Pages）

外出先でもアプリを使いたい場合は、無料でオンライン公開できます。

#### 必要なもの

- GitHub アカウント（無料）

#### 手順

1. **GitHub リポジトリを作成**

- https://github.com/ にログイン
- 「New repository」をクリック
- リポジトリ名: `timer-app`（任意）
- 「Public」を選択（無料で使うため）
- 「Create repository」をクリック

2. **ターミナルでアップロード**

```bash
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"

# Gitの初期設定（初回のみ）
git config --global user.name "kodama-takamasa"
git config --global user.email "gs.kodamaoffice@gmail.com"

# リポジトリの初期化
git init
git add .
git commit -m "Initial commit"
git branch -M main

# GitHubにプッシュ（ユーザー名を置き換え）
git remote add origin https://github.com/kodama-takamasa/time-app.git
git push -u origin main
```

3. **GitHub Pages を有効化**

- GitHub のリポジトリページへ
- 「Settings」→「Pages」
- Source: 「main」ブランチを選択
- 「Save」をクリック

4. **公開 URL を確認**

- 数分後、`https://ユーザー名.github.io/timer-app/` でアクセス可能

5. **スマホにインストール**

- 公開 URL をスマホで開く
- 「ホーム画面に追加」でインストール

#### メリット

- ✅ どこからでもアクセス可能
- ✅ 完全無料
- ✅ PC の起動不要

#### デメリット

- ⚠️ URL を知っている人は誰でもアクセス可能
  （個人使用なら問題なし。URL を共有しなければ OK）

---

## 📊 比較表

| 方法         | メリット                       | デメリット               | おすすめ度 |
| ------------ | ------------------------------ | ------------------------ | ---------- |
| ローカル     | 最もシンプル、完全プライベート | PC のみ                  | ⭐⭐⭐     |
| Wi-Fi 内     | スマホでも使える、プライベート | 同じ Wi-Fi 内のみ        | ⭐⭐⭐⭐   |
| GitHub Pages | どこでも使える、PC 起動不要    | 公開される（URL は秘密） | ⭐⭐⭐⭐⭐ |

---

## 🎯 個人的なおすすめ

### PC メインで使うなら

→ **方法 1（ローカル）** + 便利スクリプト

### スマホでも使いたいなら

→ **方法 2（Wi-Fi 内）** または **方法 3（GitHub Pages）**

家でしか使わない → 方法 2
外でも使いたい → 方法 3

---

## 💡 よくある質問

### Q: スクリプトが動かない

A: 実行権限を付与してください

```bash
chmod +x start-timer.command
```

### Q: スマホでインストールできない

A: HTTPS 接続が必要です

- ローカル: `http://localhost` は例外で動作します
- Wi-Fi 内: HTTP でも「ホーム画面に追加」は可能（PWA インストールは制限あり）
- GitHub Pages: 自動的に HTTPS になります

### Q: アイコンはどうする？

A: `generate-icons.html` をブラウザで開いて生成してください

### Q: GitHub Pages で公開したくない部分がある

A: リポジトリを Private にする（GitHub Pro プラン必要、有料）
または、方法 1 か 2 を使用してください

---

## 🚀 次のステップ

1. まず **方法 1** を試してみる
2. スマホでも使いたければ **方法 2** か **方法 3** を検討
3. `generate-icons.html` でアイコンを生成
4. アプリを楽しむ！

不明点があればお気軽にご質問ください。
