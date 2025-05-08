import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

function AttendanceAnalytics({ data }) {
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');

  // Extract headers and rows from data
  const headers = useMemo(() => data[0] || [], [data]);
  const rows = useMemo(() => data.slice(1), [data]);

  // Find column indices
  const indices = useMemo(() => {
    const nameIndex = headers.findIndex(h =>
      h && h.toString().toLowerCase().includes('name') && !h.toString().toLowerCase().includes('school'));
    const idIndex = headers.findIndex(h =>
      h && h.toString().toLowerCase().includes('id'));
    const classIndex = headers.findIndex(h =>
      h && h.toString().toLowerCase().includes('class'));
    const schoolIndex = headers.findIndex(h =>
      h && h.toString().toLowerCase().includes('school'));

    // Find date columns (columns after the basic info columns that have date format)
    const dateColumns = headers.reduce((acc, header, index) => {
      if (header && /^\d{4}-\d{2}-\d{2}$/.test(header)) {
        acc.push({ index, date: header });
      }
      return acc;
    }, []);

    return { nameIndex, idIndex, classIndex, schoolIndex, dateColumns };
  }, [headers]);

  // Get unique schools and classes
  const { schools, classes, dates } = useMemo(() => {
    const schoolSet = new Set();
    const classSet = new Set();

    rows.forEach(row => {
      if (row[indices.schoolIndex]) schoolSet.add(row[indices.schoolIndex]);
      if (row[indices.classIndex]) classSet.add(row[indices.classIndex]);
    });

    return {
      schools: ['All', ...Array.from(schoolSet)],
      classes: ['All', ...Array.from(classSet)],
      dates: ['All', ...indices.dateColumns.map(col => col.date)]
    };
  }, [rows, indices]);

  // Calculate overall attendance data
  const overallAttendanceData = useMemo(() => {
    if (!indices.dateColumns.length) return [];

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalEntries = 0;

    // Filter rows based on selected school and class
    const filteredRows = rows.filter(row => {
      const schoolMatch = selectedSchool === 'All' || row[indices.schoolIndex] === selectedSchool;
      const classMatch = selectedClass === 'All' || row[indices.classIndex] === selectedClass;
      return schoolMatch && classMatch;
    });

    // Count present/absent for selected date or all dates
    filteredRows.forEach(row => {
      if (selectedDate === 'All') {
        // Count across all dates
        indices.dateColumns.forEach(dateCol => {
          const status = row[dateCol.index];
          if (status) {
            totalEntries++;
            if (status.toString().toLowerCase().includes('present')) {
              totalPresent++;
            } else if (status.toString().toLowerCase().includes('absent')) {
              totalAbsent++;
            }
          }
        });
      } else {
        // Count for specific date
        const dateCol = indices.dateColumns.find(col => col.date === selectedDate);
        if (dateCol) {
          const status = row[dateCol.index];
          if (status) {
            totalEntries++;
            if (status.toString().toLowerCase().includes('present')) {
              totalPresent++;
            } else if (status.toString().toLowerCase().includes('absent')) {
              totalAbsent++;
            }
          }
        }
      }
    });

    return [
      { name: 'Present', value: totalPresent, percentage: (totalPresent / totalEntries) * 100 },
      { name: 'Absent', value: totalAbsent, percentage: (totalAbsent / totalEntries) * 100 }
    ];
  }, [rows, indices, selectedSchool, selectedClass, selectedDate]);

  // Calculate school-wise attendance data
  const schoolAttendanceData = useMemo(() => {
    if (!indices.dateColumns.length || schools.length <= 1) return [];

    return schools.filter(school => school !== 'All').map(school => {
      const schoolRows = rows.filter(row => row[indices.schoolIndex] === school);

      let present = 0;
      let absent = 0;
      let total = 0;

      // Count present/absent for selected date or all dates
      schoolRows.forEach(row => {
        if (selectedDate === 'All') {
          // Count across all dates
          indices.dateColumns.forEach(dateCol => {
            const status = row[dateCol.index];
            if (status) {
              total++;
              if (status.toString().toLowerCase().includes('present')) {
                present++;
              } else if (status.toString().toLowerCase().includes('absent')) {
                absent++;
              }
            }
          });
        } else {
          // Count for specific date
          const dateCol = indices.dateColumns.find(col => col.date === selectedDate);
          if (dateCol) {
            const status = row[dateCol.index];
            if (status) {
              total++;
              if (status.toString().toLowerCase().includes('present')) {
                present++;
              } else if (status.toString().toLowerCase().includes('absent')) {
                absent++;
              }
            }
          }
        }
      });

      const attendanceRate = total > 0 ? (present / total) * 100 : 0;

      return {
        name: school,
        attendanceRate,
        present,
        absent,
        total
      };
    });
  }, [rows, indices, schools, selectedDate]);

  // Calculate student-wise attendance data (top 10 lowest attendance)
  const studentAttendanceData = useMemo(() => {
    if (!indices.dateColumns.length) return [];

    // Filter rows based on selected school and class
    const filteredRows = rows.filter(row => {
      const schoolMatch = selectedSchool === 'All' || row[indices.schoolIndex] === selectedSchool;
      const classMatch = selectedClass === 'All' || row[indices.classIndex] === selectedClass;
      return schoolMatch && classMatch;
    });

    const studentData = filteredRows.map(row => {
      let present = 0;
      let absent = 0;
      let total = 0;

      // Count present/absent for selected date or all dates
      if (selectedDate === 'All') {
        // Count across all dates
        indices.dateColumns.forEach(dateCol => {
          const status = row[dateCol.index];
          if (status) {
            total++;
            if (status.toString().toLowerCase().includes('present')) {
              present++;
            } else if (status.toString().toLowerCase().includes('absent')) {
              absent++;
            }
          }
        });
      } else {
        // Count for specific date
        const dateCol = indices.dateColumns.find(col => col.date === selectedDate);
        if (dateCol) {
          const status = row[dateCol.index];
          if (status) {
            total++;
            if (status.toString().toLowerCase().includes('present')) {
              present++;
            } else if (status.toString().toLowerCase().includes('absent')) {
              absent++;
            }
          }
        }
      }

      const attendanceRate = total > 0 ? (present / total) * 100 : 0;

      return {
        id: row[indices.idIndex],
        name: row[indices.nameIndex],
        class: row[indices.classIndex],
        school: row[indices.schoolIndex],
        attendanceRate,
        present,
        absent,
        total
      };
    });

    // Sort by attendance rate (ascending) and take top 10 lowest
    return studentData
      .filter(student => student.total > 0)
      .sort((a, b) => a.attendanceRate - b.attendanceRate)
      .slice(0, 10);
  }, [rows, indices, selectedSchool, selectedClass, selectedDate]);

  // Calculate attendance trend over time
  const attendanceTrendData = useMemo(() => {
    if (!indices.dateColumns.length) return [];

    // Filter rows based on selected school and class
    const filteredRows = rows.filter(row => {
      const schoolMatch = selectedSchool === 'All' || row[indices.schoolIndex] === selectedSchool;
      const classMatch = selectedClass === 'All' || row[indices.classIndex] === selectedClass;
      return schoolMatch && classMatch;
    });

    // Calculate attendance rate for each date
    return indices.dateColumns.map(dateCol => {
      let present = 0;
      let absent = 0;
      let total = 0;

      filteredRows.forEach(row => {
        const status = row[dateCol.index];
        if (status) {
          total++;
          if (status.toString().toLowerCase().includes('present')) {
            present++;
          } else if (status.toString().toLowerCase().includes('absent')) {
            absent++;
          }
        }
      });

      const attendanceRate = total > 0 ? (present / total) * 100 : 0;

      return {
        date: dateCol.date,
        attendanceRate,
        present,
        absent,
        total
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [rows, indices, selectedSchool, selectedClass]);

  // Krishna-themed colors for charts
  const COLORS = ['#1a237e', '#ffc107', '#0288d1', '#ff9800', '#00897b', '#e91e63'];

  // Format percentage for display
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="attendance-analytics">
      <h2>Attendance Analytics</h2>

      <div className="analytics-filters">
        <div className="filter-group">
          <label htmlFor="schoolFilter">School:</label>
          <select
            id="schoolFilter"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            {schools.map((school, index) => (
              <option key={index} value={school}>{school}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="classFilter">Class:</label>
          <select
            id="classFilter"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((cls, index) => (
              <option key={index} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="dateFilter">Date:</label>
          <select
            id="dateFilter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {dates.map((date, index) => (
              <option key={index} value={date}>{date === 'All' ? 'All Dates' : date}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="analytics-summary">
        {overallAttendanceData.length > 0 && (
          <div className="summary-stats">
            <div className="stat-item present">
              <div className="stat-value">{formatPercentage(overallAttendanceData[0].percentage)}</div>
              <div className="stat-label">Present Rate</div>
            </div>
            <div className="stat-item absent">
              <div className="stat-value">{formatPercentage(overallAttendanceData[1].percentage)}</div>
              <div className="stat-label">Absent Rate</div>
            </div>
            <div className="stat-item total">
              <div className="stat-value">{overallAttendanceData[0].value + overallAttendanceData[1].value}</div>
              <div className="stat-label">Total Records</div>
            </div>
          </div>
        )}
      </div>

      <div className="analytics-grid">
        {/* Overall Attendance Pie Chart */}
        <div className="analytics-card">
          <h3>Overall Attendance</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallAttendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percentage }) => formatPercentage(percentage)}
                  paddingAngle={2}
                >
                  {overallAttendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} students`, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontWeight: 500 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* School-wise Attendance Bar Chart */}
        <div className="analytics-card">
          <h3>School-wise Attendance Rate</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={schoolAttendanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#555', fontSize: 12 }}
                  tickLine={{ stroke: '#eee' }}
                  axisLine={{ stroke: '#eee' }}
                  angle={-15}
                  height={60}
                  textAnchor="end"
                />
                <YAxis
                  label={{
                    value: 'Attendance Rate (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#666', fontSize: 12, fontWeight: 500 }
                  }}
                  tick={{ fill: '#555', fontSize: 12 }}
                  tickLine={{ stroke: '#eee' }}
                  axisLine={{ stroke: '#eee' }}
                />
                <Tooltip
                  formatter={(value) => formatPercentage(value)}
                  labelFormatter={(label) => `School: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Bar
                  dataKey="attendanceRate"
                  name="Attendance Rate"
                  fill="#1a237e"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student-wise Attendance (Lowest 10) */}
        <div className="analytics-card">
          <h3>Students with Lowest Attendance</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={studentAttendanceData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: '#555', fontSize: 12 }}
                  tickLine={{ stroke: '#eee' }}
                  axisLine={{ stroke: '#eee' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tick={{ fill: '#555', fontSize: 12 }}
                  tickLine={{ stroke: '#eee' }}
                  axisLine={{ stroke: '#eee' }}
                  tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                />
                <Tooltip
                  formatter={(value) => formatPercentage(value)}
                  labelFormatter={(name) => `Student: ${name}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Bar
                  dataKey="attendanceRate"
                  name="Attendance Rate"
                  fill="#ffc107"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {studentAttendanceData.length > 0 && (
            <div className="chart-note">
              Showing {studentAttendanceData.length} students with lowest attendance rates
            </div>
          )}
        </div>

        {/* Attendance Trend Over Time */}
        <div className="analytics-card">
          <h3>Attendance Trend Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={attendanceTrendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#555', fontSize: 12 }}
                  tickLine={{ stroke: '#eee' }}
                  axisLine={{ stroke: '#eee' }}
                  angle={-15}
                  height={60}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 100]}
                  label={{
                    value: 'Attendance Rate (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#666', fontSize: 12, fontWeight: 500 }
                  }}
                  tick={{ fill: '#555', fontSize: 12 }}
                  tickLine={{ stroke: '#eee' }}
                  axisLine={{ stroke: '#eee' }}
                />
                <Tooltip
                  formatter={(value) => formatPercentage(value)}
                  labelFormatter={(date) => `Date: ${date}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Line
                  type="monotone"
                  dataKey="attendanceRate"
                  name="Attendance Rate"
                  stroke="#0288d1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0288d1", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, fill: "#ffc107", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {attendanceTrendData.length > 0 && (
            <div className="chart-note">
              Showing trend across {attendanceTrendData.length} dates
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceAnalytics;
