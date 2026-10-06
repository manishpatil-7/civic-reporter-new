import React from 'react';

const Badge = ({ children, icon: Icon, className = "" }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#EDE9FE] text-[#7C3AED] ${className}`}>
      {Icon && <span className="flex items-center justify-center w-3 h-3">{Icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
