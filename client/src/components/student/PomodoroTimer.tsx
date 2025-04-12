import { useState, useEffect, useRef } from "react";
import { Clock, Play, Pause, RefreshCw, Coffee, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const defaultDurations = {
  focus: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultDurations.focus);
  const [totalDuration, setTotalDuration] = useState(defaultDurations);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(4);
  const [volume, setVolume] = useState(70);
  const [timerProgress, setTimerProgress] = useState(100);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update progress bar
  useEffect(() => {
    const currentDuration = totalDuration[mode];
    const progress = (timeLeft / currentDuration) * 100;
    setTimerProgress(progress);
  }, [timeLeft, mode, totalDuration]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio("/sounds/bell.mp3");
    audioRef.current.volume = volume / 100;
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }

    // Stop the timer
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Show notification based on current mode
    const title = mode === "focus" ? "Focus session complete!" : "Break time is over!";
    const description = mode === "focus" 
      ? "Time for a well-deserved break." 
      : "Ready to focus again?";
      
    toast({
      title,
      description,
      variant: "default",
    });

    // Update state based on mode
    if (mode === "focus") {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      // Determine if it's time for a long break
      if (newCompletedPomodoros % pomodorosUntilLongBreak === 0) {
        setMode("longBreak");
        setTimeLeft(totalDuration.longBreak);
      } else {
        setMode("shortBreak");
        setTimeLeft(totalDuration.shortBreak);
      }
    } else {
      // After any break, go back to focus mode
      setMode("focus");
      setTimeLeft(totalDuration.focus);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalDuration[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(totalDuration[newMode]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDurationChange = (newDuration: number, currentMode: TimerMode) => {
    const newDurations = { ...totalDuration, [currentMode]: newDuration * 60 };
    setTotalDuration(newDurations);
    
    // Only update current timer if we're changing the current mode's duration
    if (currentMode === mode) {
      setTimeLeft(newDuration * 60);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pomodoro Focus Timer
        </CardTitle>
        <CardDescription>
          Stay productive with focused work sessions and scheduled breaks
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="timer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-4">
            <div className="flex justify-center gap-2 mb-4">
              <Button
                variant={mode === "focus" ? "default" : "outline"}
                size="sm"
                onClick={() => switchMode("focus")}
                className="flex gap-2 items-center"
              >
                <Brain className="h-4 w-4" />
                Focus
              </Button>
              <Button
                variant={mode === "shortBreak" ? "default" : "outline"}
                size="sm"
                onClick={() => switchMode("shortBreak")}
                className="flex gap-2 items-center"
              >
                <Coffee className="h-4 w-4" />
                Short Break
              </Button>
              <Button
                variant={mode === "longBreak" ? "default" : "outline"}
                size="sm"
                onClick={() => switchMode("longBreak")}
                className="flex gap-2 items-center"
              >
                <Coffee className="h-4 w-4" />
                Long Break
              </Button>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-6xl font-mono font-semibold mb-4">
                {formatTime(timeLeft)}
              </div>
              
              <Progress value={timerProgress} className="h-2 w-full mb-6" />
              
              <div className="flex gap-2">
                {!isRunning ? (
                  <Button onClick={startTimer} variant="outline" size="icon">
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} variant="outline" size="icon">
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                <Button onClick={resetTimer} variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                Completed pomodoros: {completedPomodoros}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Focus Duration (minutes)</h3>
                <Select 
                  defaultValue={String(totalDuration.focus / 60)}
                  onValueChange={(value) => handleDurationChange(parseInt(value), "focus")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="45">45</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Short Break (minutes)</h3>
                <Select 
                  defaultValue={String(totalDuration.shortBreak / 60)}
                  onValueChange={(value) => handleDurationChange(parseInt(value), "shortBreak")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select short break duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Long Break (minutes)</h3>
                <Select 
                  defaultValue={String(totalDuration.longBreak / 60)}
                  onValueChange={(value) => handleDurationChange(parseInt(value), "longBreak")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select long break duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Pomodoros until long break</h3>
                <Select 
                  defaultValue={String(pomodorosUntilLongBreak)}
                  onValueChange={(value) => setPomodorosUntilLongBreak(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of pomodoros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">Alert Volume</h3>
                  <span className="text-sm text-muted-foreground">{volume}%</span>
                </div>
                <Slider 
                  defaultValue={[volume]} 
                  max={100} 
                  step={1}
                  onValueChange={(values) => setVolume(values[0])}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        Tip: The Pomodoro Technique helps improve productivity and focus through timed work sessions and breaks.
      </CardFooter>
    </Card>
  );
}