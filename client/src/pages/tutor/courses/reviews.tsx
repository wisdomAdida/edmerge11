import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Star, MessageCircle, Calendar } from "lucide-react";

export default function CourseReviewsPage() {
  const { user } = useAuth();
  
  // Placeholder data until we connect to real API
  const reviews = [
    {
      id: 1,
      studentName: "Alex Johnson",
      courseTitle: "Introduction to Programming",
      rating: 5,
      comment: "Excellent course! The instructor was very thorough and explained complex concepts in an easy-to-understand way.",
      date: "2025-03-15"
    },
    {
      id: 2,
      studentName: "Sarah Miller",
      courseTitle: "Advanced Mathematics",
      rating: 4,
      comment: "Great content and well-organized. Could use more practice exercises.",
      date: "2025-03-10"
    },
    {
      id: 3,
      studentName: "John Smith",
      courseTitle: "Introduction to Programming",
      rating: 5,
      comment: "This course has been instrumental in my learning journey. The real-world examples really helped solidify the concepts.",
      date: "2025-03-05"
    }
  ];
  
  return (
    <PageContainer title="Course Reviews" description="See what students are saying about your courses">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">4.7</CardTitle>
              <CardDescription className="text-center flex justify-center">
                <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                <Star className="fill-yellow-400 text-yellow-400 h-4 w-4 opacity-50" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">156</CardTitle>
              <CardDescription className="text-center">
                <MessageCircle className="inline h-4 w-4 mx-auto" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">Total Reviews</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">12</CardTitle>
              <CardDescription className="text-center">
                <Calendar className="inline h-4 w-4 mx-auto" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">New This Month</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>
              The most recent feedback from your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-5 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{review.studentName}</h4>
                      <p className="text-sm text-muted-foreground">{review.courseTitle}</p>
                    </div>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mb-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}