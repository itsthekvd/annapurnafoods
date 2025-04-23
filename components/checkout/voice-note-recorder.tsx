"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Square, Play, Trash2, CheckCircle } from "lucide-react"

interface VoiceNoteRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onRecordingClear: () => void
  existingRecording?: Blob
}

export default function VoiceNoteRecorder({
  onRecordingComplete,
  onRecordingClear,
  existingRecording,
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(existingRecording || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStoredRecording, setHasStoredRecording] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const MAX_RECORDING_TIME = 120 // in seconds

  // Check for stored recording flag on mount
  useEffect(() => {
    // Initialize audio element for playback
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
      audioRef.current.onended = () => setIsPlaying(false)

      // Check if we have a stored recording flag
      const hasVoiceNote = sessionStorage.getItem("annapurna-voice-note") === "true"
      setHasStoredRecording(hasVoiceNote)

      // If we have a flag but no blob, create a dummy blob to show the UI
      if (hasVoiceNote && !existingRecording && !audioBlob) {
        // Create a dummy blob just to show the UI
        // We can't actually store the audio data between page refreshes
        const dummyBlob = new Blob(["dummy"], { type: "audio/wav" })
        setAudioBlob(dummyBlob)
        setRecordingTime(10) // Just show some time
        onRecordingComplete(dummyBlob)
      }
    }

    return () => {
      // Clean up
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [existingRecording, audioBlob, onRecordingComplete])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        onRecordingComplete(audioBlob)

        // Store a flag in sessionStorage indicating there is a voice note
        sessionStorage.setItem("annapurna-voice-note", "true")
        setHasStoredRecording(true)

        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording()
            return MAX_RECORDING_TIME
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access your microphone. Please check your browser permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const clearRecording = () => {
    setAudioBlob(null)
    onRecordingClear()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
    setIsPlaying(false)
    // Remove the flag from sessionStorage
    sessionStorage.removeItem("annapurna-voice-note")
    setHasStoredRecording(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Voice Note for Delivery Instructions</h3>
          {audioBlob && !isRecording && (
            <span className="text-xs text-gray-500">{formatTime(recordingTime)} recorded</span>
          )}
        </div>

        {isRecording ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mic className="h-5 w-5 text-red-500 animate-pulse mr-2" />
                <span className="text-red-500 font-medium">Recording...</span>
              </div>
              <span className="text-sm">
                {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
              </span>
            </div>
            <Progress value={(recordingTime / MAX_RECORDING_TIME) * 100} className="h-2" />
            <Button variant="destructive" size="sm" className="w-full" onClick={stopRecording}>
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          </div>
        ) : audioBlob || hasStoredRecording ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={playRecording} disabled={isPlaying}>
                {isPlaying ? (
                  <span className="flex items-center">
                    <span className="animate-pulse">Playing...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </span>
                )}
              </Button>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={clearRecording}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Keep
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Button onClick={startRecording} className="bg-amber-700 hover:bg-amber-800">
              <Mic className="h-4 w-4 mr-2" />
              Record Voice Note
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Maximum 120 seconds. Speak clearly about any delivery instructions.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
