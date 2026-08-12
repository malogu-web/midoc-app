export default function GraciasPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f9fafb",
      padding: "2rem",
      textAlign: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "3rem 2.5rem",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        <div style={{ fontSize: "56px", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", marginBottom: "0.75rem" }}>
          ¡Bienvenido al Founders Club!
        </h1>
        <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: "1.7", marginBottom: "1.5rem" }}>
          Su lugar está reservado como uno de los primeros 100 médicos fundadores de MIDOC con precio congelado de <strong>$2,499 MXN/mes</strong> de por vida.
        </p>
        <div style={{
          background: "#E1F5EE",
          borderRadius: "10px",
          padding: "1rem",
          marginBottom: "1.5rem",
          fontSize: "14px",
          color: "#085041",
          lineHeight: "1.9"
        }}>
          ✅ Recibirá una llamada en las próximas 24 horas<br/>
          ✅ Acceso anticipado a la plataforma<br/>
          ✅ Precio $2,499/mes congelado para siempre
        </div>
        <a href="/" style={{
          display: "inline-block",
          background: "#1D9E75",
          color: "white",
          padding: "12px 28px",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "15px",
          textDecoration: "none"
        }}>
          Volver al inicio →
        </a>
      </div>
    </div>
  );
}