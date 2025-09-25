"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { getAdminSession, clearAdminSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, FileText, TrendingUp, Users, LogOut, AlertTriangle, Download, AlertCircle } from "lucide-react"
import { exportToCSV, exportCategoryToCSV, generateSummaryReport } from "@/lib/export"

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

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adminSession, setAdminSession] = useState<any>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Dashboard page mounted")
    const session = getAdminSession()
    console.log("[v0] Admin session:", session)
    if (session) {
      setAdminSession(session)
      fetchComplaints()
    } else {
      console.log("[v0] No admin session found")
      setIsLoading(false)
    }
  }, [])

  const fetchComplaints = async () => {
    try {
      console.log("[v0] Starting to fetch complaints")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log("[v0] Supabase URL available:", !!supabaseUrl)
      console.log("[v0] Supabase Anon Key available:", !!supabaseAnonKey)

      if (!supabaseUrl || !supabaseAnonKey) {
        console.log("[v0] Supabase environment variables not available - running in demo mode")
        setDataError("Database connection not available. Please configure Supabase integration to view complaint data.")
        setIsLoading(false)
        return
      }

      console.log("[v0] Creating Supabase client")
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      console.log("[v0] Querying complaints table")
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false })

      console.log("[v0] Query result - data:", data?.length || 0, "complaints")
      console.log("[v0] Query result - error:", error)

      if (error) throw error

      setComplaints(data || [])
      calculateCategoryStats(data || [])
      setDataError(null)
      console.log("[v0] Successfully loaded complaints data")
    } catch (error) {
      console.error("[v0] Error fetching complaints:", error)
      setDataError(`Failed to load complaint data: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      console.log("[v0] Setting loading to false")
      setIsLoading(false)
    }
  }

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
    exportToCSV(complaints, "all_complaints")
  }

  const handleExportCategory = (category: string) => {
    exportCategoryToCSV(complaints, category)
  }

  const handleExportSummary = () => {
    const report = generateSummaryReport(complaints)
    const blob = new Blob([report], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `complaint_summary_${new Date().toISOString().split("T")[0]}.txt`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isLoading) {
    console.log("[v0] Dashboard still loading...")
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  console.log("[v0] Dashboard rendering with data error:", dataError)
  console.log("[v0] Dashboard rendering with complaints count:", complaints.length)

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DSS Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {adminSession?.username}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {dataError && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-yellow-800">Database Connection Issue</CardTitle>
                </div>
                <CardDescription className="text-yellow-700">{dataError}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-600 text-sm mb-4">
                  The admin dashboard is working, but we need to set up the complaints table in the database.
                </p>
                <div className="bg-yellow-100 p-3 rounded-md">
                  <p className="text-yellow-800 text-sm font-medium">Next Steps:</p>
                  <ol className="text-yellow-700 text-sm mt-2 list-decimal list-inside space-y-1">
                    <li>Run the database setup scripts to create the complaints table</li>
                    <li>Ensure Supabase environment variables are properly configured</li>
                    <li>Refresh this page to load complaint data</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          {/* Show success message when no data error */}
          {!dataError && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                  <CardTitle className="text-green-800">Dashboard Active</CardTitle>
                </div>
                <CardDescription className="text-green-700">
                  Admin dashboard is successfully connected to the database and ready to manage complaints.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Export Data */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download complaint data for analysis and reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleExportAll} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Complaints (CSV)
                </Button>
                <Button onClick={handleExportSummary} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Summary Report
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
                  <CardTitle className="text-orange-800">Top Complaint of the Week</CardTitle>
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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="complaints">All Complaints</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Category Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Categories</CardTitle>
                  <CardDescription>Distribution of complaints by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryStats.map((stat) => (
                      <div key={stat.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{stat.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
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

            <TabsContent value="complaints" className="space-y-6">
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
                  <div className="space-y-4">
                    {filteredComplaints.map((complaint) => (
                      <div key={complaint.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{complaint.category}</Badge>
                            {complaint.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(complaint.created_at)}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{complaint.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{complaint.details}</p>
                        {!complaint.is_anonymous && (
                          <div className="text-xs text-gray-500">
                            Submitted by: {complaint.student_name} ({complaint.student_id})
                          </div>
                        )}
                      </div>
                    ))}
                    {filteredComplaints.length === 0 && (
                      <div className="text-center py-8 text-gray-500">No complaints found</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="flex justify-between items-center mt-2">
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
                      <div className="flex gap-2">
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
                    <div className="space-y-4">
                      {filteredComplaints.map((complaint) => (
                        <div key={complaint.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                            <span className="text-sm text-gray-500">{formatDate(complaint.created_at)}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{complaint.details}</p>
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
    </AdminGuard>
  )
}
