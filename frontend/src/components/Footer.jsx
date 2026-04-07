export function Footer() {
  return (
    <footer className="page" style={{ paddingTop: 0, opacity: 0.85, fontSize: '0.85rem' }}>
      <p style={{ margin: 0 }}>
        GreenTrace — custodial chain &amp; geospatial mapping for DENR seedling reconciliation. Map data ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          OpenStreetMap
        </a>{' '}
        contributors.
      </p>
    </footer>
  );
}
