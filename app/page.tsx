import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Bowen DSS complaints Hub</h1>
              <nav className="hidden md:flex space-x-6">
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/login">
                <Button className="bg-blue-600 hover:bg-blue-700"> Admin Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">- SECURE & CONFIDENTIAL</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                The best way to voice your <span className="text-blue-600">concerns.</span>
              </h1>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Submit complaints about water, electricity, noise, security, academics, facilities, and more. Your
              feedback helps improve campus life for everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/complaint">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
                  Submit complaints
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/TO-1-s4cE0lydp5kYmNOuo7gSryjh7vLHpI.png"
              alt="Bowen University campus building"
              className="w-full h-auto max-w-lg mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        <footer className="mt-24 pt-16 border-t border-gray-200">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Bowen University - Department of Student Services</h3>
            <p className="text-gray-600">Committed to improving campus life through your feedback</p>
            <p className="text-sm text-gray-500">Designed by Software Engineering Team</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
