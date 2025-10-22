import { CopyOnClick } from '@/components/common/CopyOnClick';

/**
 * Examples of how to use CopyOnClick in the companies table
 */

// Example 1: Website URL with clickable link
export const WebsiteURLWithCopy = ({ url }: { url: string }) => (
  <CopyOnClick textToCopy={url} preventCopyOnChildClick={true}>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-blue-600 hover:underline"
      onClick={(e) => e.stopPropagation()} // Extra safety to prevent copy on link click
    >
      {url}
    </a>
  </CopyOnClick>
);

// Example 2: VAT Number with copy
export const VATNumberWithCopy = ({ vatNumber }: { vatNumber: string }) => (
  <CopyOnClick textToCopy={vatNumber}>
    <span className="font-mono text-gray-700 dark:text-gray-400">{vatNumber}</span>
  </CopyOnClick>
);

// Example 3: Email with copy
export const EmailWithCopy = ({ email }: { email: string }) => (
  <CopyOnClick textToCopy={email}>
    <span className="text-blue-600 hover:text-blue-800">📧 {email}</span>
  </CopyOnClick>
);

// Example 4: Phone number with copy
export const PhoneWithCopy = ({ phone, icon }: { phone: string; icon?: string }) => (
  <CopyOnClick textToCopy={phone}>
    <span className="text-gray-600 dark:text-gray-400">
      {icon} {phone}
    </span>
  </CopyOnClick>
);

// Example 5: Account number with copy
export const AccountNumberWithCopy = ({ accountNumber, label }: { accountNumber: string; label: string }) => (
  <CopyOnClick textToCopy={accountNumber}>
    <div className="text-gray-600 dark:text-gray-400">
      {label}: <span className="font-mono">{accountNumber}</span>
    </div>
  </CopyOnClick>
);

/**
 * How to integrate in your CompaniesList.tsx:
 *
 * 1. Import the component:
 * import { CopyOnClick } from '@/components/common/CopyOnClick';
 *
 * 2. Replace existing cells with copy functionality:
 *
 * // For VAT Number:
 * <TableCell className="text-theme-sm px-5 py-4">
 *   <CopyOnClick textToCopy={company.vat_number}>
 *     <span className="text-gray-600 dark:text-gray-400 font-mono">
 *       {company.vat_number}
 *     </span>
 *   </CopyOnClick>
 * </TableCell>
 *
 * // For Website URL:
 * <TableCell className="text-theme-sm px-5 py-4 max-w-32">
 *   {company.website_url ? (
 *     <CopyOnClick textToCopy={company.website_url}>
 *       <a
 *         href={company.website_url}
 *         target="_blank"
 *         rel="noopener noreferrer"
 *         className="text-blue-600 hover:underline break-all"
 *       >
 *         {company.website_url}
 *       </a>
 *     </CopyOnClick>
 *   ) : (
 *     '-'
 *   )}
 * </TableCell>
 *
 * // For Email in Contact column:
 * {company.email && (
 *   <CopyOnClick textToCopy={company.email}>
 *     <div className="text-gray-600 dark:text-gray-400">📧 {company.email}</div>
 *   </CopyOnClick>
 * )}
 *
 * // For Phone numbers:
 * {company.telephone_number && (
 *   <CopyOnClick textToCopy={company.telephone_number}>
 *     <div className="text-gray-600 dark:text-gray-400">📞 {company.telephone_number}</div>
 *   </CopyOnClick>
 * )}
 *
 * // For Account numbers:
 * {company.main_account_number && (
 *   <CopyOnClick textToCopy={company.main_account_number}>
 *     <div className="text-gray-600 dark:text-gray-400">Main: {company.main_account_number}</div>
 *   </CopyOnClick>
 * )}
 */
