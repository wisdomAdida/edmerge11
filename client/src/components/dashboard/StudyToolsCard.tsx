import { Link } from "wouter";
import { Clock, Brain, Timer, BookText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StudyToolsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Study Tools
        </CardTitle>
        <CardDescription>
          Tools to help you learn more effectively
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Link href="/dashboard/student/focus-timer">
            <Button variant="outline" className="w-full justify-start px-3 py-2 h-auto gap-3">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Focus Timer</div>
                <div className="text-xs text-muted-foreground">
                  Boost productivity with Pomodoro technique
                </div>
              </div>
            </Button>
          </Link>
          
          <Link href="/dashboard/student/notes">
            <Button variant="outline" className="w-full justify-start px-3 py-2 h-auto gap-3">
              <BookText className="h-4 w-4 text-emerald-500" />
              <div className="text-left">
                <div className="font-medium">Study Notes</div>
                <div className="text-xs text-muted-foreground">
                  Access your class and revision notes
                </div>
              </div>
            </Button>
          </Link>
          
          <Link href="/dashboard/student/ai-tutor">
            <Button variant="outline" className="w-full justify-start px-3 py-2 h-auto gap-3">
              <Brain className="h-4 w-4 text-purple-500" />
              <div className="text-left">
                <div className="font-medium">AI Tutor</div>
                <div className="text-xs text-muted-foreground">
                  Get help with challenging topics
                </div>
              </div>
            </Button>
          </Link>
        </div>
        
        <div className="pt-2 pb-1">
          <p className="text-xs text-muted-foreground italic">
            "Using the right tools can improve your study efficiency by up to 30%"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}