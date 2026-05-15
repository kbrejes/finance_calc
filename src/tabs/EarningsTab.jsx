import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import StudentModal from '../components/StudentModal'
import StudentCard from '../components/StudentCard'
import CalendarModal from '../components/CalendarModal'
import * as api from '../lib/api'

export default function EarningsTab() {
  const [students, setStudents] = useState([])
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    const loadStudents = async () => {
      const data = await api.fetchStudents()
      setStudents(data || [])
    }
    loadStudents()
  }, [])

  const handleAddStudent = async (formData) => {
    const newStudent = {
      name: formData.name,
      price: parseFloat(formData.price),
      attendanceDates: [],
    }
    const result = await api.addStudent(newStudent)
    if (result) {
      setStudents([...students, result])
    }
  }

  const handleDeleteStudent = async (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const success = await api.deleteStudent(id)
      if (success) {
        setStudents(students.filter(s => s.id !== id))
      }
    }
  }

  const handleOpenCalendar = (student) => {
    setSelectedStudent(student)
    setCalendarModalOpen(true)
  }

  const handleUpdateAttendance = async (attendanceDates) => {
    const result = await api.updateStudentAttendance(selectedStudent.id, attendanceDates)
    if (result) {
      const updated = students.map(s =>
        s.id === selectedStudent.id
          ? { ...s, attendanceDates }
          : s
      )
      setStudents(updated)
    }
  }

  const totalIncome = students.reduce((sum, s) => sum + (s.price * (s.attendanceDates?.length || 0)), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">ESL Students</h3>
        </div>
        <Button size="icon" variant="default" onClick={() => setStudentModalOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {students.length === 0 ? (
        <div className="rounded-lg border border-border bg-input p-8 text-center text-muted-foreground">
          <p>No students yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onCalendar={() => handleOpenCalendar(student)}
              onDelete={() => handleDeleteStudent(student.id)}
            />
          ))}
        </div>
      )}

      <StudentModal
        open={studentModalOpen}
        onOpenChange={setStudentModalOpen}
        onSubmit={handleAddStudent}
      />

      {selectedStudent && (
        <CalendarModal
          open={calendarModalOpen}
          onOpenChange={setCalendarModalOpen}
          studentName={selectedStudent.name}
          attendanceDates={selectedStudent.attendanceDates}
          onUpdateAttendance={handleUpdateAttendance}
        />
      )}
    </div>
  )
}
