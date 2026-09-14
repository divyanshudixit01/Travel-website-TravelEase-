import { useEffect, useRef } from 'react';

/**
 * JsonLd — Injects JSON-LD structured data into the document <head>.
 * 
 * Usage:
 *   <JsonLd data={schemaObject} />
 *   <JsonLd data={[schema1, schema2]} />
 * 
 * Automatically cleans up on unmount and prevents redundant DOM re-injections.
 */
const JsonLd = ({ data }) => {
  const scriptRef = useRef(null);
  const prevSerializedRef = useRef('');

  useEffect(() => {
    if (!data) return;

    const nextSerialized = JSON.stringify(data, null, 0);

    // If content has not changed and element is already mounted, bypass DOM churn
    if (scriptRef.current && prevSerializedRef.current === nextSerialized && scriptRef.current.parentNode) {
      return;
    }

    prevSerializedRef.current = nextSerialized;

    // Update existing script element if present
    if (scriptRef.current && scriptRef.current.parentNode) {
      scriptRef.current.textContent = nextSerialized;
      return;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = nextSerialized;
    script.setAttribute('data-schema-component', 'true');
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Clean up on unmount to prevent stale schemas on route change
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
        prevSerializedRef.current = '';
      }
    };
  }, [data]);

  return null;
};

export default JsonLd;
