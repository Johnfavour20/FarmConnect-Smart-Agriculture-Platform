
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import type { AgronomistChatMessage } from '../types';
import { SendIcon, LeafIcon, ImageIcon, QuestionMarkCircleIcon, XIcon, MicrophoneIcon } from './IconComponents';
import { ChatLoader } from './ChatLoader';

// Base64 encoding/decoding functions for audio
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// A simple markdown to HTML converter
const formatMessage = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(\r\n|\n|\r)/g, '<br />');

    if (html.includes('<li>')) {
      html = `<ul>${html.replace(/<br \/>/g, '')}</ul>`.replace(/<\/li><br \/><ul>/g, '</li></ul><ul>');
    }

    return { __html: html };
};

interface AgronomistChatProps {
  chatHistory: AgronomistChatMessage[];
  isChatLoading: boolean;
  onAsk: (prompt: string, image: File | null) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const AgronomistChat: React.FC<AgronomistChatProps> = ({ chatHistory, isChatLoading, onAsk }) => {
  const [chatMode, setChatMode] = useState<'text' | 'voice'>('text');
  
  // --- Text Chat State ---
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- Voice Chat State ---
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
  const [voiceChatHistory, setVoiceChatHistory] = useState<AgronomistChatMessage[]>([]);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext; sources: Set<AudioBufferSourceNode>; gainNode: GainNode; } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, voiceChatHistory]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
      setImageFile(null);
      setImagePreview(null);
      if(textFileInputRef.current) textFileInputRef.current.value = '';
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || imageFile) && !isChatLoading) {
      onAsk(input.trim(), imageFile);
      setInput('');
      removeImage();
    }
  };

  const stopVoiceChat = useCallback(() => {
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;

    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    processorRef.current?.disconnect();
    processorRef.current = null;

    audioContextRef.current?.input.close();
    audioContextRef.current?.output.close();
    audioContextRef.current = null;
    
    setVoiceStatus('idle');
  }, []);

  const startVoiceChat = useCallback(async () => {
    setVoiceStatus('connecting');
    setVoiceChatHistory([{ role: 'model', text: 'Connecting... Ask me anything when the button turns green.' }]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // FIX: Cast window to `any` to allow for `webkitAudioContext` in older browsers without TypeScript errors.
      const inputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const gainNode = outputAudioContext.createGain();
      gainNode.connect(outputAudioContext.destination);
      const sources = new Set<AudioBufferSourceNode>();
      audioContextRef.current = { input: inputAudioContext, output: outputAudioContext, sources, gainNode };
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setVoiceStatus('listening');
            setVoiceChatHistory([{ role: 'model', text: 'I\'m listening. How can I help you today?' }]);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromiseRef.current?.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.outputTranscription) {
                  currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
              } else if (message.serverContent?.inputTranscription) {
                  currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
              }
  
              if (message.serverContent?.turnComplete) {
                  const fullInput = currentInputTranscriptionRef.current.trim();
                  const fullOutput = currentOutputTranscriptionRef.current.trim();
                  
                  setVoiceChatHistory(prev => {
                      const newHistory = [...prev];
                      if(fullInput) newHistory.push({ role: 'user', text: fullInput });
                      if(fullOutput) newHistory.push({ role: 'model', text: fullOutput });
                      return newHistory;
                  });

                  currentInputTranscriptionRef.current = '';
                  currentOutputTranscriptionRef.current = '';
              }
  
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && audioContextRef.current) {
                  setVoiceStatus('speaking');
                  const { output: outputCtx, sources, gainNode } = audioContextRef.current;
                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                  const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                  const source = outputCtx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(gainNode);
                  source.addEventListener('ended', () => {
                    sources.delete(source);
                    if (sources.size === 0) {
                      setVoiceStatus('listening');
                    }
                  });
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  sources.add(source);
              }
          },
          onerror: (e: ErrorEvent) => {
            setVoiceStatus('error');
            setVoiceChatHistory(prev => [...prev, {role: 'model', text: 'Sorry, there was a connection error.'}])
            console.error(e);
          },
          onclose: (e: CloseEvent) => {
            setVoiceStatus('idle');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Zephyr'}}},
          systemInstruction: 'You are an expert AI agronomist providing helpful advice to a Nigerian farmer. Keep your answers clear, concise, and easy to understand.',
        },
      });

    } catch (err) {
      setVoiceStatus('error');
      setVoiceChatHistory([{ role: 'model', text: 'Could not access the microphone. Please check your browser permissions.' }]);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (chatMode === 'voice') {
      startVoiceChat();
    } else {
      stopVoiceChat();
    }
    return () => stopVoiceChat();
  }, [chatMode, startVoiceChat, stopVoiceChat]);

  const getVoiceButtonUI = () => {
    switch(voiceStatus) {
        case 'connecting':
            return { text: 'Connecting...', color: 'bg-yellow-500', pulse: true };
        case 'listening':
            return { text: 'Listening...', color: 'bg-green-600', pulse: true };
        case 'speaking':
            return { text: 'Speaking...', color: 'bg-blue-500', pulse: false };
        case 'error':
            return { text: 'Error', color: 'bg-red-500', pulse: false };
        default:
            return { text: 'Tap to Start', color: 'bg-slate-500', pulse: false };
    }
  };
  const voiceButtonUI = getVoiceButtonUI();

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
        <div className="p-3 border-b border-slate-200">
            <div className="inline-flex bg-slate-100 p-1 rounded-full">
                <button onClick={() => setChatMode('text')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${chatMode === 'text' ? 'bg-white shadow' : 'text-slate-600'}`}>Text Chat</button>
                <button onClick={() => setChatMode('voice')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${chatMode === 'voice' ? 'bg-white shadow' : 'text-slate-600'}`}>Voice Chat</button>
            </div>
        </div>
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMode === 'text' && chatHistory.length === 0 && (
                <div className="text-center text-slate-500 p-8 flex flex-col items-center">
                    <QuestionMarkCircleIcon className="h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="font-semibold text-lg text-slate-700">Ask the AI Agronomist</h3>
                    <p className="text-sm">Have a question? Ask with text or upload a photo.</p>
                </div>
            )}
            
            {(chatMode === 'text' ? chatHistory : voiceChatHistory).map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                         <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <LeafIcon className="w-5 h-5 text-green-600" />
                        </div>
                    )}
                    <div 
                        className={`max-w-md lg:max-w-lg p-3 rounded-2xl text-sm ${
                            msg.role === 'user' 
                                ? 'bg-green-600 text-white rounded-br-none' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}
                    >
                        {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="User upload" className="rounded-lg mb-2 max-h-48" />
                        )}
                        <div className="prose prose-sm" dangerouslySetInnerHTML={formatMessage(msg.text)} />
                    </div>
                </div>
            ))}
            {isChatLoading && chatMode === 'text' && (
                <div className="flex items-end gap-2 justify-start">
                     <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <LeafIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="max-w-xs p-3 rounded-2xl bg-slate-100 rounded-bl-none">
                       <ChatLoader />
                    </div>
                </div>
            )}
        </div>
        
        {chatMode === 'text' ? (
            <div className="p-3 border-t border-slate-200 bg-white rounded-b-2xl">
                {imagePreview && (
                    <div className="relative w-20 h-20 mb-2 p-1 border bg-slate-100 rounded-md">
                        <img src={imagePreview} alt="Preview" className="rounded object-cover w-full h-full" />
                        <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold" aria-label="Remove image"><XIcon className="h-4 w-4"/></button>
                    </div>
                )}
                <form onSubmit={handleTextSubmit} className="flex items-center gap-3">
                    <input type="file" ref={textFileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <button type="button" onClick={() => textFileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" aria-label="Add image">
                        <ImageIcon className="h-6 w-6" />
                    </button>
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." className="flex-1 w-full bg-slate-100 border-transparent focus:border-green-500 focus:ring-green-500 rounded-full py-2.5 px-4 text-sm" disabled={isChatLoading} />
                    <button type="submit" disabled={(!input.trim() && !imageFile) || isChatLoading} className="bg-green-600 text-white rounded-full p-2.5 hover:bg-green-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed" aria-label="Send message">
                        <SendIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        ) : (
             <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl flex flex-col items-center justify-center">
                <button
                    onClick={voiceStatus === 'error' || voiceStatus === 'idle' ? startVoiceChat : stopVoiceChat}
                    className={`relative w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-colors ${voiceButtonUI.color}`}
                >
                    <MicrophoneIcon className="h-8 w-8" />
                     {voiceButtonUI.pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>}
                </button>
                 <p className="text-sm text-slate-600 font-semibold mt-3">{voiceButtonUI.text}</p>
            </div>
        )}
    </div>
  );
};
