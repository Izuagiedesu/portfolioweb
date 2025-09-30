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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface Complaint {
  id: string
  category: string
  title: string
  details: string
  priority: string
  hostel?: string
  room_department?: string
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

function ComplaintDetailsModal({ complaint }: { complaint: Complaint }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-1 text-left justify-start">
          <div className="max-w-[250px] text-sm truncate">
            {complaint.details.length > 100 ? `${complaint.details.substring(0, 100)}...` : complaint.details}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary">{complaint.category}</Badge>
            {complaint.title}
          </DialogTitle>
          <DialogDescription>
            Complaint ID: {complaint.id} • Submitted:{" "}
            {new Date(complaint.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {(complaint.hostel || complaint.room_department) && (
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Location</h4>
              <div className="text-sm space-y-1">
                {complaint.hostel && (
                  <div>
                    <strong>Hostel/College:</strong> {complaint.hostel}
                  </div>
                )}
                {complaint.room_department && (
                  <div>
                    <strong>Room/Department:</strong> {complaint.room_department}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-1">Priority Level</h4>
            <Badge
              variant={
                complaint.priority === "Critical"
                  ? "destructive"
                  : complaint.priority === "High"
                    ? "default"
                    : "secondary"
              }
            >
              {complaint.priority}
            </Badge>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-1">Student Information</h4>
            {complaint.is_anonymous ? (
              <Badge variant="outline">Anonymous Submission</Badge>
            ) : (
              <div className="text-sm space-y-1">
                <div>
                  <strong>Name:</strong> {complaint.student_name}
                </div>
                <div>
                  <strong>Student ID:</strong> {complaint.student_id}
                </div>
                {complaint.student_email && (
                  <div>
                    <strong>Email:</strong> {complaint.student_email}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Full Complaint Details</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.details}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
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
      '\uFEFF"ID","Category","Title","Details","Priority","Hostel","Room/Department","Student Name","Student ID","Anonymous","Date","Time"\n' +
      complaints
        .map((c) => {
          const date = new Date(c.created_at)
          return [
            `"${c.id}"`,
            `"${c.category}"`,
            `"${(c.title || "").replace(/"/g, '""')}"`,
            `"${c.details.replace(/"/g, '""')}"`,
            `"${c.priority}"`,
            `"${c.hostel || "N/A"}"`,
            `"${c.room_department || "N/A"}"`,
            `"${c.student_name || "N/A"}"`,
            `"${c.student_id || "N/A"}"`,
            `"${c.is_anonymous ? "Yes" : "No"}"`,
            `"${date.toLocaleDateString()}"`,
            `"${date.toLocaleTimeString()}"`,
          ].join(",")
        })
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "all_complaints.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportCategory = (category: string) => {
    const filteredComplaints = complaints.filter((c) => c.category === category)
    const csvContent =
      '\uFEFF"ID","Category","Title","Details","Priority","Hostel","Room/Department","Student Name","Student ID","Anonymous","Date","Time"\n' +
      filteredComplaints
        .map((c) => {
          const date = new Date(c.created_at)
          return [
            `"${c.id}"`,
            `"${c.category}"`,
            `"${(c.title || "").replace(/"/g, '""')}"`,
            `"${c.details.replace(/"/g, '""')}"`,
            `"${c.priority}"`,
            `"${c.hostel || "N/A"}"`,
            `"${c.room_department || "N/A"}"`,
            `"${c.student_name || "N/A"}"`,
            `"${c.student_id || "N/A"}"`,
            `"${c.is_anonymous ? "Yes" : "No"}"`,
            `"${date.toLocaleDateString()}"`,
            `"${date.toLocaleTimeString()}"`,
          ].join(",")
        })
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${category.toLowerCase()}_complaints.csv`)
    link.style.visibility = "hidden"
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

  const calculatePriorityStats = (complaintsData: Complaint[]) => {
    const priorityCount: { [key: string]: number } = {}

    complaintsData.forEach((complaint) => {
      priorityCount[complaint.priority] = (priorityCount[complaint.priority] || 0) + 1
    })

    const total = complaintsData.length
    return Object.entries(priorityCount).map(([priority, count]) => ({
      name: priority,
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
                          '\uFEFF"ID","Category","Title","Details","Priority","Hostel","Room/Department","Student Name","Student ID","Anonymous","Date","Time"\n' +
                          complaints
                            .map((c) => {
                              const date = new Date(c.created_at)
                              return [
                                `"${c.id}"`,
                                `"${c.category}"`,
                                `"${(c.title || "").replace(/"/g, '""')}"`,
                                `"${c.details.replace(/"/g, '""')}"`,
                                `"${c.priority}"`,
                                `"${c.hostel || "N/A"}"`,
                                `"${c.room_department || "N/A"}"`,
                                `"${c.student_name || "N/A"}"`,
                                `"${c.student_id || "N/A"}"`,
                                `"${c.is_anonymous ? "Yes" : "No"}"`,
                                `"${date.toLocaleDateString()}"`,
                                `"${date.toLocaleTimeString()}"`,
                              ].join(",")
                            })
                            .join("\n")

                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
                        const link = document.createElement("a")
                        const url = URL.createObjectURL(blob)
                        link.setAttribute("href", url)
                        link.setAttribute(
                          "download",
                          `${tableFilter === "all" ? "all" : tableFilter.toLowerCase()}_complaints_page_${currentPage}.csv`,
                        )
                        link.style.visibility = "hidden"
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
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead className="w-[120px]">Category</TableHead>
                            <TableHead className="w-[200px]">Title</TableHead>
                            <TableHead className="w-[100px]">Priority</TableHead>
                            <TableHead className="w-[120px]">Location</TableHead>
                            <TableHead className="w-[150px]">Student Info</TableHead>
                            <TableHead className="w-[120px]">Date Submitted</TableHead>
                            <TableHead className="min-w-[250px]">Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {complaints.map((complaint) => (
                            <TableRow key={complaint.id}>
                              <TableCell className="font-mono text-xs">{complaint.id.slice(0, 8)}...</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="whitespace-nowrap">
                                  {complaint.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="max-w-[200px] truncate" title={complaint.title}>
                                  {complaint.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    complaint.priority === "Critical"
                                      ? "destructive"
                                      : complaint.priority === "High"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="whitespace-nowrap"
                                >
                                  {complaint.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {complaint.hostel && (
                                    <div className="font-medium truncate max-w-[110px]" title={complaint.hostel}>
                                      {complaint.hostel}
                                    </div>
                                  )}
                                  {complaint.room_department && (
                                    <div
                                      className="text-gray-500 text-xs truncate max-w-[110px]"
                                      title={complaint.room_department}
                                    >
                                      {complaint.room_department}
                                    </div>
                                  )}
                                  {!complaint.hostel && !complaint.room_department && (
                                    <span className="text-gray-400 text-xs">N/A</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {complaint.is_anonymous ? (
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    Anonymous
                                  </Badge>
                                ) : (
                                  <div className="text-sm">
                                    <div
                                      className="font-medium truncate max-w-[140px]"
                                      title={complaint.student_name || ""}
                                    >
                                      {complaint.student_name}
                                    </div>
                                    <div
                                      className="text-gray-500 text-xs truncate max-w-[140px]"
                                      title={complaint.student_id || ""}
                                    >
                                      {complaint.student_id}
                                    </div>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(complaint.created_at)}
                              </TableCell>
                              <TableCell>
                                <ComplaintDetailsModal complaint={complaint} />
                              </TableCell>
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
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Complaint Priority Distribution</CardTitle>
                    <CardDescription>Breakdown of complaint priority levels as percentage of total</CardDescription>
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
                            data={calculatePriorityStats(complaints)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {calculatePriorityStats(complaints).map((entry, index) => (
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
                          {complaints.filter((c) => c.priority === "Critical").length}
                        </div>
                        <div className="text-sm text-red-700">Critical Priority</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">
                          {complaints.filter((c) => c.priority === "High").length}
                        </div>
                        <div className="text-sm text-orange-700">High Priority</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600">
                          {complaints.filter((c) => c.priority === "Medium").length}
                        </div>
                        <div className="text-sm text-yellow-700">Medium Priority</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          {complaints.filter((c) => c.priority === "Low").length}
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
