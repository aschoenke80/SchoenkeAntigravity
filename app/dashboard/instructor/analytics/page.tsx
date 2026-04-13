import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import InstructorAnalyticsClient from './InstructorAnalyticsClient'

export default async function InstructorAnalyticsPage() {
  const session = await requireAuth(['instructor'])

  // Get instructor's courses
  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('id, title')
    .eq('instructor_id', session.userId)

  const courseIds = courses?.map(c => c.id) || []

  let totalStudents = 0
  let totalExams = 0
  let courseEnrollments: { name: string; enrolled: number }[] = []
  let allSubmissions: { score: number; total_points: number; submitted_at: string }[] = []

  if (courseIds.length > 0) {
    // Enrollments per course
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .in('course_id', courseIds)

    const enrollmentMap: Record<string, number> = {}
    enrollments?.forEach(e => {
      enrollmentMap[e.course_id] = (enrollmentMap[e.course_id] || 0) + 1
    })

    totalStudents = new Set(enrollments?.map(e => e.course_id)).size ? enrollments?.length || 0 : 0

    courseEnrollments = (courses || []).map(c => ({
      name: c.title.length > 18 ? c.title.slice(0, 18) + '…' : c.title,
      enrolled: enrollmentMap[c.id] || 0,
    }))

    // Exams
    const { data: exams, count } = await supabaseAdmin
      .from('exams')
      .select('id', { count: 'exact' })
      .in('course_id', courseIds)

    totalExams = count || 0

    const examIds = exams?.map(e => e.id) || []
    if (examIds.length > 0) {
      const { data: subs } = await supabaseAdmin
        .from('exam_submissions')
        .select('score, total_points, submitted_at')
        .in('exam_id', examIds)

      allSubmissions = subs || []
    }
  }

  const avgScore = allSubmissions.length > 0
    ? Math.round(allSubmissions.reduce((acc, s) => acc + (s.total_points > 0 ? (s.score / s.total_points) * 100 : 0), 0) / allSubmissions.length)
    : 0

  // Recent scores (last 14 days)
  const recentMap: Record<string, { total: number; count: number }> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    recentMap[d.toISOString().split('T')[0]] = { total: 0, count: 0 }
  }

  allSubmissions.forEach(s => {
    const day = new Date(s.submitted_at).toISOString().split('T')[0]
    if (recentMap[day]) {
      const pct = s.total_points > 0 ? (s.score / s.total_points) * 100 : 0
      recentMap[day].total += pct
      recentMap[day].count++
    }
  })

  const recentScores = Object.entries(recentMap).map(([date, v]) => ({
    date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    avgScore: v.count > 0 ? Math.round(v.total / v.count) : 0,
  }))

  return (
    <InstructorAnalyticsClient
      stats={{
        totalCourses: courses?.length || 0,
        totalStudents,
        totalExams,
        avgScore,
      }}
      courseEnrollments={courseEnrollments}
      courseCompletionData={[]}
      recentScores={recentScores}
    />
  )
}
