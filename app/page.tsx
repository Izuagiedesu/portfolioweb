import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Directorate of Student Support Services</h1>
              <nav className="hidden md:flex space-x-6"></nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/login">
                <Button className="bg-blue-600 hover:bg-blue-700"> Admin Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">- SECURE & CONFIDENTIAL</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                The best way to voice your <span className="text-blue-600">concerns.</span>
              </h1>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Your voice matters. Share your concerns and help us create a better campus environment for all students.
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
            <div className="w-full h-96 rounded-lg shadow-lg overflow-hidden bg-gray-200">
              <img
                src="https://bowen.edu.ng/wp-content/uploads/2022/11/IMG_6020.jpg"
                alt="Bowen University Campus"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>

        <footer className="mt-32 pt-20 border-t border-gray-200">
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Bowen University Complaint System (BUCS)</h3>
            <p className="text-gray-600">Committed to improving campus life through your feedback</p>
            <p className="text-sm text-gray-500"> Designed by Software. </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
