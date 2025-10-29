# GitHub Pages デプロイ完全ガイド

このガイドでは、タイマーアプリを GitHub Pages で公開する手順を、初心者向けに詳しく説明します。

## 📋 前提条件

- ✅ GitHub アカウントを作成済み
- ✅ GitHub でリポジトリを作成済み

---

## 🚀 ステップ 1: リポジトリ情報を確認

GitHub のリポジトリページで以下を確認してください：

### 確認事項

1. **ユーザー名**

   - 例：`kodama-takamasa`

2. **リポジトリ名**

   - 例：`time-app`

3. **リポジトリの URL**
   - 例：`https://github.com/kodama-takamasa/time-app`

### 📸 スクリーンショット参考

リポジトリページの上部に表示されています：

```
kodama-takamasa / time-app
```

---

## 🖥️ ステップ 2: ターミナルを開く

Mac でターミナルを開きます。

**方法：**

- Spotlight 検索（`⌘ + Space`）→「ターミナル」と入力 → Enter
- または、アプリケーション → ユーティリティ → ターミナル

---

## 📦 ステップ 3: Git の初期設定（初回のみ）

ターミナルで以下のコマンドを**1 行ずつ**実行してください。

### 3-1. Git がインストールされているか確認

```bash
git --version
```

**表示例：**

```
git version 2.39.0
```

もし「command not found」と表示された場合：

```bash
xcode-select --install
```

### 3-2. Git にユーザー情報を設定

**あなたの情報に置き換えて**実行してください：

```bash
git config --global user.name "kodama-takamasa"
git config --global user.email "gs.kodamaoffice@gmail.com"
```

### 3-3. 設定を確認

```bash
git config --global user.name
git config --global user.email
```

正しく表示されれば OK！

---

## 📁 ステップ 4: プロジェクトフォルダに移動

```bash
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"
```

**確認：**

```bash
pwd
```

以下のように表示されれば OK：

```
/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop
```

---

## 🎯 ステップ 5: Git リポジトリを初期化

### 5-1. Git リポジトリを初期化

```bash
git init
```

**表示例：**

```
Initialized empty Git repository in /Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop/.git/
```

### 5-2. ブランチ名を main に変更

```bash
git branch -M main
```

---

## 📤 ステップ 6: ファイルを追加してコミット

### 6-1. すべてのファイルをステージング

```bash
git add .
```

（`.` はカレントディレクトリのすべてのファイルを意味します）

### 6-2. 追加されたファイルを確認

```bash
git status
```

**表示例：**

```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   DEPLOY_PERSONAL.md
        new file:   GITHUB_DEPLOY_GUIDE.md
        new file:   PWA_SETUP_GUIDE.md
        new file:   README.md
        new file:   generate-icons.html
        new file:   index.html
        ...
```

緑色でファイルが表示されていれば OK！

### 6-3. コミット（保存）する

```bash
git commit -m "Initial commit: タイマーアプリの初回コミット"
```

**表示例：**

```
[main (root-commit) 1a2b3c4] Initial commit: タイマーアプリの初回コミット
 15 files changed, 5000 insertions(+)
 create mode 100644 index.html
 create mode 100644 script.js
 ...
```

---

## 🔗 ステップ 7: GitHub リポジトリと接続

### 7-1. リモートリポジトリを追加

**⚠️ 重要：以下のコマンドの URL は、あなたのリポジトリ URL に置き換えてください！**

```bash
git remote add origin https://github.com/あなたのユーザー名/あなたのリポジトリ名.git
```

**例（あなたの場合）：**

```bash
git remote add origin https://github.com/kodama-takamasa/time-app.git
```

### 7-2. 接続を確認

```bash
git remote -v
```

**表示例：**

```
origin  https://github.com/kodama-takamasa/timer-app.git (fetch)
origin  https://github.com/kodama-takamasa/timer-app.git (push)
```

---

## ⬆️ ステップ 8: GitHub にプッシュ（アップロード）

### 8-1. プッシュを実行

```bash
git push -u origin main
```

### 8-2. GitHub 認証

初回は GitHub の認証を求められます。

**macOS の場合：**
ポップアップウィンドウが表示されるので：

1. 「Sign in with your browser」をクリック
2. ブラウザが開く
3. GitHub にログイン
4. 「Authorize」（認証）をクリック

または、**個人アクセストークン**を使用する場合：

#### 個人アクセストークンの作成方法

1. GitHub にログイン
2. 右上のアイコン → Settings
3. 左メニュー最下部の「Developer settings」
4. 「Personal access tokens」→「Tokens (classic)」
5. 「Generate new token」→「Generate new token (classic)」
6. Note: `timer-app-deploy`（任意の名前）
7. Expiration: `90 days`（または好みの期間）
8. Select scopes:
   - ✅ `repo`（すべてにチェック）
9. 「Generate token」をクリック
10. **表示されたトークンをコピー**（二度と表示されません！）

#### トークンを使用してプッシュ

```bash
git push -u origin main
```

Username: `あなたのGitHubユーザー名`
Password: `コピーしたトークン`（パスワードではありません）

### 8-3. プッシュ成功の確認

**表示例：**

