'use client';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useReactMediaRecorder } from 'react-media-recorder';

interface Conversation {
  role: 'user' | 'ai';
  content: string;
}

const InterviewPage = () => {
  const [interviewType, setInterviewType] = useState<'personal' | 'technical'>('personal');
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [transcript, setTranscript] = useState('');
  const [userInput, setUserInput] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const synth = useRef<SpeechSynthesis | null>(null);
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  const recognition = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    startRecording: startMediaRecording,
    stopRecording: stopMediaRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({ 
    audio: true,
    onStop: (blobUrl, blob) => {
      handleAudioSubmit(blob);
    }
  });

  // Initialize speech synthesis and recognition
  useEffect(() => {
    synth.current = window.speechSynthesis;
    const loadVoices = () => {
      voices.current = synth.current?.getVoices() || [];
    };
    loadVoices();
    if (synth.current) {
      synth.current.onvoiceschanged = loadVoices;
    }

    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const interimTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(interimTranscript);
      };

      recognition.current.onend = () => {
        if (isRecording) {
          recognition.current.start();
        }
      };

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };
    } else {
      console.warn('Speech recognition not supported');
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [isRecording]);

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    
    try {
      setIsUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', resumeFile);
      console.log(userId , 'resume file', resumeFile);
      
      await axios.post('http://localhost:3001/api/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: { userId }
        
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const startInterview = async () => {
    try {
      setIsProcessing(true);
      const response = await axios.post('http://localhost:3001/api/start-interview', {
        userId,
        interviewType,
        hasResume: !!resumeFile
      });
      
      setInterviewId(response.data.interviewId);
      setConversation([{ role: 'ai', content: response.data.question }]);
      setIsInterviewing(true);
      speak(response.data.question);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserResponse = async (responseText: string) => {
    if (!responseText.trim() || !interviewId) return;
    
    try {
      setIsProcessing(true);
      
      setConversation(prev => [...prev, { role: 'user', content: responseText }]);
      setTranscript('');
      setUserInput('');
      
      const response = await axios.post('http://localhost:3001/api/continue-interview', {
        interviewId,
        userResponse: responseText
      });
      
      setConversation(response.data.conversation);
      speak(response.data.question);
    } catch (error) {
      console.error('Error continuing interview:', error);
      alert('Failed to continue interview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAudioSubmit = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('interviewId', interviewId || '');

      const response = await axios.post('http://localhost:3001/api/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { transcript: audioTranscript } = response.data;
      await handleUserResponse(audioTranscript);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Failed to process audio response');
    }
  };

  const speak = (text: string) => {
    if (!synth.current) return;
    
    synth.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const preferredVoice = voices.current.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Female')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    synth.current.speak(utterance);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopMediaRecording();
      if (recognition.current) {
        recognition.current.stop();
      }
      setIsRecording(false);
    } else {
      setTranscript('');
      startMediaRecording();
      if (recognition.current) {
        recognition.current.start();
      }
      setIsRecording(true);
    }
  };

  const handleManualSubmit = async () => {
    if (userInput.trim()) {
      await handleUserResponse(userInput);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">AI Interview Practice</h1>
        
        {!isInterviewing ? (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Interview Type</h2>
            <div className="flex gap-4 mb-8">
              <button
                className={`flex-1 py-3 px-6 rounded-lg transition-all ${interviewType === 'personal' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setInterviewType('personal')}
              >
                Personal Interview
              </button>
              <button
                className={`flex-1 py-3 px-6 rounded-lg transition-all ${interviewType === 'technical' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setInterviewType('technical')}
              >
                Technical Interview
              </button>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 mb-2 font-medium">Upload Resume (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Choose File
                </button>
                <button
                  onClick={handleResumeUpload}
                  disabled={!resumeFile || isUploadingResume}
                  className="py-2 px-4 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUploadingResume ? 'Uploading...' : 'Upload'}
                </button>
                {resumeFile && (
                  <span className="self-center ml-2 text-gray-600 truncate max-w-xs">
                    {resumeFile.name}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">Upload your resume for personalized technical questions</p>
            </div>

            <button
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50"
              onClick={startInterview}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Starting Interview...
                </span>
              ) : 'Start Interview'}
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="mb-6 space-y-4 max-h-96 overflow-y-auto pr-4">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-3/4 p-4 rounded-lg ${msg.role === 'ai' ? 'bg-blue-100 text-blue-900 rounded-bl-none' : 'bg-green-100 text-green-900 rounded-br-none'}`}
                  >
                    <strong className="block text-sm font-medium mb-1">
                      {msg.role === 'ai' ? 'Interviewer' : 'You'}
                    </strong>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              {transcript && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800">{transcript}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={toggleRecording}
                  disabled={isProcessing}
                  className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    isRecording 
                      ? 'bg-red-600 text-white shadow-inner animate-pulse' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      Stop Recording
                    </>
                  ) : (
                    'Record Response'
                  )}
                </button>
                
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Or type your response here..."
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isProcessing}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={isProcessing || !userInput.trim()}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsInterviewing(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;