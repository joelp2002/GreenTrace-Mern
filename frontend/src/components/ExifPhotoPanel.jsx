import { useState } from 'react';
import exifr from 'exifr';
import { assetUrl } from '../services/api';

/**
 * Client-side EXIF extraction with exifr; shows GPS + capture time when present.
 */
export function ExifPhotoPanel({ imageFile, imageUrl }) {
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function run() {
    setErr('');
    setBusy(true);
    setMeta(null);
    try {
      let data;
      if (imageFile) {
        data = await exifr.parse(imageFile, {
          gps: true,
          pick: ['DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'Make', 'Model'],
        });
      } else if (imageUrl) {
        data = await exifr.parse(imageUrl, {
          gps: true,
          pick: ['DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'Make', 'Model'],
        });
      }
      setMeta(data || {});
    } catch (e) {
      setErr(e.message || 'Could not read EXIF');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Photo &amp; EXIF (client)</h3>
      {(imageFile || imageUrl) && (
        <div style={{ marginBottom: '0.75rem' }}>
          {imageFile && (
            <img
              alt="Preview"
              src={URL.createObjectURL(imageFile)}
              style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8 }}
            />
          )}
          {!imageFile && imageUrl && (
            <img
              alt="Uploaded"
              src={assetUrl(imageUrl)}
              style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8 }}
            />
          )}
        </div>
      )}
      <button type="button" className="btn btn-ghost" onClick={run} disabled={busy || (!imageFile && !imageUrl)}>
        {busy ? 'Reading…' : 'Extract EXIF'}
      </button>
      {err && <p className="alert alert-error" style={{ marginTop: '0.75rem' }}>{err}</p>}
      {meta && (
        <pre
          style={{
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            background: '#f8fafc',
            padding: '0.75rem',
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(meta, null, 2)}
        </pre>
      )}
    </div>
  );
}
