import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import AdminAnalyticsClient from './AdminAnalyticsClient'

export default async function AdminAnalyticsPage() {
  await requireAuth(['admin'])

  // Get counts
  const [
    { count: studentCount },
    { count: instructorCount },
    { count: courseCount },
    { count: examCount },
    { count: submissionCount },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
    supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('exams').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('exam_submissions').select('*', { count: 'exact', head: true }),
  ])

  // Get enrollment data per course
  const { data: courses } = await supabaseAdmin.from('courses').select('id, title')
  const { data: enrollments } = await supabaseAdmin.from('enrollments').select('course_id')

  const enrollmentMap: Record<string, number> = {}
  enrollments?.forEach(e => {
    enrollmentMap[e.course_id] = (enrollmentMap[e.course_id] || 0) + 1
  })

  const coursesData = (courses || []).map(c => ({
    name: c.title.length > 20 ? c.title.slice(0, 20) + '…' : c.title,
    enrolled: enrollmentMap[c.id] || 0,
  })).sort((a, b) => b.enrolled - a.enrolled).slice(0, 10)

  // Score distribution
  const { data: submissions } = await supabaseAdmin
    .from('exam_submissions')
    .select('score, total_points')

  const ranges = [
    { range: '0-20%', min: 0, max: 20, count: 0 },
    { range: '21-40%', min: 21, max: 40, count: 0 },
    { range: '41-60%', min: 41, max: 60, count: 0 },
    { range: '61-80%', min: 61, max: 80, count: 0 },
    { range: '81-100%', min: 81, max: 100, count: 0 },
  ]

  submissions?.forEach(s => {
    const pct = s.total_points > 0 ? Math.round((s.score / s.total_points) * 100) : 0
    const bucket = ranges.find(r => pct >= r.min && pct <= r.max)
    if (bucket) bucket.count++
  })

  // Recent activity (last 14 days)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const { data: recentSubs } = await supabaseAdmin
    .from('exam_submissions')
    .select('submitted_at')
    .gte('submitted_at', fourteenDaysAgo.toISOString())

  const activityMap: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    activityMap[d.toISOString().split('T')[0]] = 0
  }
  recentSubs?.forEach(s => {
    const day = new Date(s.submitted_at).toISOString().split('T')[0]
    if (activityMap[day] !== undefined) activityMap[day]++
  })

  const recentActivity = Object.entries(activityMap).map(([date, submissions]) => ({
    date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    submissions,
  }))

  return (
    <AdminAnalyticsClient
      stats={{
        totalStudents: studentCount || 0,
        totalInstructors: instructorCount || 0,
        totalCourses: courseCount || 0,
        totalExams: examCount || 0,
        totalSubmissions: submissionCount || 0,
      }}
      coursesData={coursesData}
      scoreDistribution={ranges.map(r => ({ range: r.range, count: r.count }))}
      recentActivity={recentActivity}
    />
  )
}
