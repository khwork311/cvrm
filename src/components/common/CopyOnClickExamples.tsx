import { CopyOnClick } from '@/components/common/CopyOnClick';

/**
 * Example usage of CopyOnClick component
 * This shows different ways to use the component
 */
export const CopyOnClickExamples = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">CopyOnClick Component Examples</h2>

      {/* Basic Usage */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic Usage</h3>
        <CopyOnClick textToCopy="hello@example.com">
          <span className="text-blue-600">hello@example.com</span>
        </CopyOnClick>
      </div>

      {/* URL Example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Website URL</h3>
        <CopyOnClick textToCopy="https://www.example.com">
          <a
            href="https://www.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()} // Prevent copy when clicking link
          >
            https://www.example.com
          </a>
        </CopyOnClick>
      </div>

      {/* VAT Number Example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">VAT Number</h3>
        <CopyOnClick textToCopy="VAT-123456789">
          <span className="font-mono text-gray-700">VAT-123456789</span>
        </CopyOnClick>
      </div>

      {/* Phone Number Example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Phone Number</h3>
        <CopyOnClick textToCopy="+966-55-123-4567">
          <span className="text-gray-600">📞 +966-55-123-4567</span>
        </CopyOnClick>
      </div>

      {/* Account Number Example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Account Number</h3>
        <CopyOnClick textToCopy="ACC-001-MAIN">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm">ACC-001-MAIN</code>
        </CopyOnClick>
      </div>

      {/* Custom Messages */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Messages</h3>
        <CopyOnClick
          textToCopy="secret-api-key-12345"
          successMessage="API Key copied successfully!"
          errorMessage="Failed to copy API key"
        >
          <span className="rounded bg-yellow-100 px-2 py-1 font-mono text-sm">secret-api-key-12345</span>
        </CopyOnClick>
      </div>

      {/* Without Icon */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Without Copy Icon</h3>
        <CopyOnClick textToCopy="no-icon-example" showIcon={false}>
          <span className="text-purple-600">Click to copy (no icon)</span>
        </CopyOnClick>
      </div>

      {/* Disabled State */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Disabled State</h3>
        <CopyOnClick textToCopy="disabled-example" disabled>
          <span className="text-gray-400">This cannot be copied</span>
        </CopyOnClick>
      </div>

      {/* Different Display vs Copy Text */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Different Display vs Copy Text</h3>
        <CopyOnClick textToCopy="user@company.com">
          <span className="text-green-600">Click to copy email</span>
        </CopyOnClick>
      </div>
    </div>
  );
};
