const fs = require('fs');
const dbPath = './db.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (data.students) {
  data.students = data.students.map(student => {
    delete student.lessonsPerWeek;
    delete student.attendanceRate;
    delete student.consistency;
    delete student.minLessonsPerMonth;
    delete student.maxLessonsPerMonth;
    return student;
  });
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('Migration complete.');
