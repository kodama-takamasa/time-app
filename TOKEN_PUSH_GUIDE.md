# 個人アクセストークンを使ったプッシュ手順

## 🔑 認証の流れ

### 1. プッシュコマンドを実行

```bash
git push -u origin main
```

### 2. 認証プロンプトが表示される

**Username の入力:**

```
Username for 'https://github.com':
```

→ `kodama-takamasa` と入力して Enter

**Password の入力:**

```
Password for 'https://github.com/kodama-takamasa@github.com':
```

→ **ここにコピーしたトークンを貼り付け**（パスワードではありません！）

### 3. 成功メッセージ

```
Enumerating objects: 20, done.
Counting objects: 100% (20/20), done.
Delta compression using up to 8 threads
Compressing objects: 100% (15/15), done.
Writing objects: 100% (20/20), 150.00 KiB | 5.00 MiB/s, done.
Total 20 (delta 2), reused 0 (delta 0)
To https://github.com/kodama-takamasa/time-app.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## ⚠️ よくあるエラーと解決方法

### エラー 1: Repository not found

**原因:** リポジトリが存在しない
**解決:** GitHub でリポジトリを作成

### エラー 2: Authentication failed

**原因:** トークンが間違っている
**解決:** 新しいトークンを作成

### エラー 3: Permission denied

**原因:** トークンの権限が不足
**解決:** トークン作成時に「repo」にチェック

## 📝 トークン作成の詳細手順

### GitHub での操作

1. **GitHub にログイン**

   - https://github.com

2. **Settings を開く**

   - 右上のアイコン → Settings

3. **Developer settings**

   - 左サイドバー最下部 → Developer settings

4. **Personal access tokens**

   - Personal access tokens → Tokens (classic)

5. **Generate new token**

   - Generate new token → Generate new token (classic)

6. **設定**

   ```
   Note: timer-app-deploy
   Expiration: 90 days
   ```

7. **スコープ選択**

   - ✅ repo（すべてにチェック）

8. **Generate token**
   - 生成されたトークンをコピー

### トークンの例

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🎯 実際の操作

### ターミナルでの操作

```bash
# プロジェクトフォルダに移動
cd "/Users/kodamatakamasa/Desktop/web事業/制作サイト/00：作成/00test/timer_stopwatch/timer_stop"

# プッシュを実行
git push -u origin main
```

### 認証時の入力

```
Username for 'https://github.com': kodama-takamasa
Password for 'https://github.com/kodama-takamasa@github.com': ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意:** Password の部分には、GitHub のパスワードではなく、**生成したトークン**を入力してください。

## ✅ 成功の確認

プッシュが成功すると：

1. **ターミナルに成功メッセージが表示**
2. **GitHub のリポジトリページでファイルが確認できる**
   - https://github.com/kodama-takamasa/time-app

## 🌐 次のステップ: GitHub Pages の有効化

プッシュが成功したら：

1. **GitHub のリポジトリページを開く**

   - https://github.com/kodama-takamasa/time-app

2. **Settings タブをクリック**

3. **左サイドバーの「Pages」をクリック**

4. **Source で「main」ブランチを選択**

5. **Save をクリック**

6. **数分待つと公開 URL が表示される**
   - https://kodama-takamasa.github.io/time-app/
