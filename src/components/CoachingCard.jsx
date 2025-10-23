import React from 'react';
import { getSeverityColor } from '../utils/helpers';

function CoachingCard({ coaching, onAcknowledge }) {
  if (!coaching || !coaching.message) return null;

  const severityIcons = {
    critical: '🚨',
    high: '⚠️',
    medium: '💪',
    low: '✨',
  };

  const severityLabels = {
    critical: 'CRITICAL',
    high: 'HIGH PRIORITY',
    medium: 'FOCUS AREA',
    low: 'TIP',
  };

  return (
    <div className={`card border-l-4 ${getSeverityColor(coaching.bottleneck?.severity)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">
            {severityIcons[coaching.bottleneck?.severity] || '📊'}
          </span>
          <div>
            <h3 className="font-bold text-lg">Today's Coaching</h3>
            {coaching.bottleneck && (
              <span className="text-xs font-semibold">
                {severityLabels[coaching.bottleneck.severity]}
              </span>
            )}
          </div>
        </div>
        {!coaching.acknowledged && onAcknowledge && (
          <button onClick={onAcknowledge} className="btn-primary text-sm">
            Got it!
          </button>
        )}
      </div>

      <div className="whitespace-pre-line text-sm leading-relaxed">
        {coaching.message}
      </div>

      {coaching.bottleneck && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            {coaching.bottleneck.contacts_ratio && (
              <div>
                <div className="text-gray-500">Contact Ratio</div>
                <div className="font-semibold">{coaching.bottleneck.contacts_ratio}:1</div>
              </div>
            )}
            {coaching.bottleneck.presentation_ratio && (
              <div>
                <div className="text-gray-500">Presentation Ratio</div>
                <div className="font-semibold">{coaching.bottleneck.presentation_ratio}:1</div>
              </div>
            )}
            {coaching.bottleneck.close_rate && (
              <div>
                <div className="text-gray-500">Close Rate</div>
                <div className="font-semibold">{coaching.bottleneck.close_rate}%</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CoachingCard;
