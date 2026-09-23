/**
 * Discord Auto Slash Command Executor
 * This script automates the execution of Discord slash commands across multiple channels.
 */

const CONFIG = {
    DISCORD_API: 'https://discord.com/api/v10',
    STORAGE_KEYS: {
        token: 'discord_token',
        guildId: 'discord_guild_id',
        commandName: 'discord_command_name',
        includeVoice: 'discord_include_voice',
        channelList: 'discord_channel_list',
        clickCount: 'discord_click_count',
        clickDataJson: 'discord_click_data_json'
    }
};

// DOM要素の取得
const elements = {
    tokenInput: document.getElementById('token'),
    guildIdInput: document.getElementById('guildId'),
    commandNameInput: document.getElementById('commandName'),
    includeVoiceToggle: document.getElementById('includeVoiceToggle'),
    fetchCommandsBtn: document.getElementById('fetchCommandsBtn'),
    commandSelect: document.getElementById('commandSelect'),
    optionsContainer: document.getElementById('options-container'),
    channelListTextarea: document.getElementById('channelList'),
    clickCountInput: document.getElementById('clickCount'),
    clickDataJsonTextarea: document.getElementById('clickDataJson'),
    executeBtn: document.getElementById('executeBtn'),
    logDiv: document.getElementById('log'),
    copyLogBtn: document.getElementById('copyLogBtn'),
    resetBtn: document.getElementById('resetBtn')
};

const cards = {
    settingsCard: document.getElementById('settings-card'),
    commandSelectionCard: document.getElementById('command-selection-card'),
    optionsCard: document.getElementById('options-card'),
    executionCard: document.getElementById('execution-card')
};

// ローカルストレージ管理クラス
class LocalStorageManager {
    static save(key, value) {
        localStorage.setItem(CONFIG.STORAGE_KEYS[key], value);
    }

    static load(key) {
        return localStorage.getItem(CONFIG.STORAGE_KEYS[key]);
    }

    static clear() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
}

// ローカルストレージから入力値を復元
function loadFromLocalStorage() {
    elements.tokenInput.value = LocalStorageManager.load('token') || '';
    elements.guildIdInput.value = LocalStorageManager.load('guildId') || '';
    elements.commandNameInput.value = LocalStorageManager.load('commandName') || '';
    elements.includeVoiceToggle.checked = LocalStorageManager.load('includeVoice') === 'true';
    elements.channelListTextarea.value = LocalStorageManager.load('channelList') || '';
    elements.clickCountInput.value = LocalStorageManager.load('clickCount') || '1';
    elements.clickDataJsonTextarea.value = LocalStorageManager.load('clickDataJson') || '';
}

// ローカルストレージに保存
function saveToLocalStorage() {
    LocalStorageManager.save('token', elements.tokenInput.value);
    LocalStorageManager.save('guildId', elements.guildIdInput.value);
    LocalStorageManager.save('commandName', elements.commandNameInput.value);
    LocalStorageManager.save('includeVoice', elements.includeVoiceToggle.checked);
    LocalStorageManager.save('channelList', elements.channelListTextarea.value);
    LocalStorageManager.save('clickCount', elements.clickCountInput.value);
    LocalStorageManager.save('clickDataJson', elements.clickDataJsonTextarea.value);
}

// ローカルストレージをクリア
function clearLocalStorage() {
    LocalStorageManager.clear();
}

// ページ読み込み時にローカルストレージから復元
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupTokenToggle();
});

// トークン表示切替ボタン設定
function setupTokenToggle() {
    const toggleBtn = document.getElementById('toggleTokenBtn');
    const tokenField = elements.tokenInput;
    const iconSpan = document.getElementById('tokenMaskIcon');
    if (toggleBtn && tokenField && iconSpan) {
        toggleBtn.addEventListener('click', () => {
            if (tokenField.type === 'password') {
                tokenField.type = 'text';
                iconSpan.innerHTML = '<svg id="icon-eye-off" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-6 0-10-8-10-8a18.4 18.4 0 0 1 5.06-5.94"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/><path d="M12 4c6 0 10 8 10 8a18.4 18.4 0 0 1-5.06 5.94"/></svg>';
            } else {
                tokenField.type = 'password';
                iconSpan.innerHTML = '<svg id="icon-eye" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>';
            }
        });
    }
}

