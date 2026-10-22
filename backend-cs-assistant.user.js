// ==UserScript==
// @name         backend-cs-assistant.user
// @namespace    cs.reply.assistant
// @version      1.0.2
// @description  Siapkan pesan verifikasi dari data backend ke Salesmartly
// @updateURL    https://raw.githubusercontent.com/thelostmansions-lgtm/backend-cs-assistant/main/backend-cs-assistant.user.js
// @downloadURL  https://raw.githubusercontent.com/thelostmansions-lgtm/backend-cs-assistant/main/backend-cs-assistant.user.js
// @match        *https://rp6_pxme3s.indback666.com/*
// @match        *https://888xh_pyxe3s.indback666.com/*
// @match        *https://777wz_xsese3s.indback666.com/*
// @match        *https://rk5_vcxs4s.indback666.com/*
// @match        *https://rk789_pxsu3s.indback666.com/*
// @match        *https://222i_pymi3s.indback666.com/*
// @match        *https://rszz_dkxs5s.indback666.com/*
// @match        *https://app.salesmartly.com/*
// @match        *https://app.salesmartly.cc/*
// @match        *https://app.salesmartly.vip/*
// @match        *https://app-global.salesmartly.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// ==/UserScript==

 (function () {
     'use strict';

     const KEY = 'csReplyAssistantPendingMessage';
     const SALES_URLS = [
    'app.salesmartly.com',
    'app.salesmartly.cc',
    'app.salesmartly.vip',
    'app-global.salesmartly.com'
];
     const PLACEHOLDER =
         'Enter to send, Ctrl + Enter for a new line, or press Ctrl + K to open the feature panel';


     // ---------- TEMPLATE PESAN TERPISAH ----------
     // Ubah teks RESET_PIN_TEMPLATE untuk tombol Reset PIN Penarikan.
     const RESET_PIN_TEMPLATE = {
         intro: 'Untuk proses verifikasi Reset PIN PENARIKAN, mohon kirim foto/screenshot berikut:',
         transactionLabel: 'Bukti uang masuk ke rekening',
         timeLabel: 'Waktu:',
         amountLabel: 'Jumlah: Rp',
         profileTitle: 'Screenshot profil rekening Anda',
         typeLabel: 'Jenis rekening:',
         nameLabel: 'Nama:',
         numberLabel: 'Nomor rekening:',
         instruction: 'Pastikan nama dan nomor rekening terlihat jelas di screenshot.',
         closing: 'Setelah kami menerima semua bukti tersebut, kami akan segera memprosesnya.',
         thanks: 'Terima kasih.'
     };

     // Ubah teks RESET_LOGIN_TEMPLATE untuk tombol Reset Sandi Login.
     // Template ini sengaja terpisah dari RESET_PIN_TEMPLATE.
     const RESET_LOGIN_TEMPLATE = {
         intro: 'Untuk proses verifikasi Reset Sandi Login, mohon kirim foto/screenshot berikut:',
         transactionLabel: 'Bukti uang masuk ke rekening',
         timeLabel: 'Waktu:',
         amountLabel: 'Jumlah: Rp',
         profileTitle: 'Screenshot profil rekening Anda',
         typeLabel: 'Jenis rekening:',
         nameLabel: 'Nama:',
         numberLabel: 'Nomor rekening:',
         instruction: 'Pastikan nama dan nomor rekening terlihat jelas di screenshot.',
         closing: 'Setelah kami menerima semua bukti tersebut, kami akan segera memprosesnya.',
         thanks: 'Terima kasih.'
     };

     // Template deposit untuk tombol Reset PIN Penarikan. Bisa diedit tanpa memengaruhi tombol login.
     const RESET_PIN_DEPOSIT_TEMPLATE = {
         intro: 'Untuk proses verifikasi Reset PIN PENARIKAN.',
         request: 'Mohon kirimkan bukti berikut:',
         transferTitle: 'Bukti transfer deposit',
         timeLabel: 'Waktu transfer:',
         amountLabel: 'Nominal : Rp',
         profileTitle: 'Screenshot profil',
         ownerLabel: 'Nama pemilik:',
         numberLabel: 'Nomor:',
         transferHelp: 'Bukti transfer bisa diambil dari rekening bank, e-wallet, atau aplikasi yang Anda gunakan untuk mengirim uang deposit.',
         closing: 'Setelah bukti kami terima, kami akan segera memprosesnya.',
         thanks: 'Terima kasih.'
     };

     // Template deposit untuk tombol Reset Sandi Login. Bisa diedit secara terpisah.
     const RESET_LOGIN_DEPOSIT_TEMPLATE = {
         intro: 'Untuk proses verifikasi Reset Sandi Login, mohon kirim foto/screenshot berikut.',
         request: 'Mohon kirimkan bukti berikut:',
         transferTitle: 'Bukti transfer deposit',
         timeLabel: 'Waktu transfer:',
         amountLabel: 'Nominal : Rp',
         profileTitle: 'Screenshot profil',
         ownerLabel: 'Nama pemilik:',
         numberLabel: 'Nomor:',
         transferHelp: 'Bukti transfer bisa diambil dari rekening bank, e-wallet, atau aplikasi yang Anda gunakan untuk mengirim uang deposit.',
         closing: 'Setelah bukti kami terima, kami akan segera memprosesnya.',
         thanks: 'Terima kasih.'
     };
// Template video khusus Reset PIN Penarikan.
const RESET_PIN_VIDEO_TEMPLATE = {
    intro: 'Mohon kirim video verifikasi untuk Reset PIN Penarikan.',
    extra: ''
};

// Template video khusus Reset Sandi Login.
const RESET_LOGIN_VIDEO_TEMPLATE = {
    intro: 'Mohon kirim video verifikasi untuk Reset Sandi Login.',
    extra: ''
};

// Template video khusus Reset Video Verifikasi. Bisa diedit mandiri.
const RESET_VIDEO_VERIFIKASI_TEMPLATE = {
    intro: 'Mohon kirim video verifikasi dengan ketentuan.',
    extra: ''
};

// Template video khusus Lupa Akun.
const LUPA_AKUN_VIDEO_TEMPLATE = {
    intro: 'Untuk membantu lupa akun/ganti password, kami perlu verifikasi untuk memastikan keamanan akun ya bos :',
    extra: ''
};
     // ---------- UTILITAS ----------
     const clean = value => (value || '').replace(/\s+/g, ' ').trim();

     function getBalance() {
    const input = document.querySelector('input[name="balance"]');
    if (!input) return null;

    const value = clean(input.value).replace(/,/g, '');
    if (!value) return null;

    const balance = Number(value);
    return Number.isFinite(balance) ? balance : null;
}
function formatBackendDateTime(value) {
    const text = clean(value);

    const match = text.match(
        /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::\d{2})?$/
    );

    if (!match) return text;

    const [, year, month, day, hour, minute] = match;

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April',
        'Mei', 'Juni', 'Juli', 'Agustus',
        'September', 'Oktober', 'November', 'Desember'
    ];

    const monthIndex = Number(month) - 1;

    if (monthIndex < 0 || monthIndex > 11) return text;

    return `${Number(day)} ${monthNames[monthIndex]} ${year} Jam ${hour}:${minute}`;
}
     function getEditor() {
         const pList = document.querySelectorAll('p[data-placeholder]');
         for (const p of pList) {
             if (p.getAttribute('data-placeholder') !== PLACEHOLDER) continue;
             const editor = p.closest('[contenteditable="true"]');
             if (editor) return editor;
         }
         return document.querySelector(
             '[contenteditable="true"].ProseMirror, .ProseMirror[contenteditable="true"]'
         );
     }

     function fillEditor(text) {
         const editor = getEditor();
         if (!editor) return false;

         editor.focus();

         // Gunakan paste event seperti pengujian yang sebelumnya berhasil.
         const transfer = new DataTransfer();
         transfer.setData('text/plain', text);

         const event = new ClipboardEvent('paste', {
             clipboardData: transfer,
             bubbles: true,
             cancelable: true
         });

         editor.dispatchEvent(event);
         return true;
     }

     // ---------- SALES MARTLY ----------
     if (SALES_URLS.includes(location.hostname)) {
         let lastMessageId = '';

         async function checkPendingMessage() {
             const pending = await GM_getValue(KEY, null);
             if (!pending || !pending.id || pending.id === lastMessageId) return;

             // Pesan tidak diisi jika editor tidak tersedia.
             if (!getEditor()) return;

             const accepted = confirm(
                 'Ada pesan verifikasi dari backend.\n\n' +
                 'Masukkan pesan ke kolom balasan sekarang?\n' +
                 '(Pesan tidak akan dikirim otomatis.)'
             );

             lastMessageId = pending.id;

             if (!accepted) {
                 await GM_setValue(KEY, null);
                 return;
             }

             if (fillEditor(pending.text)) {
                 await GM_setValue(KEY, null);
                 alert('Pesan sudah dimasukkan. Periksa sebelum mengirim.');
             } else {
                 alert('Kolom balasan tidak ditemukan. Buka percakapan terlebih dahulu.');
             }
         }

         // ---------- TOMBOL COPY INFO MEMBER ----------
         function addMemberCopyButton() {
             document.querySelectorAll('.session-info__name-wrap').forEach(nameWrap => {
                 if (nameWrap.querySelector('.cs-member-copy-btn')) return;

                 const nameElement = nameWrap.querySelector('.session-info__name');
                 if (!nameElement) return;

                 const memberName = clean(nameElement.textContent);
                 const idMatch = memberName.match(/\d+/);
                 if (!idMatch) return;

                 const lowerName = memberName.toLowerCase();
                 const hasLP = /\blp\b/.test(lowerName) || /lp\+/.test(lowerName);
                 const hasLS = /\bls\b/.test(lowerName);
                 const hasLock = /\block\b/.test(lowerName);
                 const hasLok = /\block\b/.test(lowerName);

                 let action = '';
                 if (hasLP && hasLock && hasLok) {
                     action = 'RESET PIN WD & UNLOCK';
                 } else if (hasLP) {
                     action = 'RESET PIN WD';
                 } else if (hasLS) {
                     action = 'RESET SANDI LOGIN';
                 } else {
                     return;
                 }

                 const button = document.createElement('button');
                 button.type = 'button';
                 button.className = 'cs-member-copy-btn';
                 button.textContent = 'Copy';
                 button.title = 'Salin ID, situs, dan jenis kendala';
                 button.style.cssText = `
                     margin-left:8px;
                     padding:3px 8px;
                     font-size:11px;
                     cursor:pointer;
                     color:#1677ff;
                     background:transparent;
                     border:1px solid #1677ff;
                     border-radius:5px;
                     vertical-align:middle;
                 `;

                 button.addEventListener('click', async () => {
                     const currentName = clean(nameElement.textContent);
                     const currentId = currentName.match(/\d+/);
                     if (!currentId) return;

                     const siteElement = [...document.querySelectorAll('span[data-v-e58095e8] span[data-v-e58095e8]')]
                         .find(el => /^[A-Z0-9]+$/.test(clean(el.textContent)));

                     const site = siteElement ? clean(siteElement.textContent) : '';
                     const currentLower = currentName.toLowerCase();

                     let currentAction = '';
                     if (/\blp\b/.test(currentLower) || /lp\+/.test(currentLower)) {
                         currentAction = /\block\b/.test(currentLower)
                             ? 'RESET PIN WD & UNLOCK'
                             : 'RESET PIN WD';
                     } else if (/\bls\b/.test(currentLower)) {
                         currentAction = 'RESET SANDI LOGIN';
                     }

                     if (!currentAction) return;

                     const text = [
                         `ID : ${currentId[0]}`,
                         `SITUS : ${site}`,
                         currentAction
                     ].join('\n');

                     try {
                         await navigator.clipboard.writeText(text);
                         button.textContent = 'Tersalin';
                         setTimeout(() => {
                             button.textContent = 'Copy';
                         }, 1200);
                     } catch (error) {
                         console.error('Gagal menyalin info member:', error);
                     }
                 });

                 nameWrap.appendChild(button);
             });
         }

         addMemberCopyButton();

         new MutationObserver(addMemberCopyButton).observe(document.documentElement, {
             childList: true,
             subtree: true,
             characterData: true
         });

         setInterval(checkPendingMessage, 1500);
         return;
     }

     // ---------- BACKEND: BACA TABEL ----------
     function getRenderedRows(containerId) {
         const marker = document.getElementById(containerId);
         if (!marker) {
             return { ok: false, rows: [], reason: 'Kontainer tabel tidak ditemukan: ' + containerId };
         }

         // Layui biasanya membuat .layui-table-view sebagai sibling tabel sumber.
         const parent = marker.parentElement || marker;
         let views = [...parent.querySelectorAll('.layui-table-view')];

         const ownView = marker.closest('.layui-table-view');
         if (ownView) views.unshift(ownView);

         views = [...new Set(views)];

         let rows = [];
         for (const view of views) {
             const found = [...view.querySelectorAll('.layui-table-body tbody tr')]
                 .filter(tr => tr.querySelector('td[data-field]') && !tr.classList.contains('layui-hide'));
             rows.push(...found);
         }

         // Fallback jika halaman menampilkan tabel langsung di dalam kontainer.
         if (!rows.length) {
             rows = [...marker.querySelectorAll('tbody tr')]
                 .filter(tr => tr.querySelector('td[data-field]'));
         }

         const loading = parent.querySelector('.layui-table-page + .layui-table-body .layui-none');
         if (loading && /加载中|loading/i.test(clean(loading.textContent))) {
             return { ok: false, rows: [], reason: 'Tabel masih dimuat.' };
         }

         return { ok: true, rows };
     }

     function cell(row, field) {
         const el = row.querySelector(`td[data-field="${field}"]`);
         return el ? clean(el.innerText || el.textContent) : '';
     }

     function readTransactions(containerId) {
         const result = getRenderedRows(containerId);
         if (!result.ok) return result;

         const rows = result.rows.map(row => ({
             time: formatBackendDateTime(cell(row, 'completed_time')),
             amount: cell(row, 'money'),
             type: cell(row, 'type')
         })).filter(item => item.time || item.amount || item.type);

         // Tabel menampilkan maksimal tiga transaksi; baris pertama diasumsikan terbaru.
         return { ok: true, rows };
     }

     function readBankCards() {
         const result = getRenderedRows('table_bank_card_list');
         if (!result.ok) return result;

         return {
             ok: true,
             rows: result.rows.map(row => ({
                 type: cell(row, 'bank_name'),
                 name: cell(row, 'bank_user'),
                 number: cell(row, 'bank_number')
             })).filter(item => item.type || item.name || item.number)
         };
     }

     function readWallets() {
         const result = getRenderedRows('table_wallet_list');
         if (!result.ok) return result;

         return {
             ok: true,
             rows: result.rows.map(row => ({
                 type: cell(row, 'wallet_name'),
                 name: cell(row, 'real_name'),
                 number: cell(row, 'account') || cell(row, 'phone') || cell(row, 'email')
             })).filter(item => item.type || item.name || item.number)
         };
     }

     function profileText(banks, wallets) {
         const profiles = [
             ...banks.map((x, i) =>
                 `${i + 1}. Bank: ${x.type || '-'}\nNama: ${x.name || '-'}\nNomor rekening: ${x.number || '-'}`
             ),
             ...wallets.map((x, i) =>
                 `${banks.length + i + 1}. E-wallet: ${x.type || '-'}\nNama: ${x.name || '-'}\nNomor/akun: ${x.number || '-'}`
             )
         ];
         return profiles.join('\n\n');
     }

     function transactionText(transaction, label) {
         return `${label}\nWaktu: ${transaction.time || '-'}\nNominal: Rp ${transaction.amount || '-'}`;
     }

     function makeResetVideoMessage(kind, wd, deposits, banks, wallets) {
    const template = kind === 'Reset Video Verifikasi'
        ? RESET_VIDEO_VERIFIKASI_TEMPLATE
        : kind === 'Reset PIN Penarikan'
            ? RESET_PIN_VIDEO_TEMPLATE
            : RESET_LOGIN_VIDEO_TEMPLATE;

    const message = makeMessage(
        'Video Verifikasi',
        wd,
        deposits,
        banks,
        wallets
    );

    if (!message) return null;

    const videoIntro =
        'Mohon kirim video verifikasi dengan ketentuan.';

    return message.replace(
        videoIntro,
        [template.intro, template.extra].filter(Boolean).join('\n')
    );
}

     function makeMessage(kind, wd, deposits, banks, wallets) {
         const latestWD = wd.rows[0];
         const latestDeposit = deposits.rows[0];
         const profiles = profileText(banks.rows, wallets.rows);
         const hasProfiles = Boolean(profiles);

         let transaction = null;
         if (latestWD) {
             transaction = latestWD;
         } else if (latestDeposit) {
             transaction = latestDeposit;
         }

         if (!transaction && !hasProfiles) {
             return null;
         }

         if (kind === 'Video Verifikasi' || kind === 'Lupa Akun') {
    let appName = '';

    if (latestWD) {
        appName = clean(latestWD.type);

        if (!appName || /^BANK$/i.test(appName)) {
            appName = clean(banks.rows[0]?.type) || 'BANK';
        }
    } else if (latestDeposit) {
        appName = clean(latestDeposit.type) || 'xxx';
    }

    const videoTemplate = kind === 'Lupa Akun'
    ? LUPA_AKUN_VIDEO_TEMPLATE
    : RESET_VIDEO_VERIFIKASI_TEMPLATE;

const lines = [
    videoTemplate.intro,
    '',
        'Rekam menggunakan HP lain, bukan screen record.',
        'Mulai dari layar Home HP.',
        `Buka aplikasi ${latestWD ? appName : 'Ewallet/Bank yang anda gunakan untuk kirim uang'}.`,
        ''
    ];

             if (transaction) {
    lines.push(
        transactionText(
            transaction,
            latestWD
                ? 'Tampilkan detail transaksi/slip penerimaan uang:'
                : 'Tampilkan detail transaksi/slip setoran uang:'
        ),
        ''
    );
}

             if (hasProfiles) {
                 lines.push('Tampilkan profil rekening berikut:', profiles, '');
             }

             lines.push(
                 'Tunjukkan jari Anda saat merekam sebagai bukti video asli.',
                 'Pastikan terlihat minimal 2 bukti/slip transaksi.',
                 '',
                 'Mohon pastikan semua data terlihat jelas dan tidak blur agar proses verifikasi lebih cepat ya bos'
             );

             return lines.join('\n');
         }

         // WD: setiap tombol menggunakan sumber template yang terpisah.
         if (latestWD) {
             const template = kind === 'Reset Sandi Login'
                 ? RESET_LOGIN_TEMPLATE
                 : RESET_PIN_TEMPLATE;

             const wdProfiles = [
                 ...banks.rows.map(bank => ({
                     type: bank.type || '-',
                     name: bank.name || '-',
                     number: bank.number || '-'
                 })),
                 ...wallets.rows.map(wallet => ({
                     type: wallet.type || '-',
                     name: wallet.name || '-',
                     number: wallet.number || '-'
                 }))
             ];

             const lines = [
                 template.intro,
                 '',
                 '1. ' + template.transactionLabel + ' ' + (latestWD.type || '[jenis]'),
                 template.timeLabel + ' ' + (latestWD.time || '[waktu]'),
                 template.amountLabel + ' ' + (latestWD.amount || '[nominal]'),
                 ''
             ];

             if (wdProfiles.length) {
                 wdProfiles.forEach((profile, index) => {
                     lines.push(
                         `${index + 2}. ${template.profileTitle}`,
                         template.typeLabel + ' ' + profile.type,
                         template.nameLabel + ' ' + profile.name,
                         template.numberLabel + ' ' + profile.number,
                         ''
                     );
                 });
             } else {
                 lines.push(
                     '2. ' + template.profileTitle,
                     template.typeLabel + ' ' + (latestWD.type || '[jenis]'),
                     template.nameLabel + ' [nama]',
                     template.numberLabel + ' [norek]',
                     ''
                 );
             }

             lines.push(
                 template.instruction,
                 template.closing,
                 template.thanks
             );

             return lines.join('\n');
         }

         // Deposit: pilih template sesuai tombol yang ditekan agar kalimat PIN dan Login terpisah.
         if (latestDeposit) {
             const template = kind === 'Reset Sandi Login'
                 ? RESET_LOGIN_DEPOSIT_TEMPLATE
                 : RESET_PIN_DEPOSIT_TEMPLATE;
             const lines = [
                 template.intro,
                 template.request,
                 '',
                 '1. ' + template.transferTitle,
                 template.timeLabel + ' ' + (latestDeposit.time || '-'),
                 template.amountLabel + ' ' + (latestDeposit.amount || '-'),
                 ''
             ];

             const depositProfiles = [
                 ...banks.rows.map(bank => ({
                     type: bank.type || '-',
                     name: bank.name || '-',
                     number: bank.number || '-'
                 })),
                 ...wallets.rows.map(wallet => ({
                     type: wallet.type || '-',
                     name: wallet.name || '-',
                     number: wallet.number || '-'
                 }))
             ];

             depositProfiles.forEach((profile, index) => {
                 lines.push(
                     `${index + 2}. ${template.profileTitle} ${profile.type}.`,
                     `${template.ownerLabel} ${profile.name}`,
                     `${template.numberLabel} ${profile.number}`,
                     ''
                 );
             });

             lines.push(
                 template.transferHelp,
                 template.closing,
                 template.thanks
             );

             return lines.join('\n');
         }

         // Jika tidak ada transaksi, minta profil yang tersedia saja.
         return [
             'Mohon kirim screenshot profil rekening berikut:',
             '',
             profiles,
             '',
             'Pastikan nama dan nomor rekening terlihat jelas di screenshot.',
             'Setelah kami menerima bukti yang diperlukan, kami akan segera memprosesnya.',
             'Terima kasih.'
         ].join('\n');
     }

     // ---------- TOMBOL BACKEND ----------
     function addButtons() {
    const target = document.querySelector('.layui-row.layui-col-space12')
        ?.parentElement;

    if (!target || document.querySelector('.cs-ra-buttons')) return;


         const wrapper = document.createElement('div');
         wrapper.className = 'cs-ra-buttons';
         wrapper
         wrapper.style.cssText = `
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    justify-content: center;
    width: max-content;
    max-width: calc(100vw - 24px);
    padding: 12px;
    box-sizing: border-box;
    background: rgba(9, 15, 29, 0.94);
    border: 1px solid rgba(100, 160, 255, 0.28);
    border-radius: 14px;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.42),
        0 0 24px rgba(59, 130, 246, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    z-index: 99999;
`;


         const buttons = [
    { label: 'Reset PIN Penarikan', color: '#1677ff' },
    { label: 'Reset Sandi Login', color: '#16a34a' },
    { label: 'Lupa Akun', color: '#9333ea', action: 'Lupa Akun' },
    { label: 'Video Verifikasi', color: '#dc2626', action: 'Video Verifikasi' }
];

         for (const item of buttons) {
             const button = document.createElement('button');
             button.type = 'button';
             button.textContent = item.label;

             button.style.cssText = `
    position: relative;
    overflow: hidden;
    isolation: isolate;
    background: linear-gradient(
        135deg,
        ${item.color}24 0%,
        rgba(15, 23, 42, 0.96) 100%
    );
    color: #eaf2ff;
    border: 1px solid ${item.color}85;
    border-radius: 8px;
    padding: 9px 13px;
    cursor: pointer;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.35px;
    white-space: nowrap;
    text-shadow: 0 0 10px ${item.color}40;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.07),
        0 2px 8px rgba(0, 0, 0, 0.18);
    transition:
        transform 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease,
        filter 0.2s ease;
`;


             button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.borderColor = item.color;
    button.style.background = `
        linear-gradient(
            135deg,
            ${item.color}40 0%,
            rgba(15, 23, 42, 0.98) 100%
        )
    `;
    button.style.boxShadow = `
        0 0 14px ${item.color}30,
        inset 0 1px 0 rgba(255, 255, 255, 0.12)
    `;
    button.style.filter = 'brightness(1.12)';
});

