import React, { ReactNode } from 'react';

interface Tab {
  label: string;
  value: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue = tabs[0]?.value,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <div className={className}>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.value
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  );
};
