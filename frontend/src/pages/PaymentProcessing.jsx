import { apiFetch } from "../api";

export default function PaymentProcessing() {
  const [status, setStatus] = useState("checking...");
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiFetch(`/payment_status/${orderId}/`);
        setStatus(data.status);

        if (data.status === "PAID") {
          clearInterval(interval);
          window.location.href = "/payment-success";
        }

        if (data.status === "FAILED") {
          clearInterval(interval);
          window.location.href = "/payment-failed";
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000); // poll every 3 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div style={{ padding: 40 }}>
      <h2>Processing your payment...</h2>
      <p>Status: {status}</p>
      <p>You can close this window if it takes too long.</p>
    </div>
  );
}