```
Enumerating objects: 20, done.
Counting objects: 100% (20/20), done.
Delta compression using up to 8 threads
Compressing objects: 100% (15/15), done.
Writing objects: 100% (20/20), 150.00 KiB | 5.00 MiB/s, done.
Total 20 (delta 2), reused 0 (delta 0)
To https://github.com/kodama-takamasa/timer-app.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 8-4. GitHub で確認

ブラウザで GitHub のリポジトリページを開いて、ファイルがアップロードされているか確認してください。

---

## 🌐 ステップ 9: GitHub Pages を有効化

### 9-1. Settings に移動

1. GitHub のリポジトリページを開く
2. 上部メニューの「**Settings**」タブをクリック

### 9-2. Pages 設定を開く

1. 左サイドバーの「**Pages**」をクリック
   （Code and automation セクションの中にあります）

### 9-3. ブランチを選択

「**Source**」セクションで：

1. プルダウンメニューから「**main**」を選択
2. フォルダは「**/ (root)**」のまま
3. 「**Save**」ボタンをクリック

### 9-4. デプロイを待つ

ページ上部に青いメッセージが表示されます：

```
Your site is ready to be published at https://kodama-takamasa.github.io/timer-app/
```

または

```
Your site is live at https://kodama-takamasa.github.io/timer-app/
```

**⏰ デプロイには 1 ～ 3 分かかります。**

---

## ✅ ステップ 10: 公開サイトにアクセス

### 10-1. URL を確認

公開 URL は以下の形式です：

```
https://あなたのユーザー名.github.io/リポジトリ名/
```

**あなたの場合：**

```
https://kodama-takamasa.github.io/timer-app/
```

### 10-2. ブラウザで開く

上記の URL をブラウザで開いてください。

**✅ アプリが表示されれば成功！**

---

## 📱 ステップ 11: スマホにインストール

### iOS（iPhone/iPad）

1. Safari で公開 URL を開く
2. 画面下の **共有ボタン**（□↑）をタップ
3. 「**ホーム画面に追加**」を選択
4. アプリ名を確認して「**追加**」

### Android

1. Chrome で公開 URL を開く
2. 右上の **メニュー**（⋮）をタップ
3. 「**ホーム画面に追加**」または「**アプリをインストール**」を選択
4. アプリ名を確認して「**追加**」

---

## 🔄 ステップ 12: 今後の更新方法

アプリを更新したい場合は、以下のコマンドを実行：

```bash
# プロジェクトフォルダに移動
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"

# 変更をステージング
git add .

# コミット
git commit -m "更新内容の説明"

# プッシュ
git push
```

数分後、自動的にサイトが更新されます！

---

## 🐛 トラブルシューティング

### エラー: permission denied (publickey)

**原因：** SSH 認証の設定が必要

**解決策：** HTTPS URL を使用してください

```bash
# 現在のリモート URL を確認
git remote -v

# SSH になっている場合は HTTPS に変更
git remote set-url origin https://github.com/kodama-takamasa/timer-app.git
```

### エラー: fatal: unable to access 'https://github.com/...'

**原因：** 認証エラー

**解決策：**

1. 個人アクセストークンを作成
2. プッシュ時にトークンをパスワードとして使用

### サイトが 404 Not Found

**原因：**

1. デプロイに時間がかかっている → 5 分待つ
2. GitHub Pages の設定が間違っている → 再確認
3. URL が間違っている → 確認

**URL の確認：**

- Settings → Pages で表示される URL を使用

### ファイルが更新されない

```bash
# ブラウザのキャッシュをクリア
# または、強制リロード
# Mac: ⌘ + Shift + R
# Windows: Ctrl + Shift + R
```

---

## 📚 よくある質問

### Q: リポジトリ名を変更できますか？

A: はい、できます。

1. GitHub リポジトリページ → Settings
2. Repository name を変更
3. Rename をクリック
4. ローカルのリモート URL も更新：

```bash
git remote set-url origin https://github.com/ユーザー名/新しいリポジトリ名.git
```

### Q: リポジトリを削除するには？

A: Settings → 一番下の「Danger Zone」→ Delete this repository

⚠️ 削除すると復元できません！

### Q: プライベートリポジトリにできますか？

A: はい、ただし GitHub Pages は有料プラン（GitHub Pro）が必要です。

無料プランではパブリックリポジトリのみ GitHub Pages が使えます。

### Q: カスタムドメインを使えますか？

A: はい、Settings → Pages → Custom domain で設定できます。

---

## 🎉 完了！

これで、あなたのタイマーアプリが全世界に公開されました！

### 公開 URL（例）

```
https://kodama-takamasa.github.io/timer-app/
```

### 次のステップ

1. ✅ スマホでアクセスして「ホーム画面に追加」
2. ✅ ブックマークに保存
3. ✅ 友達や家族に URL を共有（任意）

---

## 📝 コマンド一覧（コピペ用）

初回セットアップ：

```bash
# フォルダに移動
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"

# Git 初期化
git init
git branch -M main

# ファイルを追加
git add .

# コミット
git commit -m "Initial commit: タイマーアプリの初回コミット"

# リモートリポジトリを追加（URL を置き換え）
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git

# プッシュ
git push -u origin main
```

更新時：

```bash
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"
git add .
git commit -m "更新内容"
git push
```

---

困ったことがあれば、お気軽にご質問ください！
