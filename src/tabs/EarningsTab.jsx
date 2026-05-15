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
  const [editingStudent, setEditingStudent] = useState(null)

  useEffect(() => {
    const loadStudents = async () => {
      const data = await api.fetchStudents()
      setStudents(data || [])
    }
    loadStudents()
  }, [])

  const handleAddOrUpdateStudent = async (formData) => {
    if (editingStudent) {
      const updatedData = {
        ...editingStudent,
        name: formData.name,
        price: parseFloat(formData.price),
        status: formData.status,
      }
      const result = await api.updateStudent(editingStudent.id, updatedData)
      if (result) {
        setStudents(students.map(s => s.id === editingStudent.id ? result : s))
      }
    } else {
      const newStudent = {
        name: formData.name,
        price: parseFloat(formData.price),
        status: formData.status,
        attendanceDates: [],
      }
      const result = await api.addStudent(newStudent)
      if (result) {
        setStudents([...students, result])
      }
    }
    setEditingStudent(null)
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

  const handleOpenEdit = (student) => {
    setEditingStudent(student)
    setStudentModalOpen(true)
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

  const handleUpdatePayments = async (payments) => {
    const result = await api.updateStudent(selectedStudent.id, { ...selectedStudent, payments })
    if (result) {
      setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, payments } : s))
      setSelectedStudent({ ...selectedStudent, payments })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">ESL Students</h3>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase">Prepaid Ledger & Management</p>
        </div>
        <Button size="icon" variant="outline" className="rounded-xl border-border/40 hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => {
          setEditingStudent(null)
          setStudentModalOpen(true)
        }}>
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
              onEdit={() => handleOpenEdit(student)}
            />
          ))}
        </div>
      )}

      <StudentModal
        open={studentModalOpen}
        onOpenChange={(open) => {
          setStudentModalOpen(open)
          if (!open) setEditingStudent(null)
        }}
        onSubmit={handleAddOrUpdateStudent}
        initialData={editingStudent}
      />

      {selectedStudent && (
        <CalendarModal
          open={calendarModalOpen}
          onOpenChange={setCalendarModalOpen}
          studentName={selectedStudent.name}
          attendanceDates={selectedStudent.attendanceDates}
          avgLessonPrice={selectedStudent.price}
          onUpdateAttendance={handleUpdateAttendance}
        />
      )}
    </div>
  )
}
