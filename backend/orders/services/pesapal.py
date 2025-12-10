import requests
from django.conf import settings

class PesapalAPI:
    def __init__(self):
        print("🔥 PesapalAPI __init__ LOADED VALUES:")
        print("   → CONSUMER KEY   :", repr(settings.PESAPAL_CONSUMER_KEY))
        print("   → CONSUMER SECRET:", repr(settings.PESAPAL_CONSUMER_SECRET))
        print("   → url:", repr(settings.PESAPAL_API_URL))

        self.key = settings.PESAPAL_CONSUMER_KEY
        self.secret = settings.PESAPAL_CONSUMER_SECRET
        self.base = settings.PESAPAL_API_URL

    def _ensure_credentials(self):
        if not self.key or not self.secret:
            raise Exception(
                f"Missing Pesapal creds. "
                f"KEY={repr(self.key)} SECRET={repr(self.secret)}"
            )

    def get_token(self):
        # Check creds before doing network call
        self._ensure_credentials()

        url = f"{self.base}/api/Auth/RequestToken"
        payload = {
            "consumer_key": self.key,
            "consumer_secret": self.secret,
        }

        print("🔵 Requesting Pesapal token with payload:", payload)

        resp = requests.post(url, json=payload, timeout=10)

        print("🔵 Pesapal token status:", resp.status_code)
        print("🔵 Pesapal token raw response:", resp.text)

        try:
            data = resp.json()
        except Exception:
            raise Exception(f"Pesapal returned non-JSON: {resp.text}")

        if "token" not in data:
            raise Exception(f"Pesapal token request failed. Response was: {data}")

        return data["token"]

    def create_order(self, order, email, phone):
        token = self.get_token()
        url = f"{self.base}/api/Transactions/SubmitOrderRequest"

        payload = {
            "id": str(order.id),
            "currency": "KES",
            "amount": float(order.total),
            "description": f"Order #{order.id}",
            "callback_url": settings.PESAPAL_CALLBACK_URL,
            "notification_id": settings.PESAPAL_IPN_ID,
            "billing_address": {
                "email_address": email,
                "phone_number": phone,
                "first_name": (order.shipping_address or {}).get("first_name", ""),
                "last_name": (order.shipping_address or {}).get("last_name", ""),
            },
        }

        print("🔵 Sending Pesapal order payload:", payload)

        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(url, json=payload, headers=headers, timeout=15)

        print("🔵 Pesapal order status:", resp.status_code)
        print("🔵 Pesapal order raw response:", resp.text)

        resp.raise_for_status()

        data = resp.json()
        if "redirect_url" not in data:
            raise Exception(f"Pesapal invalid response: {data}")

        return data["redirect_url"]


def get_pesapal_api():
    return PesapalAPI()