// 入力変更時に自動保存
const inputElements = [elements.tokenInput, elements.guildIdInput, elements.commandNameInput, elements.channelListTextarea, elements.clickCountInput, elements.clickDataJsonTextarea];
inputElements.forEach(element => {
    element.addEventListener('input', saveToLocalStorage);
});
elements.includeVoiceToggle.addEventListener('change', saveToLocalStorage);

// カードの表示制御

// ログ追加関数
function addLog(message, type = 'info') {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `${timeStr} - ${message}`;
    if (type === 'error') entry.style.color = '#dc3545'; // 赤
    else if (type === 'success') entry.style.color = '#28a745'; // 緑
    else if (type === 'warning') entry.style.color = '#ffc107'; // オレンジ
    else if (type === 'info') entry.style.color = '#707070'; // 明るめのグレー
    elements.logDiv.appendChild(entry);
    elements.logDiv.scrollTop = elements.logDiv.scrollHeight;
}

// カード表示切り替え（カード非表示機能付き）
function showCard(card, shouldScroll = false) {
    card.classList.remove('card-hidden');

    if (shouldScroll) {
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function hideCard(card) {
    card.classList.add('card-hidden');
}

function resetDisplay() {
    hideCard(cards.commandSelectionCard);
    hideCard(cards.optionsCard);
    hideCard(cards.executionCard);
    showCard(cards.settingsCard, false);
}

// コマンド情報をメモリに保存
let commandsData = [];

// コマンド取得ハンドラー
async function handleFetchCommands() {
    const token = elements.tokenInput.value.trim();
    const commandName = elements.commandNameInput.value.trim();
    const includeVoice = elements.includeVoiceToggle.checked;
    const guildId = elements.guildIdInput.value.trim();

    if (!token) {
        addLog('トークンを入力してください。', 'error');
        return;
    }

    addLog('コマンド取得処理を開始...');
    elements.fetchCommandsBtn.disabled = true;
    elements.fetchCommandsBtn.innerHTML = '<div class="spinner"></div>取得中...';

    // ギルドIDがある場合、先に全テキストチャンネルを取得しておく（ログ順序を参照サイトに合わせるため）
    if (guildId) {
        try {
            const channelIds = await getFilteredChannelIds(token, guildId, includeVoice);
            // 改行区切りでテキストエリアにセット
            elements.channelListTextarea.value = channelIds.join('\n');
            addLog(`対象チャンネル ${channelIds.length} 件を設定しました。`, 'success');
        } catch (err) {
            addLog(`チャンネル取得エラー: ${err.message}`, 'error');
        }
    } else {
        // ギルドIDが未指定の場合
        addLog('サーバーIDが未指定のため、チャンネルリストは自動設定されません。', 'info');
    }

    addLog('ユーザーコマンドインデックスを取得中...');

    try {
        // サーバーを経由せずに直接取得
        const commands = await getCommands(token);
        
        // コマンド情報をメモリに保存
        commandsData = commands;
        
        const filteredCommands = commands.filter(cmd =>
            cmd.name.includes(commandName) &&
            cmd.application_name && cmd.application_name !== 'Unknown'
        );

        addLog(`${filteredCommands.length} 件のコマンドが見つかりました`, 'success');

        elements.commandSelect.innerHTML = '<option value="">-- 実行するコマンドを選択 --</option>';
        filteredCommands.forEach(cmd => {
            const option = document.createElement('option');
            option.value = cmd.id;
            const botName = cmd.application_name ? `（Bot：${cmd.application_name}）` : '';
            option.textContent = `/${cmd.name}${botName}`;
            elements.commandSelect.appendChild(option);
        });

        showCard(cards.commandSelectionCard, false);
    } catch (error) {
        addLog(`コマンド取得エラー: ${error.message}`, 'error');
    } finally {
        elements.fetchCommandsBtn.disabled = false;
        elements.fetchCommandsBtn.innerHTML = 'コマンドを取得';
        // reset stored click data JSON when fetching new commands
        elements.clickDataJsonTextarea.value = '';
        LocalStorageManager.save('clickDataJson', '');
    }
}

// コマンド取得
elements.fetchCommandsBtn.addEventListener('click', handleFetchCommands);

// コマンド選択変更ハンドラー
async function handleCommandSelect() {
    const cmdId = elements.commandSelect.value;
    
    // コマンドが未選択の場合はUIを非表示
    if (!cmdId) {
        hideCard(cards.optionsCard);
        hideCard(cards.executionCard);
        return;
    }

    try {
        // メモリからコマンド情報を取得
        const command = commandsData.find(cmd => cmd.id === cmdId);
        
        if (!command) {
            addLog('コマンドが見つかりません。', 'error');
            return;
        }

        // まずカードを表示してから内容を更新（アニメーションを滑らかに）
        showCard(cards.optionsCard, false);
        showCard(cards.executionCard, false);

        elements.optionsContainer.innerHTML = '';

        if (command.options && command.options.length > 0) {
            command.options.forEach(option => {
                const div = document.createElement('div');
                // show name with required/optional marker, description below
                const requiredText = option.required ? '必須' : '任意';
                div.innerHTML = `
                    <label class="form-label">
                        <span class="font-medium text-gray-200">${option.name} <span class="text-sm text-gray-400">(${requiredText})</span></span><br>
                        <span class="text-sm text-gray-400">${option.description}</span>
                    </label>
                    <input type="text" class="form-input option-input" data-name="${option.name}" data-type="${option.type}" placeholder="値を入力">
                `;
                elements.optionsContainer.appendChild(div);
            });
        } else {
            // 引数がない場合は引数セクションにメッセージを表示
            const div = document.createElement('p');
            div.style.color = '#b9bbbe';
            div.style.lineHeight = '1.6';
            div.textContent = 'このコマンド（またはサブコマンド）に引数はありません。';
            elements.optionsContainer.appendChild(div);
        }

        // removed redundant log

    } catch (error) {
        addLog(`コマンド詳細取得エラー: ${error.message}`, 'error');
    }
}

// コマンド選択変更
elements.commandSelect.addEventListener('change', handleCommandSelect);

// 実行ボタンハンドラー
async function handleExecute() {
    const token = elements.tokenInput.value.trim();
    const guildId = elements.guildIdInput.value.trim();
    const cmdId = elements.commandSelect.value;
    const channels = elements.channelListTextarea.value
        .trim()
        .split(/[\s,]+/)   // カンマまたは改行/空白で分割
        .map(c => c.trim())
        .filter(c => c);
    const clickCount = parseInt(elements.clickCountInput.value) || 1;
    let clickData = [];

    try {
        clickData = JSON.parse(elements.clickDataJsonTextarea.value.trim() || '[]');
        if (clickData.length > 0) {
            addLog(`再利用データ ${clickData.length} 件が入力されています。`, 'info');
        }
    } catch (e) {
        addLog('JSONデータが無効です。', 'error');
        return;
    }

    if (!token || !cmdId) {
        addLog('トークンとコマンドを選択してください。', 'error');
        return;
    }

    // メモリからコマンド情報を取得
    const command = commandsData.find(cmd => cmd.id === cmdId);
    if (!command) {
        addLog('コマンド情報が見つかりません。', 'error');
        return;
    }

    const appId = command.application_id;

    if (channels.length === 0 && guildId) {
        // 全テキストチャンネル取得
        try {
            const ids = await getFilteredChannelIds(token, guildId, elements.includeVoiceToggle.checked);
            channels.push(...ids);
            // テキストエリアも改行区切りにして更新
            elements.channelListTextarea.value = ids.join('\n');
            addLog(`対象チャンネル ${channels.length} 件を設定しました。`, 'success');
        } catch (error) {
            addLog(`チャンネル取得エラー: ${error.message}`, 'error');
            return;
        }
    } else if (channels.length === 0) {
        addLog('実行対象チャンネルID、またはサーバーIDを入力してください。', 'error');
        return;
    }

    elements.executeBtn.disabled = true;
    elements.executeBtn.innerHTML = '<div class="spinner"></div>実行中...';

    addLog(`実行開始: ${channels.length} チャンネル, ${clickCount} 回クリック`, 'info');
    addLog('WS: 接続中... 認証します', 'info');

    // WSを1回だけ開き、すべてのチャンネルを順次処理する
    const wsManager = new WebSocketManager(token, channels, clickCount, command, appId, guildId);
    wsManager.connect();
}

// 実行ボタン
elements.executeBtn.addEventListener('click', handleExecute);

// リセットボタンハンドラー
function handleReset() {
    // 入力値をクリア
    elements.tokenInput.value = '';
    elements.guildIdInput.value = '';
    elements.commandNameInput.value = '';
    elements.includeVoiceToggle.checked = false;
    elements.commandSelect.value = '';
    elements.optionsContainer.innerHTML = '';
    elements.channelListTextarea.value = '';
    elements.clickCountInput.value = '1';
    elements.clickDataJsonTextarea.value = '';
    elements.logDiv.innerHTML = '';

    // ローカルストレージをクリア
    clearLocalStorage();

    resetDisplay();
}

// リセットボタン
elements.resetBtn.addEventListener('click', handleReset);

// ログコピーハンドラー
async function handleCopyLog() {
    const text = Array.from(elements.logDiv.querySelectorAll('.log-entry')).map(el => el.textContent).join('\n');
    try {
        await navigator.clipboard.writeText(text);
        addLog('ログをコピーしました。', 'success');
    } catch (err) {
        addLog(`ログコピーに失敗しました: ${err.message}`, 'error');
    }
}

// ログコピー
if (elements.copyLogBtn) {
    elements.copyLogBtn.addEventListener('click', handleCopyLog);
}

// 汎用 POST リクエスト（429および一時エラー時リトライ）
async function postWithRetry(path, data, token, maxRetries = 5) {
    let attempt = 0;
    while (true) {
        try {
            const resp = await fetch(`${CONFIG.DISCORD_API}/${path}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(data)
            });
            if (resp.status === 429) {
                let wait = 1;
                try {
                    const obj = await resp.json();
                    wait = obj?.retry_after || wait;
                } catch {}
                addLog(`レートリミットに達しました。${wait}秒待機して再試行します。`, 'warning');
                await new Promise(r => setTimeout(r, wait * 1000));
                continue;
            }
            if (!resp.ok && attempt < maxRetries) {
                attempt++;
                addLog(`リクエスト失敗 HTTP ${resp.status}、再試行中 (${attempt}/${maxRetries})`, 'warning');
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }
            return resp;
        } catch (err) {
            if (attempt < maxRetries) {
                attempt++;
                addLog(`ネットワークエラー: ${err.message}、再試行中 (${attempt}/${maxRetries})`, 'warning');
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }
            throw err;
        }
    }
}

// メッセージ取得エンドポイント（直接取得）
async function getChannelMessages(token, channelId, limit = 5) {
    try {
        const response = await fetch(`${CONFIG.DISCORD_API}/channels/${channelId}/messages?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        addLog(`メッセージ取得エラー: ${error.message}`, 'error');
        return [];
    }
}

// WebSocketで複数のイベントをリッスン
// ボタン情報を抽出（ボタン複数対応）
function extractButtonInfo(message) {
    const results = [];
    if (!message.components || message.components.length === 0) {
        return results;
    }

    for (const component of message.components) {
        if (!component || component.type !== 1 || !Array.isArray(component.components)) continue;

        for (const subComponent of component.components) {
            if (!subComponent || subComponent.type !== 2) continue;

            results.push({
                customId: subComponent.custom_id,
                messageId: message.id,
                channelId: message.channel_id,
                label: subComponent.label,
                flags: message.flags || 0,
                guildId: message.guild_id || null
            });
        }
    }

    return results;
}

// 初期表示（設定カードのみ表示、他は非表示）
hideCard(cards.commandSelectionCard);
hideCard(cards.optionsCard);
hideCard(cards.executionCard);
showCard(cards.settingsCard, false);

// WebSocket管理クラス
class WebSocketManager {
    constructor(token, channels, clickCount, command, appId, guildId) {
        this.token = token;
        this.channels = channels;
        this.clickCount = clickCount;
        this.command = command;
        this.appId = appId;
        this.guildId = guildId;
        this.ws = null;
        this.sessionId = null;
        this.heartbeatInterval = null;
        this.commandsCompleted = 0;
        this.commandsCompletedChannels = new Set();
        this.clickData = [];
        this.detectedChannels = new Set(); // どのチャンネルからボタンを検出したか
        this.buttonProcessedSet = new Set(); // チャンネル+メッセージ+カスタムID の重複排除
        this.commandExecutedTime = 0; // コマンド実行の開始時刻
    }

    connect() {
        this.ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onclose = this.onClose.bind(this);
    }

    onOpen() {
        const identifyPayload = {
            op: 2,
            d: {
                token: this.token,
                api_code_version: 1,
                capabilities: 30719,
                properties: {
                    os: 'Android',
                    browser: 'Discord Android',
                    device: 'Android',
                    system_locale: 'en-US'
                },
                presence: { status: 'online', since: 0, activities: [], afk: false },
                user_guild_settings_version: 1,
                user_settings_version: 1
            }
        };
        this.ws.send(JSON.stringify(identifyPayload));
    }

    async onMessage(event) {
        const data = JSON.parse(event.data);
        if (data.op === 10) {
            const hbInterval = data.d.heartbeat_interval;
            addLog(`WS: ハートビート間隔 ${hbInterval}ms 受信`, 'info');

            const sendHeartbeat = () => {
                try {
                    this.ws.send(JSON.stringify({ op: 1, d: null }));
                } catch (err) {
                    addLog(`Heartbeat送信失敗: ${err.message || err}`, 'error');
                }
            };

            sendHeartbeat();
            if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = setInterval(sendHeartbeat, hbInterval);
        }

        if (data.op === 11) {
            // Heartbeat ACK受信（特別処理なし）
        }

        if (data.op === 0 && data.t) {
            console.log(`[WebSocket Event] ${data.t}`, data.d);
        }

        if (data.t === 'READY') {
            this.sessionId = data.d.session_id;
            addLog('WS: 認証成功 (READY)', 'success');
            addLog(`セッションID取得成功: ${this.sessionId}`, 'success');
            await this.startPhase1();
        }

        if (data.t === 'MESSAGE_CREATE' || data.t === 'MESSAGE_UPDATE') {
            await this.handleMessageCreate(data.d);
        }
    }
    async waitForButtons() {
        const waitTime = 5000; // 5秒待機
        const elapsed = Date.now() - this.commandExecutedTime;
        const remainingWait = Math.max(0, waitTime - elapsed);
        
        if (remainingWait > 0) {
            addLog(`遅れてくるボタンを待機中... (${remainingWait}ms)`, 'info');
            await new Promise(resolve => setTimeout(resolve, remainingWait));
        }
        
        addLog(`ボタン待機完了。検出されたチャンネル数: ${this.detectedChannels.size}/${this.channels.length}`, 'info');
    }
    async startPhase1() {
        addLog(`フェーズ1: ${this.channels.length} チャンネルでコマンドを順次実行します...`, 'info');
        
        // コマンド実行時刻を記録
        this.commandExecutedTime = Date.now();
        addLog(`コマンド実行開始時刻: ${new Date(this.commandExecutedTime).toISOString()}`, 'info');
        
        for (const channelId of this.channels) {
            addLog(`[${channelId}] コマンド送信中...`, 'info');
            const options = Array.from(document.querySelectorAll('.option-input')).map(input => ({
                name: input.dataset.name,
                value: input.value.trim(),
                type: parseInt(input.dataset.type)
            })).filter(opt => opt.value);
            const nonce = Date.now().toString();
            const payload = {
                type: 2,
                application_id: this.appId,
                channel_id: channelId,
                session_id: this.sessionId,
                nonce: nonce,
                data: {
                    id: this.command.id,
                    name: this.command.name,
                    version: this.command.version,
                    options: options
                }
            };
            if (typeof this.guildId === 'string' && this.guildId) payload.guild_id = this.guildId;
            try {
                const response = await executeCommand(this.token, payload);
                if (response.ok) {
                    addLog(`[${channelId}] コマンド送信完了 (nonce: ${nonce})`, 'success');
                } else {
                    addLog(`[${channelId}] コマンド送信失敗: HTTP ${response.status}`, 'error');
                }
            } catch (e) {
                addLog(`[${channelId}] コマンド送信例外: ${e.message}`, 'error');
            }
        }
        addLog('フェーズ1終了。ボタン情報を受信待ち...', 'info');
    }

    async handleMessageCreate(msg) {
        if (!msg.author || msg.author.id !== this.appId) {
            return;
        }

        if (!this.channels.includes(msg.channel_id)) {
            return;
        }

        // ✅ コマンドで判定：interaction_metadata から指定されたコマンドの結果か確認
        const isTargetCommand = msg.interaction_metadata && msg.interaction_metadata.name === this.command.name;
        if (!isTargetCommand) {
            return;
        }

        addLog(`[${msg.channel_id}] コマンド応答メッセージ受信。`, 'info');
        const buttons = extractButtonInfo(msg);
        if (!buttons || buttons.length === 0) {
            return;
        }

        let added = false;
        for (const buttonInfo of buttons) {
            // 重複排除キーを生成
            const dedupeKey = `${msg.channel_id}:${msg.id}:${buttonInfo.customId}`;
            if (this.buttonProcessedSet.has(dedupeKey)) {
                addLog(`[${msg.channel_id}] ボタン重複スキップ: ${dedupeKey}`, 'info');
                continue;
            }
            this.buttonProcessedSet.add(dedupeKey);

            const exists = this.clickData.some(info => info.channelId === msg.channel_id && info.customId === buttonInfo.customId);
            if (exists) continue;

            const label = buttonInfo.label || buttonInfo.customId;
            addLog(`[${msg.channel_id}] ボタン "${label}" をクリックリストに追加。`, 'success');
            this.clickData.push({
                channelId: msg.channel_id,
                messageId: buttonInfo.messageId,
                customId: buttonInfo.customId,
                description: label,
                flags: buttonInfo.flags || 0
            });
            this.detectedChannels.add(msg.channel_id);
            added = true;
        }

        if (!added) {
            return;
        }

        elements.clickDataJsonTextarea.value = JSON.stringify(this.clickData, null, 2);

        if (!this.commandsCompletedChannels.has(msg.channel_id)) {
            this.commandsCompletedChannels.add(msg.channel_id);
            this.commandsCompleted = this.commandsCompletedChannels.size;
        }

        // ✅ 改良: 期待チャンネル数に達するまで待機
        if (this.detectedChannels.size >= this.channels.length) {
            addLog(`全チャンネルからボタン検出完了: ${this.detectedChannels.size}/${this.channels.length}`, 'success');
            await this.startPhase2();
        }
    }

    async waitForButtons() {
        const waitTime = 5000; // 5秒待機
        const elapsed = Date.now() - this.commandExecutedTime;
        const remainingWait = Math.max(0, waitTime - elapsed);
        
        if (remainingWait > 0) {
            addLog(`遅れてくるボタンを待機中... (${remainingWait}ms)`, 'info');
            await new Promise(resolve => setTimeout(resolve, remainingWait));
        }
        
        addLog(`ボタン待機完了。検出されたチャンネル数: ${this.detectedChannels.size}/${this.channels.length}`, 'info');
    }

    async startPhase2() {
        addLog(`フェーズ2: ${this.clickData.length} 個のボタンをそれぞれ ${this.clickCount} 回、ラウンドロビン方式でクリックします...`, 'info');
        const disabledButtons = new Set();
        for (let round = 0; round < this.clickCount; round++) {
            for (let idx = 0; idx < this.clickData.length; idx++) {
                const info = this.clickData[idx];
                if (disabledButtons.has(info.customId)) {
                    addLog(`[${info.channelId}] クリックラウンド ${round+1}/${this.clickCount} ボタン "${info.description}" は無効なのでスキップ`, 'warning');
                    continue;
                }
                const clickPayload = {
                    type: 3,
                    channel_id: info.channelId,
                    message_id: info.messageId,
                    application_id: this.appId,
                    session_id: this.sessionId,
                    nonce: `${Date.now()}-click-${round}-${idx}`,
                    data: {
                        component_type: 2,
                        custom_id: info.customId
                    }
                };
                if (typeof this.guildId === 'string' && this.guildId) clickPayload.guild_id = this.guildId;
                if (info.flags & 64) clickPayload.message_flags = 64;
                addLog(`[${info.channelId}] ボタン "${info.description}" を ラウンド${round+1} にクリックします...`, 'info');
                const clickResponse = await clickButton(this.token, clickPayload);
                if (clickResponse.ok) {
                    addLog(`[${info.channelId}] ボタンクリック ラウンド${round+1} 成功`, 'success');
                } else {
                    addLog(`[${info.channelId}] ボタンクリック ラウンド${round+1} 失敗: ${clickResponse.status}`, 'error');
                    if (clickResponse.status === 400) {
                        disabledButtons.add(info.customId);
                        addLog(`ボタン "${info.description}" を無効リストに追加`, 'warning');
                    }
                }
            }
        }
        addLog('全てのラウンドロビンクリック処理が完了しました。', 'info');
        addLog('全チャンネルの実行が完了しました。', 'info');
        this.ws.close();
        elements.executeBtn.disabled = false;
        elements.executeBtn.innerHTML = '全チャンネルで実行';
    }

    onError(error) {
        console.error('WebSocket error:', error);
        clearInterval(this.heartbeatInterval);
        addLog('WSエラー発生', 'error');
        elements.executeBtn.disabled = false;
        elements.executeBtn.innerHTML = '全チャンネルで実行';
    }

    onClose(event) {
        addLog(`WS: 接続終了 (Code: ${event.code})`, 'info');
        clearInterval(this.heartbeatInterval);
    }
}

// コマンド取得関数
async function getCommands(token) {
    try {
        const response = await fetch(`${CONFIG.DISCORD_API}/users/@me/application-command-index`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        console.log('API Response structure:', JSON.stringify(Object.keys(data), null, 2));
        console.log('Applications:', data.applications);
        console.log('First command:', data.application_commands?.[0]);

        // レスポンスから application_commands を抽出し, applications 情報をマージ
        const commands = data.application_commands || [];
        const applications = data.applications || [];

        // applications を id ベースのマップに変換
        const appMap = {};
        applications.forEach(app => {
            appMap[app.id] = app;
        });

        // 各コマンドにアプリケーション名を追加
        const enrichedCommands = commands.map(cmd => {
            const app = appMap[cmd.application_id];
            return {
                ...cmd,
                application_name: app?.name || 'Unknown'
            };
        });

        return enrichedCommands;
    } catch (error) {
        console.error('Error fetching commands:', error);
        throw error;
    }
}

// コマンド詳細取得関数
async function getCommandDetail(token, guildId, cmdId) {
    try {
        const response = await fetch(`${CONFIG.DISCORD_API}/guilds/${guildId}/application-commands/${cmdId}`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error('Error fetching command detail:', error);
        throw error;
    }
}

// チャンネル取得関数
async function getChannels(token, guildId) {
    try {
        // fetch user ID first
        const meResp = await fetch(`${CONFIG.DISCORD_API}/users/@me`, { headers: { 'Authorization': token } });
        if (!meResp.ok) throw new Error(`HTTP ${meResp.status}`);
        const meData = await meResp.json();
        const userId = meData.id;

        // fetch guild member to know roles
        const memberResp = await fetch(`${CONFIG.DISCORD_API}/guilds/${guildId}/members/${userId}`, {
            headers: { 'Authorization': token }
        });
        if (!memberResp.ok) throw new Error(`HTTP ${memberResp.status}`);
        const memberData = await memberResp.json();
        const memberRoles = memberData.roles || [];

        // fetch all roles for permissions
        const rolesResp = await fetch(`${CONFIG.DISCORD_API}/guilds/${guildId}/roles`, {
            headers: { 'Authorization': token }
        });
        if (!rolesResp.ok) throw new Error(`HTTP ${rolesResp.status}`);
        const rolesList = await rolesResp.json();
        const rolesMap = {};
        rolesList.forEach(r => { rolesMap[r.id] = BigInt(r.permissions); });
        // make sure @everyone role included
        if (!rolesMap[guildId] && rolesList.length) {
            // sometimes everyone role id == guildId
            const everyone = rolesList.find(r => r.id === guildId);
            if (everyone) rolesMap[guildId] = BigInt(everyone.permissions);
        }

        // fetch channels
        const chanResp = await fetch(`${CONFIG.DISCORD_API}/guilds/${guildId}/channels`, {
            headers: { 'Authorization': token }
        });
        if (!chanResp.ok) throw new Error(`HTTP ${chanResp.status}`);
        const allChannels = await chanResp.json();

        // permission constants
        const PERM_VIEW = 0x400n;
        const PERM_SEND = 0x800n;
        // const PERM_USE_APPS = 0x40000n; // もう使用しない
        // discord.js-infer で調べた最新の値
        const PERM_USE_EXTERNAL = 0x4000000000000n; // 1125899906842624n

        function applyOverwrite(perms, ow) {
            const allow = BigInt(ow.allow);
            const deny = BigInt(ow.deny);
            return (perms & ~deny) | allow;
        }

        function calculatePermsForChannel(channel) {
            let perms = BigInt(0);
            // base perms from roles
            perms |= rolesMap[guildId] || 0n;
            memberRoles.forEach(rid => {
                perms |= rolesMap[rid] || 0n;
            });
            // apply overwrites
            if (Array.isArray(channel.permission_overwrites)) {
                const ownEveryone = channel.permission_overwrites.find(o => o.id === guildId);
                if (ownEveryone) perms = applyOverwrite(perms, ownEveryone);
                memberRoles.forEach(rid => {
                    const ow = channel.permission_overwrites.find(o => o.id === rid);
                    if (ow) perms = applyOverwrite(perms, ow);
                });
                const ownMember = channel.permission_overwrites.find(o => o.id === userId);
                if (ownMember) perms = applyOverwrite(perms, ownMember);
            }
            return perms;
        }

        const filtered = allChannels.filter(ch => {
            const perms = calculatePermsForChannel(ch);
            return (perms & PERM_VIEW) && (perms & PERM_SEND) && (perms & PERM_USE_EXTERNAL);
        });

        return filtered;
    } catch (error) {
        console.error('Error fetching channels:', error);
        throw error;
    }
}

// フィルタリングされたチャンネルIDを取得する関数
async function getFilteredChannelIds(token, guildId, includeVoice) {
    const allChannels = await getChannels(token, guildId);
    const filteredChannels = allChannels.filter(c => 
        c.type === 0 || (includeVoice && c.type === 2)
    );
    return filteredChannels.map(c => c.id);
}

async function parseJsonSafe(response) {
    const text = await response.text();
    if (!text || text.trim().length === 0) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.warn('parseJsonSafe: invalid JSON body', error);
        return null;
    }
}

// コマンド実行関数
async function executeCommand(token, payload) {
    const response = await postWithRetry('interactions', payload, token);

    // レスポンス情報をログ出力(デバッグ用)
    console.log('Command response status:', response.status);
    const data = await parseJsonSafe(response);
    console.log('Command response data:', data);
    console.log('Command response headers:', response.headers);

    return {
        ok: response.ok,
        status: response.status,
        data: data,
        headers: response.headers
    };
}

// ボタンクリック関数
async function clickButton(token, payload) {
    const response = await postWithRetry('interactions', payload, token);

    const data = await parseJsonSafe(response);
    return {
        ok: response.ok,
        status: response.status,
        data: data
    };
}
