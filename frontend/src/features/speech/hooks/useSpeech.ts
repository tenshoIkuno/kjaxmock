import { useCallback, useEffect, useRef } from 'react';

import { fetchSpeechToken } from '@/features/speech/api/speech';
import { useSpeechStore } from '@/features/speech/store/speechStore';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export const useSpeech = () => {
  // --- アプリ内部: 状態保持（Zustand）と recognizer 参照 ---
  // SpeechRecognizer インスタンスを保持し、停止時にクリーンアップする
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const {
    status,
    showText,
    error,
    setStatus,
    appendshowText,
    setError,
    resetText,
    reset,
  } = useSpeechStore();

  // --- AzureSpeechService連携: 連続認識モードを止めて、SDKインスタンスを解放する ---
  const stopRecognition = useCallback(() => {
    const recognizer = recognizerRef.current;
    if (!recognizer) return;

    // 連続認識モードの停止API（startContinuousRecognitionAsync の対になる）
    // 完了/失敗いずれでも close してインスタンスを破棄し、状態を idle に戻す
    recognizer.stopContinuousRecognitionAsync(
      () => {
        recognizer.close();
        recognizerRef.current = null;
        setStatus('idle');
      },
      () => {
        recognizer.close();
        recognizerRef.current = null;
        setStatus('idle');
      },
    );
  }, [setStatus]);

  useEffect(() => {
    // このhookを使うコンポーネント（例: SpeechForm）が画面から外れるときの後片付け
    // - Azureの連続認識を止める
    // - ストアの状態を初期化する
    return () => {
      stopRecognition();
      reset();
    };
  }, []);

  // --- 「開始」ボタン押下で走るメインフロー ---
  // アプリ内部: 状態クリア＋authorizing へ
  // バックエンド: 短期トークン取得 (fetchSpeechToken)
  // Azure SDK: トークン＋マイク設定で初期化 → 認識器生成 → イベント登録 → 連続認識開始
  const startRecognition = useCallback(async () => {
    // エラーとテキストをクリアして、認可中ステータスをセット（Zustandで状態を持つ）
    setError(null);
    resetText();
    setStatus('authorizing');

    try {
      // バックエンド経由で Azure Speech のトークンを取得
      const tokenResponse = await fetchSpeechToken();

      // --- Azure SDK 初期化 (token/region をセット) ---
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
        tokenResponse.token,
        tokenResponse.region,
      );

      speechConfig.speechRecognitionLanguage = 'ja-JP';
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

      // --- Azure SDK: SpeechRecognizer を生成（マイク音声を Azure Speech Service に送る本体） ---
      // - speechConfig: バックエンドで取得した token/region をセット
      // - audioConfig: デフォルトマイク入力を指定
      // recognizerRef に保持しておき、stopRecognition から stopContinuousRecognitionAsync/close を呼べるようにする
      const recognizer = new SpeechSDK.SpeechRecognizer(
        speechConfig,
        audioConfig,
      );
      recognizerRef.current = recognizer;

      // --- Azure SDK イベント: 認識結果を受け取る ---
      recognizer.recognized = (_: unknown, event: any) => {
        // Azure Speech Service から返る詳細JSONをデバッグ出力
        // - RecognitionStatus: 認識の成否
        // - DisplayText: 句読点付きの表示用テキスト
        // - NBest: 候補配列（Confidence, Lexical, ITN, Display などを含む）
        const rawJson = event.result?.properties?.getProperty(
          SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult,
        );
        if (rawJson) {
          try {
            const parsed = JSON.parse(rawJson);
            console.log('Azure raw response (parsed)', parsed, {
              recognitionStatus: parsed.RecognitionStatus,
              displayText: parsed.DisplayText,
              nBestCount: Array.isArray(parsed.NBest) ? parsed.NBest.length : 0,
              nBestTop: Array.isArray(parsed.NBest)
                ? parsed.NBest[0]
                : undefined,
            });
          } catch (err) {
            console.log('Azure raw response (unparsed)', rawJson, err);
          }
        }

        if (event.result?.text) {
          appendshowText(event.result.text);
        }
      };

      // --- Azure SDK イベント: キャンセルやエラー時の処理 ---
      recognizer.canceled = (_: unknown, event: any) => {
        setError(event.errorDetails || '音声認識がキャンセルされました。');
        setStatus('idle');
      };

      recognizer.sessionStopped = () => {
        setStatus('idle');
      };

      // --- Azure SDK: 非同期で連続認識開始。成功でlistening、失敗ならエラー表示。---
      recognizer.startContinuousRecognitionAsync(
        () => setStatus('listening'),
        (err: string) => {
          setError(err || '音声認識の開始に失敗しました。');
          recognizer.close();
          recognizerRef.current = null;
          setStatus('idle');
        },
      );
    } catch (e) {
      // 例外時はエラーを表示してステータスを戻す
      setError(
        e instanceof Error ? e.message : '音声認識の開始に失敗しました。',
      );
      setStatus('idle');
    }
  }, [appendshowText, resetText, setError, setStatus]);

  const isAuthorizing = status === 'authorizing';
  const isListening = status === 'listening';

  // ボタン押下で開始/停止どちらを呼ぶか決めるだけの切替関数
  // - listening 中なら stopRecognition（停止）
  // - 停止中なら startRecognition（トークン取得→SDK初期化→開始）
  const handleToggle = useCallback(() => {
    if (isListening) {
      stopRecognition();
    } else {
      void startRecognition();
    }
  }, [isListening, startRecognition, stopRecognition]);

  return {
    status,
    showText,
    error,
    isAuthorizing,
    isListening,
    startRecognition,
    stopRecognition,
    handleToggle,
  };
};
