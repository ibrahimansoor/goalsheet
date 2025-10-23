import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitDailyPerformance, getPreviousDayPerformance, getDailyPerformance } from '../utils/api';
import { formatDate, validatePerformanceData } from '../utils/helpers';
import CoachingCard from '../components/CoachingCard';

function DailyEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(formatDate(new Date()));
  const [formData, setFormData] = useState({
    contacts: '',
    turnAndBurns: '',
    presentations: '',
    creditChecks: '',
    closes: '',
    revenue: '',
    bodyLanguage: 7,
    excitement: 7,
    authenticity: 8,
    smile: 8,
    tonality: 7,
    notes: '',
  });
  const [coaching, setCoaching] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadExistingData();
  }, [date]);

  const loadExistingData = async () => {
    setLoading(true);
    try {
      const result = await getDailyPerformance(user.id, { date });
      if (result && result.length > 0 && result[0].date === date) {
        const existing = result[0];
        setFormData({
          contacts: existing.contacts || '',
          turnAndBurns: existing.turn_and_burns || '',
          presentations: existing.presentations || '',
          creditChecks: existing.credit_checks || '',
          closes: existing.closes || '',
          revenue: existing.revenue || '',
          bodyLanguage: existing.body_language || 7,
          excitement: existing.excitement || 7,
          authenticity: existing.authenticity || 8,
          smile: existing.smile || 8,
          tonality: existing.tonality || 7,
          notes: existing.notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to load existing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPreviousDay = async () => {
    try {
      const previousDay = await getPreviousDayPerformance(user.id, date);
      if (previousDay) {
        setFormData({
          contacts: previousDay.contacts || '',
          turnAndBurns: previousDay.turn_and_burns || '',
          presentations: previousDay.presentations || '',
          creditChecks: previousDay.credit_checks || '',
          closes: previousDay.closes || '',
          revenue: previousDay.revenue || '',
          bodyLanguage: previousDay.body_language || 7,
          excitement: previousDay.excitement || 7,
          authenticity: previousDay.authenticity || 8,
          smile: previousDay.smile || 8,
          tonality: previousDay.tonality || 7,
          notes: '',
        });
      } else {
        alert('No previous day data found to copy.');
      }
    } catch (error) {
      console.error('Failed to copy previous day:', error);
      alert('Failed to copy previous day data.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Convert to numbers for validation
    const data = {
      contacts: parseInt(formData.contacts) || 0,
      presentations: parseInt(formData.presentations) || 0,
      creditChecks: parseInt(formData.creditChecks) || 0,
      closes: parseInt(formData.closes) || 0,
      revenue: parseFloat(formData.revenue) || 0,
    };

    // Validate
    const validation = validatePerformanceData(data);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitDailyPerformance(user.id, {
        date,
        contacts: data.contacts,
        turnAndBurns: parseInt(formData.turnAndBurns) || 0,
        presentations: data.presentations,
        creditChecks: data.creditChecks,
        closes: data.closes,
        revenue: data.revenue,
        bodyLanguage: parseInt(formData.bodyLanguage),
        excitement: parseInt(formData.excitement),
        authenticity: parseInt(formData.authenticity),
        smile: parseInt(formData.smile),
        tonality: parseInt(formData.tonality),
        notes: formData.notes,
      });

      setCoaching(result.coaching);
      setShowSuccess(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Failed to submit performance:', error);
      alert('Failed to submit performance data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card bg-green-50 border-green-200">
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Performance Submitted Successfully!
            </h2>
            <p className="text-green-700">
              Redirecting to dashboard...
            </p>
          </div>
        </div>

        {coaching && <CoachingCard coaching={coaching} />}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Daily Performance Entry</h1>
          <button
            type="button"
            onClick={handleCopyPreviousDay}
            className="btn-secondary text-sm"
          >
            Copy Previous Day
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={formatDate(new Date())}
            />
          </div>

          {/* Daily Numbers */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Daily Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Contacts <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="contacts"
                  className={`input ${errors.contacts ? 'border-red-500' : ''}`}
                  value={formData.contacts}
                  onChange={handleChange}
                  min="0"
                  required
                />
                {errors.contacts && (
                  <p className="text-red-500 text-sm mt-1">{errors.contacts}</p>
                )}
              </div>

              <div>
                <label className="label">Turn & Burns</label>
                <input
                  type="number"
                  name="turnAndBurns"
                  className="input"
                  value={formData.turnAndBurns}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div>
                <label className="label">
                  Presentations <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="presentations"
                  className={`input ${errors.presentations ? 'border-red-500' : ''}`}
                  value={formData.presentations}
                  onChange={handleChange}
                  min="0"
                  required
                />
                {errors.presentations && (
                  <p className="text-red-500 text-sm mt-1">{errors.presentations}</p>
                )}
              </div>

              <div>
                <label className="label">
                  Credit Checks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="creditChecks"
                  className={`input ${errors.creditChecks ? 'border-red-500' : ''}`}
                  value={formData.creditChecks}
                  onChange={handleChange}
                  min="0"
                  required
                />
                {errors.creditChecks && (
                  <p className="text-red-500 text-sm mt-1">{errors.creditChecks}</p>
                )}
              </div>

              <div>
                <label className="label">
                  Closes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="closes"
                  className={`input ${errors.closes ? 'border-red-500' : ''}`}
                  value={formData.closes}
                  onChange={handleChange}
                  min="0"
                  required
                />
                {errors.closes && (
                  <p className="text-red-500 text-sm mt-1">{errors.closes}</p>
                )}
              </div>

              <div>
                <label className="label">
                  Revenue ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="revenue"
                  className={`input ${errors.revenue ? 'border-red-500' : ''}`}
                  value={formData.revenue}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
                {errors.revenue && (
                  <p className="text-red-500 text-sm mt-1">{errors.revenue}</p>
                )}
              </div>
            </div>
          </div>

          {/* BEAST Factors */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">BEAST Factors (1-10)</h2>
            <div className="space-y-4">
              {[
                { name: 'bodyLanguage', label: 'Body Language' },
                { name: 'excitement', label: 'Excitement' },
                { name: 'authenticity', label: 'Authenticity' },
                { name: 'smile', label: 'Smile' },
                { name: 'tonality', label: 'Tonality' },
              ].map((factor) => (
                <div key={factor.name}>
                  <label className="label flex justify-between">
                    <span>{factor.label}</span>
                    <span className="font-bold">{formData[factor.name]}</span>
                  </label>
                  <input
                    type="range"
                    name={factor.name}
                    className="w-full"
                    value={formData[factor.name]}
                    onChange={handleChange}
                    min="1"
                    max="10"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <label className="label">Notes (optional)</label>
            <textarea
              name="notes"
              className="input"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes about today's performance..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Performance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DailyEntry;
