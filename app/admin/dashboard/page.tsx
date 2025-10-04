"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { getAdminSession, clearAdminSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { AlertCircle, Download, RefreshCw, LogOut, FileText, AlertTriangle, Eye } from "lucide-react"

interface Complaint {
  id: string
  category: string
  title: string
  details: string
  intensity: string
  urgency: string
  priority: string
  location?: string
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

function ComplaintDetailsModal({ complaint, onOpen }: { complaint: Complaint; onOpen?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  const parseLocation = (location: string | undefined) => {
    if (!location) return { hostel: "N/A", room: "N/A" }
    const parts = location.split(" ")
    return {
      hostel: parts.slice(0, -1).join(" ") || "N/A",
      room: parts[parts.length - 1] || "N/A",
    }
  }

  const locationData = parseLocation(complaint.location)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(true)
          onOpen?.()
        }}
        className="text-cyan-400 hover:text-cyan-300 hover:bg-gray-700"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 text-white border-cyan-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Badge variant="secondary" className="bg-gray-800 text-white">
              {complaint.category}
            </Badge>
            {complaint.title}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-base">
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
        <div className="space-y-6 mt-4">
          <div>
            <h4 className="font-semibold text-gray-400 mb-3">Location</h4>
            <div className="space-y-2 text-white">
              <div>
                <span className="font-bold">Hostel/College:</span> {locationData.hostel}
              </div>
              <div>
                <span className="font-bold">Room/Department:</span> {locationData.room}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-400 mb-3">Priority Level</h4>
            <Badge
              className={
                complaint.priority === "High"
                  ? "bg-cyan-500 text-black hover:bg-cyan-600"
                  : complaint.priority === "Critical"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-600 text-white hover:bg-gray-700"
              }
            >
              {complaint.priority}
            </Badge>
          </div>

