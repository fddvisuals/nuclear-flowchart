import Papa from 'papaparse';
import { RelatedProduct, ParsedRelatedProduct } from '../types/relatedProducts';

export async function fetchRelatedProductsData(): Promise<ParsedRelatedProduct[]> {
  const csvUrl = import.meta.env.VITE_RELATED_PRODUCTS_CSV_URL;
  
  if (!csvUrl) {
    throw new Error('Related products CSV URL not configured');
  }

  try {
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvData = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<RelatedProduct>(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Clean and normalize header names
          const cleaned = header.trim().toLowerCase();
          if (cleaned === 'title') return 'title';
          if (cleaned === 'author') return 'author';
          if (cleaned === 'date') return 'date';
          if (cleaned === 'source') return 'source';
          if (cleaned === 'link') return 'link';
          return cleaned;
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          
          const parsedData: ParsedRelatedProduct[] = results.data
            .filter((row: any) => row.title && row.title.trim() !== '')
            .map((row: any, index: number) => ({
              id: `product-${index}`,
              title: row.title?.trim() || '',
              author: row.author?.trim() || '',
              date: row.date?.trim() || '',
              source: row.source?.trim() || '',
              link: row.link?.trim() || '',
            }));
          
          resolve(parsedData);
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  } catch (error) {
    console.error('Error fetching related products data:', error);
    throw error;
  }
}
