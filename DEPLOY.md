# 公開手順：GitHub Pages + Cloudflare

対象：沖縄文芸フリマ公式サイト一式

- 本番URL：`https://furima.ryukyu-tane.com/`
- GitHubリポジトリ：`sady225/bungei-furima`
- 公開元：GitHub Actionsが生成する `_site/` アーティファクト
- カスタムドメイン：`furima.ryukyu-tane.com`

## 1. 公開対象と安全ルール

`scripts/build-public-site.sh` は、次の公開用ファイルだけを `_site/` へコピーします。

- `index.html`：トップページ
- `ai-editor/index.html`、`style.css`、`app.js`：オンライン事務局
- `ai-editor/assets/office-background.png`：オンライン事務局の背景
- `photo/251213/*.jpg`、`photo/250920-thanks.png`、`photo/fukusima.png`：現在のページが使用する写真
- `CNAME`：GitHub Pagesのカスタムドメイン指定
- `.nojekyll`：Jekyll変換を使わず、そのまま静的ファイルとして公開する指定

JSON、PDF、Keynote、Vrew、旧HTML、個人データ、内部資料は公開アーティファクトへ入りません。想定外のファイルが `_site/` に入った場合、ビルドは失敗します。

## 2. GitHub Pagesの設定

GitHubで `sady225/bungei-furima` を開きます。

このリポジトリがprivateの場合でもGitHub Pagesに使えますが、GitHub公式ドキュメント上は、private repositoryからPagesを公開するには GitHub Pro / Team / Enterprise 系のプランが必要です。GitHub Freeの場合は、Pages公開元のリポジトリをpublicにする必要があります。

また、private repositoryからGitHub Pagesで公開した場合でも、公開されたWebサイト自体はインターネット上で閲覧可能です。リポジトリ内に公開したくないファイルや秘密情報を置かないでください。

1. `Settings` を開く
2. 左メニューの `Pages` を開く
3. `Build and deployment` の `Source` を `GitHub Actions` にする
4. `.github/workflows/deploy-pages.yml` の完了を確認する
5. `Custom domain` に `furima.ryukyu-tane.com` を入れて保存
6. `Enforce HTTPS` が選べるようになったら有効化

GitHub公式ドキュメントでは、カスタムサブドメインはGitHub Pages側にドメインを追加したうえで、DNSにCNAMEを設定する流れです。DNS反映やHTTPS設定には時間がかかることがあります。

## 3. Cloudflare DNSの設定

Cloudflareで `ryukyu-tane.com` のDNSを開き、`furima` の既存レコードがValue-DomainのFTPサーバーを指している場合は、GitHub Pages向けに差し替えます。

推奨レコード：

| Type | Name | Target | Proxy status |
| --- | --- | --- | --- |
| CNAME | `furima` | `sady225.github.io` | まずは `DNS only` |

GitHub PagesでカスタムドメインとHTTPSが正常になった後、Cloudflare経由にしたい場合は `Proxy status` を `Proxied` に切り替えます。切り替え後は Cloudflare の `SSL/TLS` を `Full` 以上にしてください。

注意：

- CNAMEのTargetにリポジトリ名 `/bungei-furima` は入れません。
- ワイルドカードDNS（`*.ryukyu-tane.com`）は使わないでください。
- 旧FTPサーバー向けの `A` / `CNAME` レコードが同じ名前で残っていると、意図しない向き先になります。

## 4. 更新手順

ローカルで変更したら、最初に公開アーティファクトを確認します。

```bash
bash scripts/build-public-site.sh
find _site -type f | sort
```

確認後、通常のGit操作でGitHubへ反映します。

```bash
git status
git add -- <確認済みのファイルパス>
git diff --cached
git commit -m "Update site"
git push origin main
```

GitHub Pagesの反映には数十秒から数分かかることがあります。

`Settings` → `Pages` のSourceが `Deploy from a branch` のままでは、リポジトリ直下の内部資料まで公開される可能性があります。必ず `GitHub Actions` へ切り替えてから公開してください。

## 5. 動作確認チェックリスト

