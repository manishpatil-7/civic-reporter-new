import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const steps = [
  { key: 'Pending', label: 'Submitted', icon: AlertTriangle, color: 'orange' },
  { key: 'In Progress', label: 'In Progress', icon: Clock, color: 'blue' },
  { key: 'Resolved', label: 'Resolved', icon: CheckCircle2, color: 'emerald' },
];

const statusIndex = { 'Pending': 0, 'In Progress': 1, 'Resolved': 2 };

const StatusTracker = ({ status = 'Pending', compact = false }) => {
  const currentIdx = statusIndex[status] ?? 0;

  // Static maps for tailwind colors
  const activeDotStyles = {
    orange: 'bg-orange-500 shadow-sm shadow-orange-500/30',
    blue: 'bg-blue-500 shadow-sm shadow-blue-500/30',
    emerald: 'bg-emerald-500 shadow-sm shadow-emerald-500/30',
  };

  const activeLineStyles = {
    orange: 'bg-orange-300',
    blue: 'bg-blue-300',
    emerald: 'bg-emerald-300',
  };

  const currentIconStyles = {
    orange: 'bg-orange-100 border-2 border-orange-500 shadow-md shadow-orange-500/20 text-orange-600',
    blue: 'bg-blue-100 border-2 border-blue-500 shadow-md shadow-blue-500/20 text-blue-600',
    emerald: 'bg-emerald-100 border-2 border-emerald-500 shadow-md shadow-emerald-500/20 text-emerald-600',
  };

  const activeIconStyles = {
    orange: 'bg-orange-50 border border-orange-300 text-orange-500',
    blue: 'bg-blue-50 border border-blue-300 text-blue-500',
    emerald: 'bg-emerald-50 border border-emerald-300 text-emerald-500',
  };

  const activeTextStyles = {
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIdx;
          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isActive ? activeDotStyles[step.color] : 'bg-gray-200'
                }`}
              />
              {idx < steps.length - 1 && (
                <div
                  className={`w-4 h-0.5 ${
                    idx < currentIdx ? activeLineStyles[steps[idx + 1].color] : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        
        let iconStyle = 'bg-gray-50 border border-gray-200 text-gray-400';
        if (isCurrent) iconStyle = currentIconStyles[step.color];
        else if (isActive) iconStyle = activeIconStyles[step.color];

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${iconStyle}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isCurrent ? activeTextStyles[step.color] : isActive ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                  idx < currentIdx
                    ? 'bg-emerald-300'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;
