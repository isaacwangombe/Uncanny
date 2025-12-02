import requests
from django.conf import settings


class PesapalAPI:
    def __init__(self):
        # Load KEY & SECRET at runtime (after .env/settings are available)
        self.key = settings.PESAPAL_CONSUMER_KEY
        self.secret = settings.PESAPAL_CONSUMER_SECRET
        self.base = settings.PESAPAL_API_URL

        # don't raise at import time if missing — raise when actually used
        # (we'll still validate in get_token/create_order)
    
    def _ensure_credentials(self):
        if not self.key or not self.secret:
            raise Exception("Pesapal KEY or SECRET missing. Check .env or environment variables.")

    def get_token(self):
        self._ensure_credentials()
        url = f"{self.base}/api/Auth/RequestToken"
        payload = {
            "consumer_key": self.key,
            "consumer_secret": self.secret,
        }

        resp = requests.post(url, json=payload, timeout=10)

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
            "notification_id": str(order.id),
            "billing_address": {
                "email_address": email,
                "phone_number": phone,
                "first_name": (order.shipping_address or {}).get("first_name", ""),
                "last_name": (order.shipping_address or {}).get("last_name", ""),
            },
        }

        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()

        data = resp.json()
        # make sure redirect_url exists
        if "redirect_url" not in data:
            raise Exception(f"Pesapal create order unexpected response: {data}")

        return data["redirect_url"]


def get_pesapal_api():
    """
    Factory that returns a fresh PesapalAPI instance.
    Use this inside views when you need to talk to Pesapal.
    Avoid creating a global instance at import time to prevent import-time raises.
    """
    return PesapalAPI()