- [ ] `https://furima.ryukyu-tane.com/` がトップページを表示する
- [ ] `https://furima.ryukyu-tane.com/ai-editor/` がオンライン事務局を表示する
- [ ] ページ名が「オンライン事務局」になっている
- [ ] 背景画像が表示される
- [ ] 作品を出す参加ルートが読める
- [ ] 子ども実行委員が独立した参加ルートとして読める
- [ ] 場を支える参加ルートが読める
- [ ] 来場者向けの当日案内が読める
- [ ] 未確定の開催日時、住所、地図、駐車場、公共交通、バリアフリー、配置図、飲食、入場料、混雑時間を断定していない
- [ ] トップページの「参加方法を見る」リンクが開く
- [ ] 「沖縄文芸フリマ公式サイトへ戻る」リンクでトップページに戻れる
- [ ] 「2026年度プロジェクト」「2027年2月開催企画中」「田場公民館（予定）」の表記が確認できる
- [ ] 2027年2月6日・13日は「候補日」として表示され、確定日と誤解されない
- [ ] 参加時間や途中参加など、未決定の参加条件を断定していない
- [ ] 募集中・受付中と誤解させる表現がない
- [ ] すべてのリンクが実在する
- [ ] 電話番号が正式なものか確認されている
- [ ] スマートフォン幅でも横スクロールせず読める
- [ ] 8つの立場別入口から固定案内を切り替えられる
- [ ] 案内所の初期表示でAI通信・外部通信・ログ保存が発生しない
- [ ] Instagram埋め込みは「表示する」を押した後だけ読み込まれる
- [ ] 画像・作品は公開許可の確認済み素材だけが掲載される
- [ ] Instagramなど外部リンクが正しく開く
- [ ] CSP違反やブラウザコンソールエラーがない
- [ ] GitHub Pagesで `Enforce HTTPS` が有効になっている
- [ ] Cloudflare経由に切り替えた後もHTTPS警告が出ない

## 6. 正式なフォームURLが決まったら

作品出展・子ども実行委員・場を支える参加・来場の正式な受付フォームやお問い合わせページのURLが決まったら、`ai-editor/index.html` 内の `href="#contact"` を実際のURLに差し替えてください。

現在は、各ボタンがページ内の「お問い合わせ方法」セクション（Instagram DM・電話番号）へ案内する形です。

## 7. トラブル時

- GitHub Pagesが404になる：Pages設定が `GitHub Actions` になっているか、Actionsの実行結果を確認
- 独自ドメインが旧サイトを表示する：Cloudflare DNSに旧FTP向けレコードが残っていないか確認
- HTTPSが有効にならない：GitHub Pagesのカスタムドメイン保存後、DNS反映を待ってから `Enforce HTTPS` を再確認
- CSSやJSが読み込めない：ブラウザのキャッシュを削除、またはスーパーリロード

### `Enforce HTTPS` がONにできない場合

`furima.ryukyu-tane.com` がGitHub Pagesの内容を表示していても、証明書がまだ `*.github.io` のままだと `Enforce HTTPS` は有効化できません。

確認すること：

1. Cloudflare DNSで `furima` が `CNAME` → `sady225.github.io` になっている
2. 証明書発行中は、CloudflareのProxy statusをいったん `DNS only` にする
3. `furima` と同じ名前の旧FTP向け `A` / `AAAA` / `CNAME` レコードを残さない
4. GitHubの `Settings` → `Pages` で、Custom domainを一度削除して保存し、再度 `furima.ryukyu-tane.com` を入れて保存する
5. GitHubがTLS証明書を発行するまで数分から最大1時間ほど待つ
6. Custom domain欄にチェックが付いたら `Enforce HTTPS` をONにする

HTTPSが有効になった後でCloudflare経由に戻す場合は、Proxy statusを `Proxied` にし、Cloudflareの `SSL/TLS` は `Full` 以上にしてください。`Flexible` は使わないでください。

## 8. 過去に登録した非公開資料について

非公開資料を現在のブランチから削除しても、過去のGit履歴からは直ちに消えません。個人データを含む可能性があるファイルが過去に登録されていた場合は、次の対応を別作業として行います。

1. 非公開の保管先へ原本を退避する
2. 対象パスを確定する
3. 関係者へ履歴書き換えと強制pushの影響を説明する
4. 承認後、Git履歴から対象パスを削除する
5. 既存cloneの再取得を案内する

履歴書き換えは通常の更新pushとは分け、明示的な承認を得てから実施してください。
