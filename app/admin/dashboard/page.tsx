"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { getAdminSession, clearAdminSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, FileText, TrendingUp, Users, LogOut, AlertTriangle, Download, CheckCircle } from "lucide-react"

const sampleComplaints = [
  {
    id: "1",
    category: "Academic Issues",
    title: "Unfair Grading in Mathematics Course",
    details:
      "The professor has been inconsistent with grading criteria and hasn't provided clear rubrics for assignments.",
    student_name: "John Smith",
    student_email: "john.smith@university.edu",
    student_id: "STU001",
    is_anonymous: false,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    category: "Facilities",
    title: "Broken Air Conditioning in Library",
    details: "The AC has been broken for over a week making it impossible to study in the library during hot weather.",
    student_name: null,
    student_email: null,
    student_id: null,
    is_anonymous: true,
    created_at: "2024-01-14T14:20:00Z",
  },
  {
    id: "3",
    category: "Administrative",
    title: "Delayed Financial Aid Processing",
    details: "My financial aid application has been pending for 3 months without any updates or communication.",
    student_name: "Sarah Johnson",
    student_email: "sarah.j@university.edu",
    student_id: "STU002",
    is_anonymous: false,
    created_at: "2024-01-13T09:15:00Z",
  },
  {
    id: "4",
    category: "Academic Issues",
    title: "Professor Frequently Cancels Classes",
    details: "Chemistry professor has cancelled 6 classes this semester without proper notice or makeup sessions.",
    student_name: null,
    student_email: null,
    student_id: null,
    is_anonymous: true,
    created_at: "2024-01-12T16:45:00Z",
  },
  {
    id: "5",
    category: "Facilities",
    title: "Parking Shortage on Campus",
    details: "There are not enough parking spaces for students, causing many to be late for classes.",
    student_name: "Mike Davis",
    student_email: "mike.davis@university.edu",
    student_id: "STU003",
    is_anonymous: false,
    created_at: "2024-01-11T08:00:00Z",
  },
]

interface Complaint {
  id: string
  category: string
  title: string
  details: string
  student_name: string | null
  student_email: string | null
  student_id: string | null
  is_anonymous: boolean
  created_at: string
}

interface CategoryStats {
  category: string
  count: number
  percentage: number
}

function DashboardContent() {
  const [complaints] = useState<Complaint[]>(sampleComplaints)
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adminSession, setAdminSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Dashboard content mounted on client")
    const session = getAdminSession()
    console.log("[v0] Client-side admin session:", session)

    if (session) {
      setAdminSession(session)
      calculateCategoryStats(sampleComplaints)
    }
    setIsLoading(false)
  }, [])

  const calculateCategoryStats = (complaintsData: Complaint[]) => {
    const categoryCount: { [key: string]: number } = {}

    complaintsData.forEach((complaint) => {
      categoryCount[complaint.category] = (categoryCount[complaint.category] || 0) + 1
    })

    const total = complaintsData.length
    const stats = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    setCategoryStats(stats)
  }

  const handleLogout = () => {
    clearAdminSession()
    router.push("/admin/login")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTopComplaint = () => {
    return categoryStats.length > 0 ? categoryStats[0] : null
  }

  const filteredComplaints = selectedCategory ? complaints.filter((c) => c.category === selectedCategory) : complaints

  const handleExportAll = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Category,Title,Details,Student Name,Student ID,Anonymous,Date\n" +
      complaints
        .map(
          (c) =>
            `"${c.id}","${c.category}","${c.title}","${c.details}","${c.student_name || "N/A"}","${c.student_id || "N/A"}","${c.is_anonymous}","${c.created_at}"`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "all_complaints.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportCategory = (category: string) => {
    const categoryComplaints = complaints.filter((c) => c.category === category)
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Category,Title,Details,Student Name,Student ID,Anonymous,Date\n" +
      categoryComplaints
        .map(
          (c) =>
            `"${c.id}","${c.category}","${c.title}","${c.details}","${c.student_name || "N/A"}","${c.student_id || "N/A"}","${c.is_anonymous}","${c.created_at}"`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${category.toLowerCase().replace(/\s+/g, "_")}_complaints.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DSS Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, Admin</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Dashboard Active</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Admin dashboard is successfully loaded with sample complaint data. Authentication working perfectly!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.length}</div>
              <p className="text-xs text-muted-foreground">All time submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryStats.length}</div>
              <p className="text-xs text-muted-foreground">Active complaint types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anonymous</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.filter((c) => c.is_anonymous).length}</div>
              <p className="text-xs text-muted-foreground">Anonymous submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Issue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTopComplaint()?.category || "N/A"}</div>
              <p className="text-xs text-muted-foreground">{getTopComplaint()?.count || 0} complaints</p>
            </CardContent>
          </Card>
        </div>

        {/* Export Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download complaint data for analysis and reporting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <Button onClick={handleExportAll} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All Complaints (CSV)
              </Button>
              {getTopComplaint() && (
                <Button onClick={() => handleExportCategory(getTopComplaint()?.category || "")} variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Export {getTopComplaint()?.category} Complaints
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Complaint of the Week */}
        {getTopComplaint() && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Top Complaint Category</CardTitle>
              </div>
              <CardDescription className="text-orange-700">
                This category needs immediate attention from the DSS team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-orange-800">{getTopComplaint()?.category}</h3>
                  <p className="text-orange-600">
                    {getTopComplaint()?.count} complaints ({getTopComplaint()?.percentage}% of total)
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedCategory(getTopComplaint()?.category || null)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="complaints">All Complaints</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Category Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Complaint Categories</CardTitle>
                <CardDescription>Distribution of complaints by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categoryStats.map((stat) => (
                    <div key={stat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{stat.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stat.percentage}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {stat.count} ({stat.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Complaints</CardTitle>
                    <CardDescription>Complete list of submitted complaints</CardDescription>
                  </div>
                  <Button onClick={handleExportAll} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredComplaints.map((complaint) => (
                    <div key={complaint.id} className="border rounded-lg p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{complaint.category}</Badge>
                          {complaint.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(complaint.created_at)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">{complaint.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{complaint.details}</p>
                      {!complaint.is_anonymous && (
                        <div className="text-xs text-gray-500">
                          Submitted by: {complaint.student_name} ({complaint.student_id})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryStats.map((stat) => (
                <Card
                  key={stat.category}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(stat.category)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {stat.category}
                      <Badge>{stat.count}</Badge>
                    </CardTitle>
                    <CardDescription>{stat.percentage}% of total complaints</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stat.percentage}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-gray-600">Click to view details</p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportCategory(stat.category)
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedCategory && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedCategory} Complaints</CardTitle>
                    <div className="flex gap-3">
                      <Button onClick={() => handleExportCategory(selectedCategory)} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)}>
                        Show All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredComplaints.map((complaint) => (
                      <div key={complaint.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                          <span className="text-sm text-gray-500">{formatDate(complaint.created_at)}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{complaint.details}</p>
                        {!complaint.is_anonymous && (
                          <div className="text-xs text-gray-500">
                            Submitted by: {complaint.student_name} ({complaint.student_id})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  )
}
