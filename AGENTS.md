# AIエージェント向け運用ルール

対象：Claude Code、Codex、その他このリポジトリで作業するAIエージェント全般

このリポジトリは複数のAIエージェント（Claude Code、Codex等）が、同じ担当者（sady225）の指示のもとで並行して作業することがあります。エージェント同士は互いのセッションを認識できないため、以下のルールで衝突と重複作業を防ぎます。

## 1. 作業前に必ず確認すること

- `git fetch origin` して `origin/main` を最新化する。
- `git log --oneline -10 origin/main` で、自分がこれから行おうとしている変更と同じ内容のコミットが既に無いか確認する（コミットメッセージだけでなく、`git show <sha> --stat` で中身も確認する）。
- 特にパッチファイルを適用する場合、パッチの内容（diffの各ハンク）が既にorigin/mainに含まれていないか確認する。含まれていれば、適用・pushをスキップする。

## 2. パッチ適用・push手順

- ダウンロードしたパッチはSHA-256を照合してから使う。
- 作業は必ず `origin/main` から切ったブランチ上で行う（`main` を直接汚さない）。
- `git am --3way` を使う。競合が出た場合は自己判断で強引に解決せず、内容を報告する。
- push直前に再度 `git fetch origin` し、`origin/main` が自分の作業開始時から動いていないか確認する。動いていた場合は `git rebase origin/main` を行い、パッチが既に取り込まれていないか（`warning: skipped previously applied commit` 等）を確認する。
- force-pushは行わない。fast-forwardできない場合は取り込み直してから通常pushする。
- 直接 `main` へpushする運用（PRを介さない）がこのリポジトリの通常運用。

## 3. 安全チェック（必須・スキップ不可）

- push前に `bash scripts/check-site-safety.sh` と `git diff --check` を実行し、両方合格させる。
- `scripts/check-site-safety.sh` は `rg`（ripgrep）に依存する。`rg` が使えない環境では、まずインストールを試みる。Homebrewでのソースビルドが極端に重い/失敗する場合は、`npm install -g @vscode/ripgrep` などのプリビルドバイナリ配布を使い、実際のバイナリでスクリプトを実行すること。`rg` 不在によるエラーを「安全チェック通過」と誤認しない（`set -e` は `if` 条件内のコマンド失敗を捕捉しないため、`rg`が無いと誤ったfail/passになり得る）。
- 詳細な公開ルールは `SAFETY_AND_PUBLICATION.md` を参照する。

## 4. ブランチ運用

- 作業用ブランチは短命に保ち、mainへの取り込みが終わったら削除する（ローカル・リモート両方）。
- ブランチ名は用途が分かる名前にする（例: `apply-<変更内容>-patch`）。エージェント自動生成のランダムサフィックス付き名前（例: `claude/xxxx-yyyy`）は、作業完了後に消し忘れないよう特に注意する。
- 定期的に `git branch -r` を確認し、mainに対してユニークなコミットが無い（`git merge-base --is-ancestor <branch> main` が真になる）マージ済み・破棄済みブランチは削除してリポジトリを整理する。

## 5. GitHub Pages公開確認

- push後、`.github/workflows/deploy-pages.yml` のワークフロー実行結果を確認する（`https://api.github.com/repos/sady225/bungei-furima/actions/runs` で `head_sha` を突き合わせる）。
- 公開URL `https://furima.ryukyu-tane.com/` に実際にアクセスし、変更内容が反映されているか確認してから完了報告する。