button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.borderColor = `${item.color}85`;
    button.style.background = `
        linear-gradient(
            135deg,
            ${item.color}24 0%,
            rgba(15, 23, 42, 0.96) 100%
        )
    `;
    button.style.boxShadow = `
        inset 0 1px 0 rgba(255, 255, 255, 0.07),
        0 2px 8px rgba(0, 0, 0, 0.18)
    `;
    button.style.filter = 'brightness(1)';
});

             button.addEventListener('click', async () => {
                 const wd = readTransactions('last_three_withdraw_table_container');
                 const deposits = readTransactions('last_three_recharge_table_container');
                 const banks = readBankCards();
                 const wallets = readWallets();

                 const failed = [wd, deposits, banks, wallets].find(x => !x.ok);

                 if (failed) {
                     console.warn('CS Reply Assistant:', failed.reason);
                     return;
                 }

                 const balance = getBalance();

const isResetButton = [
    'Reset PIN Penarikan',
    'Reset Sandi Login'
].includes(item.label);

let message;
const action = item.action || item.label;

if (item.label === 'Video Verifikasi') {
    message = makeMessage(
        'Video Verifikasi',
        wd,
        deposits,
        banks,
        wallets
    );
} else if (isResetButton && balance !== null && balance >= 100) {
    message = makeResetVideoMessage(
        item.label,
        wd,
        deposits,
        banks,
        wallets
    );
} else {
    message = makeMessage(
        action,
        wd,
        deposits,
        banks,
        wallets
    );
}

                 if (!message) {
                     console.warn(
                         'CS Reply Assistant: Data transaksi dan profil tidak ditemukan.'
                     );
                     return;
                 }

                 try {
                     GM_setClipboard(message, 'text');
                     console.log('CS Reply Assistant: Pesan berhasil disalin.');
                 } catch (error) {
                     console.error('CS Reply Assistant: Gagal menyalin pesan.', error);
                 }
             });

             wrapper.appendChild(button);
         }

         target.appendChild(wrapper);

     }

     addButtons();
     new MutationObserver(addButtons).observe(document.documentElement, {
         childList: true,
         subtree: true
     });
 })();
