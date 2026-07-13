import React from 'react';
import type { IbbhStatus } from '../../types/bianchi';

interface IbbhBadgeProps {
  status: IbbhStatus;
}

interface BadgeConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<IbbhStatus, BadgeConfig> = {
  regenerativo: {
    label: 'Hábitat Regenerativo',
    className: 'bg-emerald-50 border-emerald-300 text-emerald-700',
  },
  saludable: {
    label: 'Hábitat Saludable',
    className: 'bg-green-50 border-green-200 text-green-700',
  },
  funcional: {
    label: 'Hábitat Funcional',
    className: 'bg-amber-50 border-amber-300 text-amber-700',
  },
  vulnerable: {
    label: 'Hábitat Vulnerable',
    className: 'bg-red-50 border-red-300 text-red-700',
  },
  exigente: {
    label: 'Hábitat Exigente',
    className: 'bg-red-100 border-red-400 text-red-800',
  },
};

export const IbbhBadge: React.FC<IbbhBadgeProps> = ({ status }) => {
  const { label, className } = STATUS_CONFIG[status];

  return (
    <span
      className={[
        'px-5 py-2',
        'rounded-full',
        'text-xs uppercase tracking-widest font-medium',
        'font-sans',
        'border',
        'inline-flex items-center justify-center',
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
};

export default IbbhBadge;
