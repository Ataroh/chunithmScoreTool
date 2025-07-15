(async () => {
    const entries = [...document.querySelectorAll('.frame02.w400')];
    const results = entries.map(entry => {
        // 楽曲ごとのプレイ日時
        const date = entry.querySelector('.play_datalist_date')?.innerText.trim() ?? '';
        // 楽曲名
        const title = entry.querySelector('.play_musicdata_title')?.innerText.trim() ?? '';
        // スコア
        const score = entry.querySelector('.play_musicdata_score_text')?.innerText.trim() ?? '';
        // 難易度（画像srcのファイル名から判別）
        const levelImgSrc = entry.querySelector('.play_track_result img')?.src ?? '';
        const level = levelImgSrc.includes('ultimate') ? 'ULT' :
                      levelImgSrc.includes('master') ? 'MAS' :
                      levelImgSrc.includes('expert') ? 'EXP' :
                      levelImgSrc.includes('advanced') ? 'ADV' :
                      levelImgSrc.includes('basic') ? 'BAS' :
                      levelImgSrc.includes('worldsend') ? 'WE' : 'UNKNOWN';
        // クリアランプ
        const lampImg = entry.querySelector('img[src*="icon_clear"], img[src*="icon_hard"], img[src*="icon_absolute"]');
        const lamp = lampImg ? (
                        lampImg.src.includes('clear') ? 'CLR' :
                        lampImg.src.includes('hard') ? 'HRD' :
                        lampImg.src.includes('absolute') ? 'ABS' :
                        lampImg.src.includes('catastrophy') ? 'CTS' : 'UNKNOWN'
                    ) : '';
        // AJ/FC検出
        const fcIcon = entry.querySelector('img[src*="icon_fullcombo"]');
        const ajIcon = entry.querySelector('img[src*="icon_alljustice"]');
        const status = ajIcon ? 'AJ' : fcIcon ? 'FC' : '-';

        return { date, title, level, score, status, lamp };// track, rank
    });

    results.sort((a, b) => new Date(a.date) - new Date(b.date))

    /*
    console.log('取得したデータ:', results);
    alert(`${results.length}件の詳細データを取得しConsoleに出力しました`);
    */

    // 送信前に確認ダイアログを表示
    const confirmSend = window.confirm(`データを送信しますか? (${results.length}件)`);
    if (!confirmSend) {
        //alert('送信はキャンセルされました');
        return;
    }

    const webhookURL = window.__WEBHOOK_URL__;
    if (!webhookURL) {
        alert('[エラー] Webhook URL が定義されていません');
        return;
    }

    try {
        const res = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain', // 'application/json'から変更
            },
            body: JSON.stringify(results)
        });

        if (res.ok) {
            alert('送信完了');
        } else {
            alert('送信失敗：' + res.statusText);
        }
    } catch (err) {
        alert('エラーが発生しました：' + err.message);
    }
})();
