import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Bowen University DSS Complaint System</h1>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-balance">
                Welcome to the Bowen University DSS Complaint System
              </CardTitle>
              <CardDescription className="text-lg mt-4">
                Submit your complaints and concerns to help us improve campus life for everyone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild size="lg">
                <Link href="/complaint">Submit a Complaint</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Information Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">For Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Report issues related to water, electricity, noise, security, academics, facilities, and more. Your
                  feedback helps us maintain a better campus environment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">For Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access the admin dashboard to view, manage, and analyze complaints. Track trends and take action to
                  address student concerns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">© 2025 Bowen University DSS. All rights reserved. Designed by Software </p>
        </div>
      </footer>
    </div>
  )
}
