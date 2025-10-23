import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTeamPerformance, getTeamCoachingOverview } from '../utils/api';
import { formatReadableDate, formatCurrency, getSeverityColor } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ManagerDashboard() {
  const { user } = useAuth();
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [teamCoaching, setTeamCoaching] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, [selectedDate]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const [performance, coaching] = await Promise.all([
        getTeamPerformance(selectedDate),
        getTeamCoachingOverview(selectedDate),
      ]);

      setTeamPerformance(performance);
      setTeamCoaching(coaching);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Team Performance Report', 14, 20);
    doc.setFontSize(11);
    doc.text(`Date: ${formatReadableDate(selectedDate)}`, 14, 28);
    doc.text(`Manager: ${user.firstName} ${user.lastName}`, 14, 34);

    // Sort team members alphabetically by last name
    const sortedTeam = [...teamPerformance].sort((a, b) =>
      a.lastName.localeCompare(b.lastName)
    );

    // Prepare table data
    const tableData = sortedTeam.map((member) => {
      const perf = member.performance;
      return [
        `${member.lastName}, ${member.firstName}`,
        perf ? perf.contacts : '-',
        perf ? perf.presentations : '-',
        perf ? perf.creditChecks : '-',
        perf ? perf.closes : '-',
        perf ? formatCurrency(perf.revenue) : '-',
        perf && perf.ratios ? `${perf.ratios.contactToPresentationRatio || '-'}:1` : '-',
        perf && perf.ratios ? `${perf.ratios.presentationToCreditRatio || '-'}:1` : '-',
        perf && perf.ratios ? `${perf.ratios.closeRate || '-'}%` : '-',
      ];
    });

    // Add table
    doc.autoTable({
      head: [
        [
          'Name',
          'Contacts',
          'Pres',
          'Credits',
          'Closes',
          'Revenue',
          'C→P',
          'P→C',
          'Close%',
        ],
      ],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [3, 105, 161] },
    });

    // Add coaching summary if available
    if (teamCoaching.length > 0) {
      const coachingY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Coaching Summary', 14, coachingY);

      const coachingData = teamCoaching
        .filter((member) => member.coaching)
        .sort((a, b) => a.lastName.localeCompare(b.lastName))
        .map((member) => [
          `${member.lastName}, ${member.firstName}`,
          member.coaching.primaryBottleneck || '-',
          member.coaching.severity || '-',
          member.coaching.acknowledged ? 'Yes' : 'No',
        ]);

      doc.autoTable({
        head: [['Name', 'Bottleneck', 'Severity', 'Acknowledged']],
        body: coachingData,
        startY: coachingY + 5,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [3, 105, 161] },
      });
    }

    // Save PDF
    doc.save(`team-performance-${selectedDate}.pdf`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Calculate team totals
  const teamTotals = teamPerformance.reduce(
    (acc, member) => {
      if (member.performance) {
        return {
          contacts: acc.contacts + (member.performance.contacts || 0),
          presentations: acc.presentations + (member.performance.presentations || 0),
          closes: acc.closes + (member.performance.closes || 0),
          revenue: acc.revenue + parseFloat(member.performance.revenue || 0),
        };
      }
      return acc;
    },
    { contacts: 0, presentations: 0, closes: 0, revenue: 0 }
  );

  // Sort team members alphabetically by last name
  const sortedTeam = [...teamPerformance].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and track your team's performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <button onClick={exportToPDF} className="btn-primary">
            Export to PDF
          </button>
        </div>
      </div>

      {/* Team Totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-90">Total Contacts</div>
          <div className="text-3xl font-bold mt-2">{teamTotals.contacts}</div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm opacity-90">Total Presentations</div>
          <div className="text-3xl font-bold mt-2">{teamTotals.presentations}</div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-sm opacity-90">Total Closes</div>
          <div className="text-3xl font-bold mt-2">{teamTotals.closes}</div>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-sm opacity-90">Total Revenue</div>
          <div className="text-3xl font-bold mt-2">{formatCurrency(teamTotals.revenue)}</div>
        </div>
      </div>

      {/* Coaching Alerts */}
      {teamCoaching.filter((m) => m.coaching).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Coaching Alerts</h2>
          <div className="space-y-3">
            {teamCoaching
              .filter((m) => m.coaching)
              .sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return (
                  severityOrder[a.coaching.severity] - severityOrder[b.coaching.severity]
                );
              })
              .map((member) => (
                <div
                  key={member.userId}
                  className={`p-4 rounded-lg border ${getSeverityColor(member.coaching.severity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm mt-1">
                        Primary Issue: {member.coaching.primaryBottleneck?.replace('_', ' ')}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                        member.coaching.acknowledged ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.coaching.acknowledged ? 'Acknowledged' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Team Performance Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">
          Team Performance - {formatReadableDate(selectedDate)}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacts
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presentations
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  C→P
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P→C
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Close%
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTeam.map((member) => {
                const perf = member.performance;
                return (
                  <tr key={member.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.lastName}, {member.firstName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {perf ? perf.contacts : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {perf ? perf.presentations : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {perf ? perf.creditChecks : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {perf ? perf.closes : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {perf ? formatCurrency(perf.revenue) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {perf && perf.ratios
                        ? `${perf.ratios.contactToPresentationRatio || '-'}:1`
                        : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {perf && perf.ratios
                        ? `${perf.ratios.presentationToCreditRatio || '-'}:1`
                        : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {perf && perf.ratios ? `${perf.ratios.closeRate || '-'}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td className="px-4 py-3 text-sm">TOTALS</td>
                <td className="px-4 py-3 text-sm">{teamTotals.contacts}</td>
                <td className="px-4 py-3 text-sm">{teamTotals.presentations}</td>
                <td className="px-4 py-3 text-sm">-</td>
                <td className="px-4 py-3 text-sm">{teamTotals.closes}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(teamTotals.revenue)}</td>
                <td className="px-4 py-3 text-sm">-</td>
                <td className="px-4 py-3 text-sm">-</td>
                <td className="px-4 py-3 text-sm">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
