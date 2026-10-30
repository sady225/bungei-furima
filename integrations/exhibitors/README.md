# 出店者紹介の受付・審査・承認公開

2026-10-30：**コード実装・ローカル試験済み。外部接続と本番公開は未実施。** mainへ取り込むと既存Pagesが本番を更新するため、承認前にマージしない。

## 構成と境界

| 場所 | 役割 |
| --- | --- |
| `gas/Config.gs` | シート列、秘密設定、Trello通信 |
| `gas/Core.gs` | 新規受付停止フォーム・私有ボード作成、受付、版承認、署名付き台帳API |
| `gas/Triggers.gs` | フォームトリガー、承認メニュー、保護、受付復旧 |
| `worker/index.mjs` | 通知HMAC、Durable Objectで重複排除・再試行、Git原子更新 |
| `worker/domain.mjs` | 公開条件、公開専用フィールド、URL・画像・JSON検証 |
| `prepare-images.py` | 非公開作業場所でWebP変換・メタデータ除去・SHA256生成 |
| `/exhibitors/` | 同一オリジンJSONを読む開催回別紹介ページ |
| `/data/exhibitors.json` | 公開スナップショット。初期状態は0件 |

フォーム・Drive原典、台帳、同意、審査者、連絡先は非公開。Trelloカードは申請IDのみ。Gitには公開専用フィールドと確認済みWebPだけを送る。既存の固定紹介は過去開催の記録として維持する。

## 接続・設定手順

認証情報をチャット、公開Git、コマンド引数、ログへ貼らない。以下の外部操作はこの作業では未実行。

1. 作成済みの試験用Google Sheets（URLは内部Layer 1記録）を使う。5タブ、架空3件`fixture-*`、全件未承認。実データは入れない。
2. 台帳に紐づく新規Apps Scriptへ`gas/`の3ファイルと`appsscript.json`を登録する。既存本番GAS・トリガーは変更しない。
3. Script Propertiesを下表のとおり設定し`setupDraft()`を実行する。フォームは新規・未公開・受付停止で作られる。Google Forms APIはファイルアップロード項目の作成に未対応なので、フォーム編集画面で「作品画像」を手動追加する（画像のみ、最大3枚、1枚10MB以下）。IDを`UPLOAD_ITEM_ID`へ登録する。ログイン困難者は運営窓口で代理受付する。画像原本を共有リンクにしない。
4. `setupPrivateBoard()`で試験用私有ボードと「受付／内容確認中／修正依頼／掲載承認／公開／公開停止／取下げ」を作る。リスト作成途中の失敗は`setupBoardLists()`で再開。作成POST結果が不明な場合は、再実行前にTrello現物で作成済みか確認する。
5. 確認済みWebP派生物専用の私有Driveフォルダを作り、`APPROVED_FOLDER_ID`を設定する。シート・フォルダ・ボードの参加者/権限を確認する。
6. `protectReviewSheets()`で5タブを所有者・審査者だけが編集可能に保護する。画像欄確認後`installIntakeTrigger()`でこの機能の送信トリガーだけ追加する。他のトリガーは消さない。
7. 実装ブランチから試験データ専用`staging/exhibitors-data`を作る。mainを指定しない。このブランチ更新では既存Pagesは動かない。試験データをmainへマージしない。
8. 新規WorkerとSQLite Durable Objectを設定する。実アカウント・費用・割当を確認する。実際の秘密登録と新規稼働設定は、変更一覧を提示して明示承認後に行う。公式Wrangler CLIの例：`wrangler deploy --config integrations/exhibitors/worker/wrangler.toml`。この作業では未実行。
9. 新規GAS Web Appを所有者実行・Workerから到達可能な署名付きAPIとして設定する。無認証読取りGETは作らない。本文HMAC、5分のtimestamp、nonceを検証し、応答も署名・nonce照合する。Web App URL自体は認証とみなさない。この方式が組織ポリシーで許されない場合は認証付き別バックエンドを用意する。
10. `/trello`のHEAD=200、偽装署名=401、別ボード拒否を実通信で確認後、`registerWebhook()`を実行する。
11. 新しい試験フォームを試験用に開き、架空3件を実送信する。本番受付の一般公開は行わない。カード操作→試験ブランチのJSON/画像→表示、停止、修正、撤回、再試行を実測する。
12. PC/スマホ目視・独立レビュー・保持期限・費用・担当を確認し、変更内容と実機試験を提示して本番承認を得る。

