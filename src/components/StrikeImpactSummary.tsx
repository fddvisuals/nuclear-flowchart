import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';

const StrikeImpactSummary: React.FC = () => {
  const impactCategories = [
    {
      title: 'Centrifuge Infrastructure',
      items: [
        'At least 2 manufacturing & assembly facilities',
        '2 testing & development sites',
      ],
    },
    {
      title: 'Uranium Fuel Production',
      items: [
        'Several fuel manufacturing facilities',
        '1 yellowcake conversion facility',
        '3 uranium enrichment plants',
        'Enriched uranium storage locations',
      ],
    },
    {
      title: 'Plutonium Pathway',
      items: [
        '1 heavy-water production plant',
        '1 plutonium-producing reactor',
      ],
    },
    {
      title: 'Weaponization Capabilities',
      items: [
        'Weapons-grade uranium metal production eliminated',
        'Nuclear weapons program administrative centers',
        'At least 10 weaponization-related facilities',
        'More than a dozen nuclear scientists',
      ],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 bg-red-100 text-red-700 rounded-lg mt-1">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Strike Impact Assessment
            </h2>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Information is still developing. This assessment reflects confirmed targets from Israeli and U.S. operations.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {impactCategories.map((category, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-5 border border-gray-200"
            >
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {index + 1}
                </span>
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Summary:</strong> Israel and the United States eliminated or severely damaged critical components 
            across Iran's nuclear supply chain—from centrifuge production through enrichment, fuel manufacturing, 
            plutonium pathways, and weaponization capabilities—significantly disrupting Tehran's ability to rapidly 
            develop nuclear weapons.
          </p>
        </div>
      </div>
    </section>
  );
};

export default StrikeImpactSummary;
