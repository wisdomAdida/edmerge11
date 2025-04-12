import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PomodoroTimer } from "@/components/student/PomodoroTimer";
import { 
  Clock, 
  BookOpen, 
  ListTodo, 
  Radio, 
  Coffee,
  Brain,
  Droplet
} from "lucide-react";

export default function FocusTimerPage() {
  const [focusTab, setFocusTab] = useState("pomodoro");
  
  const focusTips = [
    {
      title: "Create a dedicated study space",
      description: "Find a quiet place free from distractions where you can focus on your studies."
    },
    {
      title: "Use the Pomodoro Technique",
      description: "Work in focused 25-minute intervals with short breaks in between."
    },
    {
      title: "Stay hydrated",
      description: "Keep a water bottle nearby to stay hydrated during study sessions."
    },
    {
      title: "Take regular breaks",
      description: "Step away from your screen every hour to refresh your mind."
    },
    {
      title: "Use a task list",
      description: "Break down your work into manageable tasks and check them off as you complete them."
    }
  ];
  
  const focusMusic = [
    {
      title: "Lo-fi beats",
      description: "Relaxed beats with minimal vocals - perfect for long study sessions."
    },
    {
      title: "Classical music",
      description: "Mozart, Bach and other classical composers can enhance concentration."
    },
    {
      title: "Nature sounds",
      description: "Rain, forest, and ocean sounds create a peaceful study environment."
    },
    {
      title: "Ambient music",
      description: "Atmospheric background music that doesn't distract."
    },
    {
      title: "White noise",
      description: "Consistent background noise to mask distracting sounds."
    }
  ];

  return (
    <DashboardLayout title="Study Focus Tools">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main focus timer */}
        <div className="md:col-span-2">
          <PomodoroTimer />
        </div>
        
        {/* Sidebar with focus resources */}
        <div className="space-y-6">
          {/* Focus tips section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Study Focus Tips
              </CardTitle>
              <CardDescription>
                Evidence-based techniques to improve your study sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {focusTips.map((tip, index) => (
                  <li key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      {index === 0 && <BookOpen className="h-4 w-4" />}
                      {index === 1 && <Clock className="h-4 w-4" />}
                      {index === 2 && <Droplet className="h-4 w-4" />}
                      {index === 3 && <Coffee className="h-4 w-4" />}
                      {index === 4 && <ListTodo className="h-4 w-4" />}
                      {tip.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Focus music section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Focus Music
              </CardTitle>
              <CardDescription>
                Background audio to enhance your concentration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {focusMusic.map((music, index) => (
                  <li key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <h3 className="font-medium text-sm">{music.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{music.description}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}