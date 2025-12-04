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
      className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6 text-section-links"
      dangerouslySetInnerHTML={{ __html: paragraph }}
    />
  ));
};

export function TextSection({
  content = `
During the June 2025 strikes against Iran’s nuclear program, the United States and Israel did serious damage to the Islamic Republic’s ability to make nuclear weapons.

Prior to the strikes, Tehran was only months from being able to construct nuclear weapons. It <a href="https://www.fdd.org/analysis/visuals/2024/05/23/what-to-know-about-irans-nuclear-program/" target="_blank">possessed</a> the key facilities necessary and had produced enough enriched uranium — if further enriched to weapons grade — for up to 22 nuclear weapons in five months, with enough ready for 11 weapons within a month. Iran was reportedly working to accelerate its ability to <a href="https://www.fdd.org/iranianweaponization" target="_blank">weaponize</a> the material and construct the weapons and had a team of scientists <a href="https://www.nytimes.com/2025/02/03/us/politics/iran-nuclear-weapon.html" target="_blank">working</a> on various projects in preparation for a final order from Iran's supreme leader.

While information is still developing, the United States and Israel eliminated or severely damaged at least two centrifuge manufacturing and assembly facilities; two centrifuge testing and development sites; several uranium fuel manufacturing facilities, chiefly for fueling reactors; a facility that converts uranium yellowcake for subsequent enrichment; three uranium enrichment plants; enriched uranium storage locations; and Iran’s route to weapons-grade plutonium via a heavy-water production plant and plutonium-producing reactor. In addition, Israel severely crippled Tehran’s route to weaponization, eliminating not only its known ability to make the necessary weapons-grade uranium metal for the core of a nuclear weapon, but also the administrative centers of the nuclear weapons program; at least 10 facilities related to various weaponization steps; and more than a dozen nuclear scientists.

Iran may seek to recover buried assets and reconstitute its capabilities to build nuclear weapons. Its success will depend on its ability to unstop key bottlenecks, as shown in the visual below.
`,
  width
}: TextSectionProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div
        className="prose prose-sm sm:prose-lg max-w-none"
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