### Script Properties（すべて非公開）

| キー | 内容 |
| --- | --- |
| `SPREADSHEET_ID` | 作成済み試験台帳ID。未設定なら新規作成 |
| `PUBLICATION_END` | 同意文に明示する掲載終了日`YYYY-MM-DD`。取得済み同意の期限を超えて延長不可 |
| `FORM_ID`, `QUESTION_IDS` | 初期作成処理が保存。途中失敗時は現物の項目重複・欠落を修復してから再開 |
| `UPLOAD_ITEM_ID` | 手動追加したFILE_UPLOAD項目ID |
| `TRELLO_KEY`, `TRELLO_TOKEN` | 試験用Trello資格情報 |
| `TRELLO_BOARD_ID`, `LIST_受付`等 | 作成処理が保存。実リストIDをWorkerと照合 |
| `REVIEWER_EMAILS` | 承認操作可能な審査者メール、カンマ区切り |
| `APPROVED_FOLDER_ID` | WebP派生物だけの私有フォルダ |
| `BACKEND_SECRET` | Workerと共有する十分長いランダム署名秘密 |
| `CALLBACK_URL` | 登録時と完全一致のWorker HTTPS `/trello` URL |

### Worker設定

- 通常変数：`GITHUB_BRANCH`, `PRODUCTION_ENABLED`, `CALLBACK_URL`, `BACKEND_URL`, `TRELLO_BOARD_ID`, `TRELLO_PUBLIC_LIST_ID`。
- Secret：`GITHUB_TOKEN`, `TRELLO_KEY`, `TRELLO_TOKEN`, `TRELLO_APP_SECRET`, `BACKEND_SECRET`。
- バインディング：`PUBLICATION`（SQLite Durable Object）。初期値は試験用名と`PRODUCTION_ENABLED=false`。実アカウント・秘密・IDは未登録。
- GitHub権限は対象リポジトリのContents:writeだけ。可能なら短命installation tokenを使い、期限前に更新する。長期資格情報を使う試験でも有効期限を設ける。
- main書込みには`PRODUCTION_ENABLED=true`が必要。承認前に切り替えない。

## 画像審査と版承認

非公開領域で`python integrations/exhibitors/prepare-images.py /private/source/image1.jpg --output /private/reviewed-derivatives`を実行する。原本は残す。WebP派生物を人間が画像単位で確認し、私有承認フォルダへアップロードする。`approved_images_json`は`[{"fileId":"非公開Drive派生物ID","sha256":"64桁のハッシュ"}]`。

権利者、掲載先・目的・期間、顔、名札、学校名、住所、車両番号、第三者著作物を点検する。未成年は本人意思・保護者同意・決裁者確認を別々に確認する。`confirmed=true`、`consent_state=許可済み`、`image_review=許可済み`、`review_state=掲載承認`、`expires_at`を確認し、審査行を選択して「掲載審査→選択行を掲載承認」を実行する。承認版と審査者を非公開記録する。

Trello「公開」移動に加え、台帳の版承認が必須。リスト単独で厳密な操作権限を実現できるという前提にはしない。本文・期限・同意条件・画像マニフェスト変更後は再承認が必要。画像加工と派生物アップロードは運営作業。原本の自動削除は実装しない。保持期間・バックアップ・削除担当は稼働前に決定する。

## 停止・修正・撤回・復旧

