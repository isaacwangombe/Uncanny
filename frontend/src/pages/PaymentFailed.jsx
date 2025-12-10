export default function PaymentFailed() {
  return (
    <div style={{ textAlign: "center", padding: "60px" }}>
      <h1>❌ Payment Failed</h1>
      <p>Unfortunately, your payment was not completed.</p>
      <a href="/cart" style={{ fontSize: 18, color: "#222" }}>
        Try Again
      </a>
    </div>
  );
}
