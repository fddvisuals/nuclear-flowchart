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
  content = `Lorem ipsum dolor sit amet finibus donec condimentum. Lectus torquent sit primis si consequat tellus erat tincidunt dictumst. Efficitur porta arcu augue letius lobortis. Velit etiam non ullamcorper condimentum tempus elementum ante justo. Massa dapibus quis nostra dis fringilla ullamcorper aliquam nullam at.

Tempor quisque blandit mattis ornare integer lobortis vulputate. Eget elit ornare lobortis dolor aliquam mus vitae est. Justo at nunc tempus laoreet convallis ligula cubilia ultrices orci hac sem. Sodales vestibulum tincidunt sed parturient himenaeos facilisis nam interdum rutrum. Tellus netus viverra fringilla laoreet vivamus amet fusce.

Viverra duis litora diam est mus facilisi ex quam faucibus eleifend. Dapibus ligula mauris felis est ultrices pede pretium. Odio elementum risus curabitur finibus hendrerit euismod commodo dictumst. Mi enim eu a felis sagittis vestibulum viverra luctus lobortis. Turpis eget facilisis tellus nostra nulla erat neque id. Efficitur ad etiam amet mi neque consectetuer nunc netus. Dui habitasse ornare purus rutrum fames cubilia porttitor.`,
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