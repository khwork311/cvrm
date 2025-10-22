import { MoreDotIcon } from '@/icons';
import { clsx } from 'clsx';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { DropdownItem } from './DropdownItem';

export interface TableAction {
  label: string;
  onClick?: () => void;
  to?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger' | 'success' | 'primary';
}

interface TableActionsDropdownProps {
  actions: TableAction[];
}

export const TableActionsDropdown: React.FC<TableActionsDropdownProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 160, // 160px is min-width of dropdown
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-toggle flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Actions"
      >
        <MoreDotIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="shadow-theme-lg fixed z-50 min-w-[160px] rounded-xl border border-gray-200 bg-white py-1 dark:border-gray-800 dark:bg-gray-900"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {actions.map((action, index) => (
            <DropdownItem
              key={index}
              tag={action.to ? 'a' : 'button'}
              to={action.to}
              onClick={action.onClick}
              onItemClick={() => setIsOpen(false)}
              baseClassName={clsx(
                `flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors`, // Default or base
                {
                  'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20':
                    action.variant === 'danger', // Variant specific
                  'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/20':
                    action.variant === 'success',
                  'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20':
                    action.variant === 'primary',
                  'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800': !action.variant, // Default
                },
                action.className // Additional custom classes
              )}
            >
              {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
              <span>{action.label}</span>
            </DropdownItem>
          ))}
        </div>
      )}
    </>
  );
};
