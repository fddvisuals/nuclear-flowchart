import { useEffect, useState } from 'react';
import styles from '../../styles/components/RelatedProducts.module.css';
import { ParsedRelatedProduct } from '../../types/relatedProducts';
import { fetchRelatedProductsData } from '../../lib/utils/relatedProductsData';

interface RelatedProductsProps {
  title?: string;
  maxHeight?: string;
}

export function RelatedProducts({ 
  title = "Related Products",
  maxHeight = "400px"
}: RelatedProductsProps) {
  const [products, setProducts] = useState<ParsedRelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchRelatedProductsData();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load related products');
        console.error('Error loading related products:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleProductClick = (link: string) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.relatedProducts}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.container} style={{ maxHeight }}>
          <div className={styles.loading}>Loading related products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.relatedProducts}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.container} style={{ maxHeight }}>
          <div className={styles.error}>
            Error loading related products: {error}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.relatedProducts}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.container} style={{ maxHeight }}>
          <div className={styles.empty}>No related products available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.relatedProducts}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.container} style={{ maxHeight }}>
        <div className={styles.header}>
          <div>Title</div>
          <div>Author</div>
          <div>Date</div>
          <div>Source</div>
        </div>
        
        {products.map((product) => (
          <div
            key={product.id}
            className={styles.productItem}
            onClick={() => handleProductClick(product.link)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProductClick(product.link);
              }
            }}
            aria-label={`Open ${product.title} by ${product.author}`}
          >
            <div className={styles.productTitle}>
              {product.title}
            </div>
            <div className={styles.productAuthor}>
              {product.author}
            </div>
            <div className={styles.productDate}>
                    {product.date} | {product.source}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
