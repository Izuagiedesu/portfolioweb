"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminGuard } from "@/components/admin-guard"
import { LogOut, Download, TrendingUp, Users, FileText, Calendar } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"

interface Complaint {
  id: string
  category: string
  title: string
  details: string
  is_anonymous: boolean
  student_name?: string
  student_id?: string
  student_email?: string
  created_at: string
}

interface CategoryStats {
  category: string
  count: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [topCategory, setTopCategory] = useState<string>("")
  const [adminEmail, setAdminEmail] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createSupabaseClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setAdminEmail(user.email || "")
      }

      const { data: complaintsData, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching complaints:", error)
        return
      }

      setComplaints(complaintsData || [])

      const stats = (complaintsData || []).reduce((acc: Record<string, number>, complaint: Complaint) => {
        acc[complaint.category] = (acc[complaint.category] || 0) + 1
        return acc
      }, {})

      const sortedStats = Object.entries(stats)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

      setCategoryStats(sortedStats)
      setTopCategory(sortedStats[0]?.category || "")
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const handleExportCSV = () => {
    if (complaints.length === 0) {
      alert("No complaints to export")
      return
    }

    const headers = [
      "ID",
      "Category",
      "Title",
      "Details",
      "Anonymous",
      "Student Name",
      "Student ID",
      "Student Email",
      "Created At",
    ]
    const csvContent = [
      headers.join(","),
      ...complaints.map((complaint) =>
        [
          complaint.id,
          `"${complaint.category}"`,
          `"${complaint.title}"`,
          `"${complaint.details.replace(/"/g, '""')}"`,
          complaint.is_anonymous,
          complaint.is_anonymous ? "Anonymous" : `"${complaint.student_name || ""}"`,
          complaint.is_anonymous ? "Anonymous" : `"${complaint.student_id || ""}"`,
          complaint.is_anonymous ? "Anonymous" : `"${complaint.student_email || ""}"`,
          complaint.created_at,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `complaints-export-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredComplaints = selectedCategory
    ? complaints.filter((complaint) => complaint.category === selectedCategory)
    : complaints

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">DSS Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {adminEmail}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categoryStats.length}</div>
                <p className="text-xs text-muted-foreground">Active complaint types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{topCategory || "N/A"}</div>
                <p className="text-xs text-muted-foreground">Most reported issue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    complaints.filter((c) => {
                      const complaintDate = new Date(c.created_at)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return complaintDate > weekAgo
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Recent submissions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Category Statistics */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Complaints by Category</CardTitle>
                  <CardDescription>Click on a category to view individual complaints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.length > 0 ? (
                      categoryStats.map((stat) => (
                        <div
                          key={stat.category}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedCategory === stat.category ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedCategory(selectedCategory === stat.category ? null : stat.category)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{stat.category}</span>
                            {stat.category === topCategory && (
                              <Badge variant="secondary" className="text-xs">
                                Top Complaint
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline">{stat.count}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No complaints submitted yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Complaints List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedCategory ? `${selectedCategory} Complaints` : "All Complaints"}</CardTitle>
                      <CardDescription>
                        {selectedCategory
                          ? `Showing ${filteredComplaints.length} complaints in ${selectedCategory}`
                          : `Showing all ${complaints.length} complaints`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {selectedCategory && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)}>
                          Show All
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={complaints.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((complaint) => (
                          <div key={complaint.id} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary">{complaint.category}</Badge>
                                  {complaint.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{complaint.title}</h3>
                                <p className="text-muted-foreground mb-3">{complaint.details}</p>
                                {!complaint.is_anonymous && (
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>
                                      <strong>Student:</strong> {complaint.student_name}
                                    </p>
                                    <p>
                                      <strong>ID:</strong> {complaint.student_id}
                                    </p>
                                    <p>
                                      <strong>Email:</strong> {complaint.student_email}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>ID: {complaint.id}</span>
                              <span>{formatDate(complaint.created_at)}</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          {selectedCategory
                            ? `No complaints found in ${selectedCategory} category`
                            : "No complaints submitted yet"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
