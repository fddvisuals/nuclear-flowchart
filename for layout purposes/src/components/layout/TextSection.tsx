import styles from "../../styles/components/TextSection.module.css";

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
      className={styles.textContentText}
      dangerouslySetInnerHTML={{ __html: paragraph }}
    />
  ));
};

export function TextSection({ 
  content = `Following the war between Israel and Iran in June, the conflict has <a href="https://www.fdd.org/analysis/2025/07/08/the-iran-israel-war-returns-to-the-shadows-for-now/" target="_blank">slid</a> back into the shadows. Inside Iran’s territory, a series of explosions has <a href="https://www.longwarjournal.org/archives/2025/07/mysterious-wave-of-explosions-sudden-irgc-death-disrupt-post-ceasefire-calm-in-iran.php" target="_blank">caused</a> suspicion. Israel’s deep <a href="https://www.cnn.com/2025/06/13/middleeast/israel-attack-iran-mossad-analysis-latam-intl" target="_blank">intelligence penetration</a> of the country, as demonstrated by the 12-Day War, raises the question: are these explosions sabotage operations? However, the Islamic regime has downplayed the events, attributing many to gas leaks or other accidents. While Jerusalem has not addressed the events, it may be behind these explosions, seeking to strengthen Israel’s position vis-à-vis the Islamic Republic in anticipation of another round of fighting. For its part, Tehran continues to stoke violence by <a href="https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4246960/yemeni-partners-successfully-interdict-massive-iranian-weapons-shipment-bound-f/" target="_blank">arming</a> the Houthis, the regime’s terrorist partner in Yemen, as the group launches missiles and drones at the Jewish state. The Islamic regime itself threatens the West with <a href="https://thehill.com/policy/national-security/5363528-us-border-patrol-iranian-sleeper-cells-threat/" target="_blank">sleeper cells</a> and <a href="https://www.cisa.gov/sites/default/files/2025-06/joint-fact-sheet-Iranian-cyber-actors-may-target-vulnerable-US-networks-and-entities-of-interest-508c-1.pdf" target="_blank">cyberattacks</a> amidst calls from clerics for the <a href="https://www.fdd.org/analysis/2025/07/17/iran-is-out-to-kill-trump/" target="_blank">assassination</a> of President Trump.`,
  width
}: TextSectionProps) {
  return (
    <div className={styles.textSection}>
      <div 
        className={styles.textContent}
        style={width ? { maxWidth: width } : undefined}
      >
        {renderParagraphs(content)}
      </div>
    </div>
  );
}

export function MethodologySection() {
  const methodologyContent = `Each of the entries in this data set is based on still images or video shared by professional journalists or Iranian diaspora outlets. The individuals and outlets regularly receive content from people on the ground and publish the content after at least preliminary verification. Each entry links to the material on which it is based and corresponds to a single incident.`;

  return (
    <div className={styles.textSection}>
      <h3>Methodology</h3>
      <div className={styles.textContent}>
        {renderParagraphs(methodologyContent)}
      </div>
    </div>
  );
}

// Additional paragraph components for different content types
export function IntroductionSection({ content }: { content: string }) {
  return <TextSection content={content} />;
}

export function ConclusionSection({ content }: { content: string }) {
  return <TextSection content={content} />;
}

export function AnalysisSection({ content, width }: { content: string; width?: string }) {
  return <TextSection content={content} width={width} />;
}

export function SummarySection({ content }: { content: string }) {
  return <TextSection content={content} />;
}

export function BackgroundSection({ content }: { content: string }) {
  return <TextSection content={content} />;
}