- 修正：カードを「修正依頼」へ移し、非公開台帳を変更→再承認→「公開」へ戻す。カード本文から公開文章を作らない。
- 公開停止：「公開停止」へ移す。JSONと対象画像を現行Gitツリーから同一コミットで除外する。
- 撤回：`withdrawn=true`/`consent_state=撤回`と「取下げ」を設定する。原典の許諾変更と対応を私有ログに記録する。
- 期限：初回通知以降1時間ごとに同意・期限・現在位置を再評価する。ブラウザも期限切れ紹介を隠す。静的画像削除は次回同期・Pages反映まで時間を要する。
- 重複/遅延/逆順通知は現在状態を再取得する。直近512通知IDのみ永続保存し、生通知・個人情報を保存しない。
- API失敗/429/競合はDurable Object alarmで最大1時間の指数バックオフを継続する。force-pushしない。成功ackはGit commit後のみ。Pages成功は別なのでActionsでSHAを確認する。
- 画像改変/取得不能/公開文章不正は当該出店者を対象から除外し、別出店者の撤回を進める。台帳全体の取得失敗は空一覧で上書きせず再試行する。
- 受付途中失敗は原因解消後`reconcileIntake()`で再取得する。行単位で欠落を補い、既存カードを再利用する。不明な作成POSTは現物も確認する。
- `publication-sync-failed`ログ、Durable Objectの`failures`/`lastFailure`/`lastSuccess`、audit_log、Actions失敗を監視する。**自動メール/LINE通知は未接続**。当番と通知先の決定が必要。
- 緊急撤回でバックエンド停止中なら、担当者が公開JSONと対象画像だけを手動削除してPages・CDNを確認する。
- Git履歴・CDN・第三者保存は直ちに消えない。Cloudflareの対象URL purge、Pages反映確認が必要。履歴削除はバックアップ・影響確認・別途承認で行う。

## 検証結果と残課題

`node --test integrations/exhibitors/tests/*.test.mjs`：32項目通過。実GAS関数をVMで実行した架空3件の受付、未承認/画像NG、修正再承認、停止/撤回、未成年別同意、偽装署名、別ボード、重複/遅延通知、再試行、GitHub競合、原子的削除、私有項目混入拒否を含む。外部APIはモックで、実接続試験とは区別する。

`bash scripts/check-site-safety.sh`と`git diff --check`通過。試験JSON・画像は一時ディレクトリだけに生成し、公開カタログは0件。ランタイムnpm依存は追加なし。画像処理は既存Pillowを利用。

| 項目 | 現状 |
| --- | --- |
| Google Sheets実体・5タブ・架空3件・非公開 | 作成/読戻し確認済み、GAS未接続 |
| Googleフォーム実送信・Drive画像欄 | 未実施。Googleブラウザがサインアウト状態 |
| Trello私有ボード・実カード・Webhook | 未実施。Trelloプラグイン未接続 |
| Cloudflare Worker/DO・秘密設定・実通信 | 未実施。アカウント接続と対象確認が必要 |
| GitHub実更新→Pages | モック試験のみ。本番未公開 |
| PC/スマホ目視・CSP・画像実表示 | 未実施。別ホストのクラウドブラウザからローカルプレビューへ接続不可 |
| 失敗時の外部通知 | 未接続。秘匿ログと再試行のみ |
| 保持期限・窓口・担当・費用割当 | 本番開始前に決裁が必要 |

防御上の上限は150行、画像1件1〜3枚・1MiB以下、原典API画像合計16MiB以下。実測した本番容量ではない。Workers外部リクエスト/CPU/メモリ、GAS実行時間/UrlFetch、Trello/Actions割当を実アカウントで確認する。無料枠は大量カードの単一同期で上限に達し得る。まず架空3件で実測し、必要なら分割同期を追加する。150件の運用を保証しない。

公開前に独立した人間または別担当のレビューと実サービス試験を行い、High/Criticalが残れば公開しない。

## 一次資料

- [Trello Webhook署名・HEAD・再試行](https://developer.atlassian.com/cloud/trello/guides/rest-api/webhooks/)
- [Google Forms画像欄作成制約](https://developers.google.com/workspace/forms/api/reference/rest/v1/forms#FileUploadQuestion)
- [GitHub Git Trees API](https://docs.github.com/en/rest/git/trees#create-a-tree)
- [Cloudflare Durable Object Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)

内部設計の正本：Obsidian Layer 1 `2026-10-30-Trello-Googleフォーム-GitHub公開連携設計・作業記録.md`。
