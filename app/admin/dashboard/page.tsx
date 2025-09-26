"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { getAdminSession, clearAdminSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface Complaint {
  id: string
  category: string
  title: string
  details: string
  intensity: string
  urgency: string
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
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [tableFilter, setTableFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminSession, setAdminSession] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(50) // Fixed page size
  const router = useRouter()

  const handleExportAll = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Category,Title,Details,Intensity,Urgency,Student Name,Student ID,Anonymous,Date\\n" +
      complaints
        .map(
          (c) =>
            `"${c.id}","${c.category}","${c.title}","${c.details}","${c.intensity}","${c.urgency}","${c.student_name || "N/A"}","${c.student_id || "N/A"}","${c.is_anonymous}","${c.created_at}"`,
        )
        .join("\\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "all_complaints.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportCategory = (category: string) => {
    const filteredComplaints = complaints.filter((c) => c.category === category)
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Category,Title,Details,Intensity,Urgency,Student Name,Student ID,Anonymous,Date\\n" +
      filteredComplaints
        .map(
          (c) =>
            `"${c.id}","${c.category}","${c.title}","${c.details}","${c.intensity}","${c.urgency}","${c.student_name || "N/A"}","${c.student_id || "N/A"}","${c.is_anonymous}","${c.created_at}"`,
        )
        .join("\\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${category.toLowerCase()}_complaints.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewTopComplaintDetails = () => {
    const topCategory = getTopComplaint()?.category
    if (topCategory) {
      setTableFilter(topCategory)
      // Switch to table tab to show filtered results
      const tableTab = document.querySelector('[data-value="table"]') as HTMLElement
      if (tableTab) {
        tableTab.click()
      }
    }
  }

  const fetchComplaints = async (page = 1, category = "all") => {
    try {
      console.log(`[v0] Fetching complaints from API - page ${page}, category: ${category}`)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(category !== "all" && { category }),
      })

      const response = await fetch(`/api/complaints?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Fetched complaints:", data)

      setComplaints(data.complaints || [])
      setCurrentPage(data.page || 1)
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.totalCount || 0)

      // Only calculate category stats from all complaints (not paginated)
      if (category === "all" && page === 1) {
        await fetchCategoryStats()
      }
      setError(null)
    } catch (error: any) {
      console.error("[v0] Failed to fetch complaints:", error)
      setError("Failed to load complaints from database. Please try refreshing the page.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategoryStats = async () => {
    try {
      const response = await fetch("/api/complaints?limit=1000", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        calculateCategoryStats(data.complaints || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch category stats:", error)
    }
  }

  useEffect(() => {
    console.log("[v0] Dashboard content mounted on client")
    const session = getAdminSession()
    console.log("[v0] Client-side admin session:", session)

    if (session) {
      setAdminSession(session)
      fetchComplaints(1, tableFilter)

      const interval = setInterval(() => {
        console.log("[v0] Auto-refreshing complaints data...")
        fetchComplaints(currentPage, tableFilter)
      }, 60000) // 60 seconds instead of 30

      return () => clearInterval(interval)
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (adminSession) {
      setCurrentPage(1)
      fetchComplaints(1, tableFilter)
    }
  }, [tableFilter])

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

  const calculateIntensityStats = (complaintsData: Complaint[]) => {
    const intensityCount: { [key: string]: number } = {}

    complaintsData.forEach((complaint) => {
      intensityCount[complaint.intensity] = (intensityCount[complaint.intensity] || 0) + 1
    })

    const total = complaintsData.length
    return Object.entries(intensityCount).map(([intensity, count]) => ({
      name: intensity,
      value: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
  }

  const calculateUrgencyStats = (complaintsData: Complaint[]) => {
    const urgencyCount: { [key: string]: number } = {}

    complaintsData.forEach((complaint) => {
      urgencyCount[complaint.urgency] = (urgencyCount[complaint.urgency] || 0) + 1
    })

    const total = complaintsData.length
    return Object.entries(urgencyCount).map(([urgency, count]) => ({
      name: urgency,
      value: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
  }

  const CHART_COLORS = {
    Low: "#10b981", // green
    Medium: "#f59e0b", // yellow
    High: "#f97316", // orange
    Critical: "#ef4444", // red
  }

  const handleLogout = () => {
    clearAdminSession()
    router.push("/admin/login")
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchComplaints(currentPage, tableFilter)
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

  const tableFilteredComplaints =
    tableFilter === "all" ? complaints : complaints.filter((c) => c.category === tableFilter)

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
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                🔄 Refresh Data
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                ← Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {error ? (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠</span>
                <CardTitle className="text-red-800">Database Connection Error</CardTitle>
              </div>
              <CardDescription className="text-red-700">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <CardTitle className="text-green-800">Connected to Supabase Database</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                Admin dashboard is successfully connected to the live database. Showing real complaint data!
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {complaints.length === 0 ? (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">ℹ</span>
                <CardTitle className="text-blue-800">No Complaints Yet</CardTitle>
              </div>
              <CardDescription className="text-blue-700">
                No complaints have been submitted yet. The dashboard will populate as students submit complaints through
                the form.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                  <span className="text-muted-foreground">📄</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCount}</div>
                  <p className="text-xs text-muted-foreground">All time submissions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Issue</CardTitle>
                  <span className="text-muted-foreground">📈</span>
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
                    ⬇ Export All Complaints (CSV)
                  </Button>
                  {getTopComplaint() && (
                    <Button onClick={() => handleExportCategory(getTopComplaint()?.category || "")} variant="outline">
                      📈 Export {getTopComplaint()?.category} Complaints
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
                    <span className="text-orange-600">⚠</span>
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
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="table">Complaints Table</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Category Statistics */}
            {categoryStats.length > 0 ? (
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Categories</CardTitle>
                  <CardDescription>No categories available yet</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Categories will appear here once complaints are submitted.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="table" className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Complaints Table</CardTitle>
                    <CardDescription>
                      Showing {complaints.length} of {totalCount} complaints (Page {currentPage} of {totalPages})
                    </CardDescription>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Select value={tableFilter} onValueChange={setTableFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categoryStats.map((stat) => (
                          <SelectItem key={stat.category} value={stat.category}>
                            {stat.category} ({stat.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        const csvContent =
                          "data:text/csv;charset=utf-8," +
                          "ID,Category,Title,Details,Intensity,Urgency,Student Name,Student ID,Anonymous,Date\\n" +
                          complaints
                            .map(
                              (c) =>
                                `"${c.id}","${c.category}","${c.title}","${c.details}","${c.intensity}","${c.urgency}","${c.student_name || "N/A"}","${c.student_id || "N/A"}","${c.is_anonymous}","${c.created_at}"`,
                            )
                            .join("\\n")

                        const encodedUri = encodeURI(csvContent)
                        const link = document.createElement("a")
                        link.setAttribute("href", encodedUri)
                        link.setAttribute(
                          "download",
                          `${tableFilter === "all" ? "all" : tableFilter.toLowerCase()}_complaints_page_${currentPage}.csv`,
                        )
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      ⬇ Export Current Page
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {complaints.length > 0 ? (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Intensity</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {complaints.map((complaint) => (
                            <TableRow key={complaint.id}>
                              <TableCell>
                                <Badge variant="secondary">{complaint.category}</Badge>
                              </TableCell>
                              <TableCell className="font-medium max-w-48 truncate">{complaint.title}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    complaint.intensity === "Critical"
                                      ? "destructive"
                                      : complaint.intensity === "High"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {complaint.intensity}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    complaint.urgency === "Critical"
                                      ? "destructive"
                                      : complaint.urgency === "High"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {complaint.urgency}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {complaint.is_anonymous ? (
                                  <Badge variant="outline">Anonymous</Badge>
                                ) : (
                                  <div className="text-sm">
                                    <div>{complaint.student_name}</div>
                                    <div className="text-gray-500">{complaint.student_id}</div>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {formatDate(complaint.created_at)}
                              </TableCell>
                              <TableCell className="max-w-64 truncate text-sm">{complaint.details}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-500">
                          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)}{" "}
                          of {totalCount} complaints
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchComplaints(currentPage - 1, tableFilter)}
                            disabled={currentPage <= 1}
                          >
                            ← Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                              return (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === currentPage ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => fetchComplaints(pageNum, tableFilter)}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchComplaints(currentPage + 1, tableFilter)}
                            disabled={currentPage >= totalPages}
                          >
                            Next →
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {tableFilter === "all"
                        ? "No complaints to display."
                        : `No complaints found for category: ${tableFilter}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            {complaints.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Intensity Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complaint Intensity Distribution</CardTitle>
                    <CardDescription>Breakdown of complaint intensity levels as percentage of total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        Low: {
                          label: "Low",
                          color: "#10b981",
                        },
                        Medium: {
                          label: "Medium",
                          color: "#f59e0b",
                        },
                        High: {
                          label: "High",
                          color: "#f97316",
                        },
                        Critical: {
                          label: "Critical",
                          color: "#ef4444",
                        },
                      }}
                      className="h-[300px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={calculateIntensityStats(complaints)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {calculateIntensityStats(complaints).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Urgency Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complaint Urgency Distribution</CardTitle>
                    <CardDescription>Breakdown of complaint urgency levels as percentage of total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        Low: {
                          label: "Low",
                          color: "#10b981",
                        },
                        Medium: {
                          label: "Medium",
                          color: "#f59e0b",
                        },
                        High: {
                          label: "High",
                          color: "#f97316",
                        },
                        Critical: {
                          label: "Critical",
                          color: "#ef4444",
                        },
                      }}
                      className="h-[300px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={calculateUrgencyStats(complaints)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {calculateUrgencyStats(complaints).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Combined Statistics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Priority Matrix</CardTitle>
                    <CardDescription>
                      Critical and high priority complaints requiring immediate attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600">
                          {complaints.filter((c) => c.intensity === "Critical" && c.urgency === "Critical").length}
                        </div>
                        <div className="text-sm text-red-700">Critical/Critical</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">
                          {complaints.filter((c) => c.intensity === "Critical" || c.urgency === "Critical").length}
                        </div>
                        <div className="text-sm text-orange-700">Any Critical</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600">
                          {complaints.filter((c) => c.intensity === "High" || c.urgency === "High").length}
                        </div>
                        <div className="text-sm text-yellow-700">Any High</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          {complaints.filter((c) => c.intensity === "Low" && c.urgency === "Low").length}
                        </div>
                        <div className="text-sm text-green-700">Low Priority</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>No data available for analysis yet</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Analytics will appear here once complaints are submitted.</p>
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
