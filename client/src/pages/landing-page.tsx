import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  BookText, 
  Brain, 
  Microscope, 
  Medal, 
  Users, 
  Clock, 
  Globe, 
  Sparkles,
  GraduationCap,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  const dashboardPath = user ? `/dashboard/${user.role}` : "/auth";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="py-4 px-4 md:px-6 lg:px-8 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={32} className="text-primary" />
            <span className="text-2xl font-bold">EdMerge</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="font-medium hover:text-primary">Features</Link>
            <Link href="#" className="font-medium hover:text-primary">Roles</Link>
            <Link href="#" className="font-medium hover:text-primary">Testimonials</Link>
            <Link href="#" className="font-medium hover:text-primary">Pricing</Link>
            <Link href="/cv-generator" className="font-medium text-primary hover:text-primary/80">CV Generator</Link>
             <Link href="/scholarships" className="font-medium text-primary hover:text-primary/80">Scholarship</Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link href={dashboardPath}>
                  Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth?tab=register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Premium AI-Enhanced <span className="text-primary">E-Learning</span> Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              EdMerge by Afrimerge is the next-generation e-learning platform designed to revolutionize education globally through intelligent, adaptive learning technologies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth?tab=register">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            
            <div className="mt-6 bg-primary/10 border border-primary/30 p-4 rounded-lg shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rotate-45 bg-primary/10 rounded-full"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-2">
                  <BookText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    New! <span className="text-primary font-semibold">AI CV Generator</span>
                    <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">Premium</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">Professional CVs with 35+ templates for just $1/₦1000</p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/cv-generator">Try Now</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-xl p-8 text-white">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">EdMerge Platform</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span>AI Tutor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookText className="h-5 w-5" />
                    <span>Premium Courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    <span>Expert Mentoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Microscope className="h-5 w-5" />
                    <span>Research Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Microscope className="h-5 w-5" />
                    <span>Scholarship Hub</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookText className="h-5 w-5" />
                    <span>Career Development</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              EdMerge integrates AI, mentorship, global networking, career guidance, job opportunities, and community-driven learning like no platform before it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 border shadow-sm">
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">AI-Enhanced Learning</h3>
              <p className="text-muted-foreground">
                Get personalized assistance with our advanced AI tutor powered by the Gemini API.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border shadow-sm">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Scholarship Matching</h3>
              <p className="text-muted-foreground">
                Dedicated AI scholarship Matcher for students, tutors, mentors, and researchers Based on thier Certification.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border shadow-sm">
              <Medal className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Premium Content</h3>
              <p className="text-muted-foreground">
                High-quality courses and materials designed by industry professionals.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border shadow-sm">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Real-Time Mentoring</h3>
              <p className="text-muted-foreground">
                Connect with mentors for personalized guidance and support.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border shadow-sm">
              <Globe className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Global Accessibility</h3>
              <p className="text-muted-foreground">
                Learn from anywhere with our platform optimized for all devices.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border shadow-sm">
              <BookText className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Integrated Payments</h3>
              <p className="text-muted-foreground">
                Secure payment processing with Flutterwave for course purchases and withdrawals.
              </p>
            </div>
            <div className="bg-primary/10 rounded-lg p-6 border shadow-sm border-primary/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              <div className="relative z-10">
                <BookText className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">AI CV Generator</h3>
                <p className="text-muted-foreground">
                  Create professional CVs with AI assistance for just $1/₦1000 - premium templates included.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/cv-generator">Try Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles section */}
      <section id="roles" className="py-20 px-4 md:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Platform Roles</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              EdMerge accommodates various roles with dedicated functionality for each user type.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg overflow-hidden shadow-sm border">
              <div className="h-2 bg-blue-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  Students
                </h3>
                <p className="text-muted-foreground mb-4">
                  Access courses, track progress, and get personalized AI assistance.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Primary, secondary, tertiary, or individual levels
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Personalized dashboards for each level
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    AI tutor for homework help
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-background rounded-lg overflow-hidden shadow-sm border">
              <div className="h-2 bg-green-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <BookText className="h-5 w-5 text-green-500" />
                  Tutors
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create and manage courses, track student progress, and receive payments.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Upload real courses and materials
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Set courses as free or paid
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Withdraw real money via Flutterwave
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-background rounded-lg overflow-hidden shadow-sm border">
              <div className="h-2 bg-purple-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Mentors
                </h3>
                <p className="text-muted-foreground mb-4">
                  Provide one-on-one guidance to students and specialized support.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    Schedule mentoring sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    Track mentee progress
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    Provide personalized advice
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-background rounded-lg overflow-hidden shadow-sm border">
              <div className="h-2 bg-amber-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-amber-500" />
                  Researchers
                </h3>
                <p className="text-muted-foreground mb-4">
                  Conduct and publish research projects, collaborate with others.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Create research projects
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Publish findings and papers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Collaborate with other researchers
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-background rounded-lg overflow-hidden shadow-sm border">
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Learning?</h2>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Join EdMerge today and experience the most advanced, feature-rich e-learning platform with personalized, adaptive learning tailored to your needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth?tab=register">
                Create Account <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 lg:px-8 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">EdMerge</h3>
              <ul className="space-y-2">
                <li><Link href="https://afrimergetech.com/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Our Team</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="https://afrimergetech.com/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Community</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Webinars</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">GDPR</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Twitter</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Facebook</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">LinkedIn</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Instagram</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} EdMerge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}