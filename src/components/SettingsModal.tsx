import React, { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { getCompendiumStats, hasConvenience } from '../game/data';
import { decodeSaveFromText, encodeSaveToText } from '../game/saveCodec';
import { EventChoiceMode, SaveState } from '../game/types';

interface SettingsModalProps {
  save: SaveState;
  muted: boolean;
  bgmMuted: boolean;
  onClose: () => void;
  onToggleMute: () => void;
  onToggleBgmMute: () => void;
  onChangeEventMode: (mode: EventChoiceMode) => void;
  onImportSave: (imported: SaveState) => void;
  onResetAllData: () => void;
  onReturnToTitle?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  save,
  muted,
  bgmMuted,
  onClose,
  onToggleMute,
  onToggleBgmMute,
  onChangeEventMode,
  onImportSave,
  onResetAllData,
  onReturnToTitle,
}) => {
  const exportedText = useMemo(() => encodeSaveToText(save), [save]);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<SaveState | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const compStats = useMemo(() => getCompendiumStats(save), [save]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.getElementById('export-save-textarea') as HTMLTextAreaElement | null;
      if (ta) {
        ta.focus();
        ta.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // User can manually copy the selected text
        }
      }
    }
  };

  const handleValidateImport = () => {
    setImportError(null);
    const result = decodeSaveFromText(importText);
    if (!result.ok) {
      setPendingImport(null);
      setImportError(result.error);
      return;
    }
    setPendingImport(result.save);
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    onImportSave(pendingImport);
    setPendingImport(null);
    setImportText('');
    onClose();
  };

  const handleConfirmResetAll = () => {
    onResetAllData();
    setConfirmReset(false);
    onClose();
  };

  const pendingCompPct = pendingImport
    ? getCompendiumStats(pendingImport).overallPct
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={onClose}
    >
      <div
        className="pixel-panel max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#2b3040] pb-3.5">
          <div>
            <h2 id="settings-modal-title" className="font-pixel text-xl text-slate-100">
              設定・セーブ管理
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-num">
              現在: 第{save.loopCount}周 · 出撃 {save.totalRuns}回 · 踏破 {save.totalClears}回 · 図鑑 {compStats.overallPct}%
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-slate-200 border border-[#3a4156] cursor-pointer whitespace-nowrap"
          >
            閉じる
          </button>
        </div>

        {/* Game Preferences */}
        <div className="pixel-slot p-4 space-y-3">
          <h3 className="font-pixel text-sm text-slate-200">ゲーム設定</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-between gap-2 bg-[#12151d] border border-[#2b3040] px-3 py-2">
              <span className="text-xs text-slate-300">全体サウンド</span>
              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3 py-1 text-xs font-bold cursor-pointer whitespace-nowrap ${
                  !muted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-[#252a38] hover:bg-[#31384a] text-slate-300'
                }`}
              >
                {muted ? 'OFF' : 'ON'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 bg-[#12151d] border border-[#2b3040] px-3 py-2">
              <span className="text-xs text-slate-300">BGM</span>
              <button
                type="button"
                onClick={onToggleBgmMute}
                disabled={muted}
                className={`px-3 py-1 text-xs font-bold whitespace-nowrap ${
                  muted
                    ? 'bg-[#1a1e29] text-slate-600 cursor-not-allowed'
                    : !bgmMuted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-[#252a38] hover:bg-[#31384a] text-slate-300 cursor-pointer'
                }`}
              >
                {muted || bgmMuted ? 'OFF' : 'ON'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 bg-[#12151d] border border-[#2b3040] px-3 py-2">
              <span className="text-xs text-slate-300">道中イベント</span>
              <div className="flex items-center gap-1">
                {(['MANUAL', 'AUTO'] as const).map((mode) => {
                  const locked = mode === 'AUTO' && !hasConvenience(save, 'conv_auto_event');
                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={locked}
                      title={locked ? 'スキルツリー「イベント自動判断」で解放' : undefined}
                      onClick={() => onChangeEventMode(mode)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
                        locked
                          ? 'bg-[#1a1e29] text-slate-600 cursor-not-allowed'
                          : save.eventChoiceMode === mode
                            ? 'bg-amber-500 text-slate-950 cursor-pointer'
                            : 'bg-[#252a38] text-slate-400 hover:text-white cursor-pointer'
                      }`}
                    >
                      {locked && <Lock className="w-2.5 h-2.5 shrink-0" />}
                      <span>{mode === 'MANUAL' ? '手動' : '自動'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {onReturnToTitle && (
            <div className="pt-2 border-t border-[#232836] flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                タイトル画面に戻ってデモやイベント回想を見ることもできます。
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReturnToTitle();
                }}
                className="px-3 py-1.5 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-amber-200 border border-[#3a4156] cursor-pointer whitespace-nowrap shrink-0"
              >
                タイトル画面へ戻る
              </button>
            </div>
          )}
        </div>

        {/* Cookie Clicker style Text Export */}
        <div className="pixel-slot p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-pixel text-sm text-slate-200">
                セーブデータの書き出し（文字列で保存）
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                この文字列をメモ帳などに控えておくと、いつでも冒険データを復元できます。
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copied ? 'コピーしました' : '文字列をコピー'}
            </button>
          </div>
          <textarea
            id="export-save-textarea"
            readOnly
            value={exportedText}
            onClick={(e) => e.currentTarget.select()}
            rows={3}
            className="w-full bg-[#0c0e14] border border-[#2b3040] p-2.5 text-[11px] font-mono text-amber-200/90 focus:outline-none focus:border-amber-400 break-all resize-none"
          />
        </div>

        {/* Cookie Clicker style Text Import */}
        <div className="pixel-slot p-4 space-y-2.5">
          <div>
            <h3 className="font-pixel text-sm text-slate-200">
              セーブデータの読み込み（文字列から復元）
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              書き出したセーブ文字列（DOTLABv2!...）を貼り付けて復元します。
            </p>
          </div>
          <textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportError(null);
              setPendingImport(null);
            }}
            placeholder="ここにセーブ文字列を貼り付けてください..."
            rows={3}
            className="w-full bg-[#0c0e14] border border-[#2b3040] p-2.5 text-[11px] font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-400 break-all resize-none"
          />
          {importError && (
            <div className="text-xs text-rose-400">{importError}</div>
          )}
          {pendingImport ? (
            <div className="bg-[#161e29] border border-sky-500/60 p-3 space-y-2">
              <div className="text-xs font-bold text-sky-300">
                このセーブデータで現在の記録を上書き復元しますか？
              </div>
              <div className="text-[11px] text-slate-300 font-num">
                第{pendingImport.loopCount}周 · 所持金 {pendingImport.gold.toLocaleString()}G · 踏破 {pendingImport.totalClears}回 · 図鑑 {pendingCompPct}%
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPendingImport(null)}
                  className="py-1.5 px-3 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-slate-200 cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="py-1.5 px-3 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer"
                >
                  上書きして復元
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleValidateImport}
                disabled={!importText.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:bg-[#252a38] disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
              >
                文字列を読み込む
              </button>
            </div>
          )}
        </div>

        {/* Full Data Reset */}
        <div className="pixel-slot p-4 border-rose-500/40 space-y-2.5">
          <div>
            <h3 className="font-pixel text-sm text-rose-300">全データの初期化</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              所持品・ゴールド・スキル・周回状況・冒険記録（図鑑）など、すべてのセーブデータを削除して1周目の最初からやり直します。
            </p>
          </div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 text-xs font-bold bg-rose-800 hover:bg-rose-700 text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              全データを初期化する
            </button>
          ) : (
            <div className="bg-[#231419] border border-rose-500/70 p-3 space-y-2.5">
              <div className="text-xs font-bold text-rose-200">
                本当にすべてのデータを初期化しますか？この操作は取り消せません。
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="py-1.5 px-3 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-slate-200 cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetAll}
                  className="py-1.5 px-3 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                >
                  完全に初期化する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
