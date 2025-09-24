interface TextSectionProps {
  content?: string;
  width?: string;
}

// Shared function to render paragraphs consistently
const renderParagraphs = (content: string) => {
  // Split by double line breaks or <p> tags to identify paragraphs
  const paragraphs = content
    .split(/\n\s*\n|<\/p>\s*<p[^>]*>|<p[^>]*>|<\/p>/)
    .filter(para => para.trim() && !para.match(/^\s*$/))
    .map(para => para.trim());

  return paragraphs.map((paragraph, index) => (
    <p
      key={index}
      className="text-lg text-gray-700 leading-relaxed mb-6"
      dangerouslySetInnerHTML={{ __html: paragraph }}
    />
  ));
};

export function TextSection({ 
  content = `Following coordinated strikes by Israeli and U.S. forces on Iran's nuclear infrastructure, significant bottlenecks have emerged across the Islamic Republic's nuclear weapons supply chain. This interactive analysis examines the impact of these operations on Iran's nuclear capabilities, mapping damage assessments and supply chain disruptions.

The strikes targeted key facilities across Iran's nuclear fuel production and weaponization programs, causing unprecedented disruption to the regime's nuclear ambitions. Intelligence assessments indicate that critical manufacturing capabilities have been severely compromised, potentially setting back Iran's nuclear weapons program by several years.

This visualization provides a comprehensive overview of the affected facilities, their operational status, and the cascading effects on Iran's nuclear supply chain. Users can explore both flowchart and stack views to understand the interconnected nature of Iran's nuclear infrastructure and the strategic impact of the coordinated strikes.`,
  width
}: TextSectionProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div 
        className="prose prose-lg max-w-none"
        style={width ? { maxWidth: width } : undefined}
      >
        {renderParagraphs(content)}
      </div>
    </div>
  );
}

export function MethodologySection() {
  const methodologyContent = `This analysis is based on open-source intelligence, satellite imagery, and verified reports from multiple intelligence agencies. Each facility assessment includes operational status verification, damage assessment, and supply chain impact analysis. The data represents the most current available information as of the assessment date and is updated as new intelligence becomes available.`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-gray-50">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Methodology</h3>
      <div className="prose prose-lg max-w-none">
        {renderParagraphs(methodologyContent)}
      </div>
    </div>
  );
}