          <div>
            <h4 className="font-semibold text-gray-400 mb-3">Student Information</h4>
            {complaint.is_anonymous ? (
              <Badge variant="outline" className="border-gray-600 text-white">
                Anonymous Submission
              </Badge>
            ) : (
              <div className="text-white space-y-2">
                <div>
                  <span className="font-bold">Name:</span> {complaint.student_name}
                </div>
                <div>
                  <span className="font-bold">Student ID:</span> {complaint.student_id}
                </div>
                {complaint.student_email && (
                  <div>
                    <span className="font-bold">Email:</span> {complaint.student_email}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-400 mb-3">Full Complaint Details</h4>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-white leading-relaxed whitespace-pre-wrap">{complaint.details}</p>
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const router = useRouter()

  const handleExportAll = () => {
    const csvContent =
      '\uFEFF"ID","Category","Title","Details","Intensity","Urgency","Location","Student Name","Student ID","Anonymous","Date","Time"\n' +
      complaints
        .map((c) => {
          const date = new Date(c.created_at)
          return [
            `"${c.id}"`,
            `"${c.category}"`,
            `"${(c.title || "").replace(/"/g, '""')}"`,
            `"${c.details.replace(/"/g, '""')}"`,
            `"${c.intensity}"`,
            `"${c.urgency}"`,
            `"${c.location || "N/A"}"`,
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

  const handleExportNoiseDisturbance = () => {
    const noiseComplaints = complaints.filter((c) => c.category === "Noise Disturbance")
    const csvContent =
      '\uFEFF"ID","Category","Title","Details","Intensity","Urgency","Location","Student Name","Student ID","Anonymous","Date","Time"\n' +
      noiseComplaints
        .map((c) => {
          const date = new Date(c.created_at)
          return [
            `"${c.id}"`,
            `"${c.category}"`,
            `"${(c.title || "").replace(/"/g, '""')}"`,
            `"${c.details.replace(/"/g, '""')}"`,
            `"${c.intensity}"`,
            `"${c.urgency}"`,
            `"${c.location || "N/A"}"`,
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
    link.setAttribute("download", "noise_disturbance_complaints.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportCurrentPage = () => {
    const filteredComplaints = getFilteredComplaints()
    const csvContent =
      '\uFEFF"ID","Category","Title","Details","Priority","Location","Student Info","Date Submitted"\n' +
      filteredComplaints
        .map((c) => {
          const studentInfo = c.is_anonymous ? "Anonymous" : `${c.student_name || "N/A"} ${c.student_id || ""}`
          return [
            `"${c.id.slice(0, 8)}"`,
            `"${c.category}"`,
            `"${(c.title || "").replace(/"/g, '""')}"`,
            `"${c.details.replace(/"/g, '""')}"`,
            `"${c.priority}"`,
            `"${c.location || "N/A"}"`,
            `"${studentInfo}"`,
            `"${formatDate(c.created_at)}"`,
          ].join(",")
        })
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "complaints_current_page.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const fetchComplaints = async () => {
    try {
      const response = await fetch("/api/complaints?limit=1000", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setComplaints(data.complaints || [])
      calculateCategoryStats(data.complaints || [])
      setError(null)
    } catch (error: any) {
      setError("Failed to load complaints from database. Please try refreshing the page.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const session = getAdminSession()

    if (session) {
      fetchComplaints()
    } else {
      setIsLoading(false)
    }
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

  const calculatePriorityStats = (complaintsData: Complaint[]) => {
    const priorityCount: { [key: string]: number } = { Critical: 0, High: 0, Medium: 0, Low: 0 }

    complaintsData.forEach((complaint) => {
      priorityCount[complaint.priority] = (priorityCount[complaint.priority] || 0) + 1
    })

    const total = complaintsData.length
    return Object.entries(priorityCount)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        name: priority,
        value: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
  }

  const getFilteredComplaints = () => {
    if (selectedCategory === "all") {
      return complaints
    }
    return complaints.filter((c) => c.category === selectedCategory)
  }

  const getUniqueCategories = () => {
    const categories = Array.from(new Set(complaints.map((c) => c.category)))
    return categories.sort()
  }

  const CHART_COLORS = {
    Critical: "#dc2626",
    High: "#f97316",
    Medium: "#fbbf24",
    Low: "#22c55e",
  }

  const handleLogout = () => {
    clearAdminSession()
    router.push("/admin/login")
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchComplaints()
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

  const topCategory = categoryStats[0]
  const criticalCount = complaints.filter((c) => c.priority === "Critical").length
  const highCount = complaints.filter((c) => c.priority === "High").length
  const mediumCount = complaints.filter((c) => c.priority === "Medium").length
  const lowCount = complaints.filter((c) => c.priority === "Low").length

  const filteredComplaints = getFilteredComplaints()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DSS Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, Admin</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleRefresh} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
            <Button onClick={handleLogout} variant="default" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-8">
        {error ? (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-900">Database Connection Error</CardTitle>
              </div>
              <CardDescription className="text-red-700">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="complaints">Complaints Table</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 text-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <CardTitle>Total Complaints</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{complaints.length}</div>
                  <p className="text-sm text-gray-300 mt-1">All time submissions</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 text-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <CardTitle>Top Issue</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {topCategory ? (
                    <>
                      <div className="text-3xl font-bold">{topCategory.category}</div>
                      <p className="text-sm text-gray-300 mt-1">{topCategory.count} complaints</p>
                    </>
                  ) : (
                    <div className="text-gray-400">No data</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 text-white">
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription className="text-gray-300">
                  Download complaint data for analysis and reporting
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button onClick={handleExportAll} variant="secondary" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export All Complaints (CSV)
                </Button>
                <Button
                  onClick={handleExportNoiseDisturbance}
                  variant="outline"
                  className="gap-2 bg-transparent text-white border-gray-600 hover:bg-gray-700"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Export Noise Disturbance Complaints
                </Button>
              </CardContent>
            </Card>

            {topCategory && (
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">Top Complaint Category</CardTitle>
                  </div>
                  <CardDescription className="text-orange-700">
                    This category needs immediate attention from the DSS team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{topCategory.category}</div>
                  <p className="text-orange-700 mt-1">
                    {topCategory.count} complaints ({topCategory.percentage}% of total)
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="complaints">
            <Card className="bg-gray-800 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Complaints Table</CardTitle>
                    <CardDescription className="text-gray-300">
                      Showing {filteredComplaints.length} of {complaints.length} complaints (Page 1 of 1)
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getUniqueCategories().map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleExportCurrentPage} variant="secondary" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export Current Page
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700">
                      <TableHead className="text-gray-300 w-20">ID</TableHead>
                      <TableHead className="text-gray-300 w-32">Category</TableHead>
                      <TableHead className="text-gray-300 w-32">Title</TableHead>
                      <TableHead className="text-gray-300 w-24">Priority</TableHead>
                      <TableHead className="text-gray-300 w-28">Location</TableHead>
                      <TableHead className="text-gray-300 w-28">Student Info</TableHead>
                      <TableHead className="text-gray-300 w-36">Date Submitted</TableHead>
                      <TableHead className="text-gray-300">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.map((complaint) => {
                      return (
                        <TableRow key={complaint.id} className="border-gray-700 hover:bg-gray-700 cursor-pointer">
                          <TableCell className="font-mono text-xs text-gray-300 truncate">
                            {complaint.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-gray-200 truncate">{complaint.category}</TableCell>
                          <TableCell className="text-gray-200 truncate">{complaint.title}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                complaint.priority === "High"
                                  ? "bg-cyan-500 text-black hover:bg-cyan-600"
                                  : "bg-gray-600 text-white hover:bg-gray-700"
                              }
                            >
                              {complaint.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {complaint.location ? (
                              <div className="truncate">
                                <div className="font-medium truncate">{complaint.location.split(" ")[0]}</div>
                                <div className="text-xs text-gray-400 truncate">
                                  {complaint.location.split(" ").slice(1).join(" ")}
                                </div>
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {complaint.is_anonymous ? (
                              "Anonymous"
                            ) : (
                              <div className="truncate">
                                <div className="font-medium truncate">{complaint.student_name}</div>
                                <div className="text-xs text-gray-400 truncate">{complaint.student_id}</div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">{formatDate(complaint.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-200 truncate flex-1">{complaint.details}</div>
                              <ComplaintDetailsModal complaint={complaint} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-800 text-white">
              <CardHeader>
                <CardTitle>Complaint Priority Distribution</CardTitle>
                <CardDescription className="text-gray-300">
                  Breakdown of complaint priority levels as percentage of total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    Critical: { label: "Critical Priority", color: "#dc2626" },
                    High: { label: "High Priority", color: "#f97316" },
                    Medium: { label: "Medium Priority", color: "#fbbf24" },
                    Low: { label: "Low Priority", color: "#22c55e" },
                  }}
                  className="h-[400px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculatePriorityStats(complaints)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {calculatePriorityStats(complaints).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 text-white">
              <CardHeader>
                <CardTitle>Priority Matrix</CardTitle>
                <CardDescription className="text-gray-300">
                  Critical and high priority complaints requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-900 text-5xl font-bold">{criticalCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-700 font-semibold">Critical Priority</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-orange-900 text-5xl font-bold">{highCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-orange-700 font-semibold">High Priority</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-yellow-900 text-5xl font-bold">{mediumCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-yellow-700 font-semibold">Medium Priority</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-green-900 text-5xl font-bold">{lowCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-700 font-semibold">Low Priority</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 text-white">
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription className="text-gray-300">
                  Download complaint data for analysis and reporting
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button onClick={handleExportAll} variant="secondary" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export All Complaints (CSV)
                </Button>
                <Button
                  onClick={handleExportNoiseDisturbance}
                  variant="outline"
                  className="gap-2 bg-transparent text-white border-gray-600 hover:bg-gray-700"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Export Noise Disturbance Complaints
                </Button>
              </CardContent>
            </Card>

            {topCategory && (
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">Top Complaint Category</CardTitle>
                  </div>
                  <CardDescription className="text-orange-700">
                    This category needs immediate attention from the DSS team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{topCategory.category}</div>
                  <p className="text-orange-700 mt-1">
                    {topCategory.count} complaints ({topCategory.percentage}% of total)
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
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
