export interface RelatedProduct {
  title: string;
  author: string;
  date: string;
  source: string;
  link: string;
}

export interface ParsedRelatedProduct extends RelatedProduct {
  id: string;
}
