import os
import requests
from django.conf import settings

class PesapalAPI:
    def __init__(self):
        # Load KEY & SECRET at runtime (after .env is loaded)
        self.key = os.getenv("PESAPAL_CONSUMER_KEY") or settings.PESAPAL_CONSUMER_KEY
        self.secret = os.getenv("PESAPAL_CONSUMER_SECRET") or settings.PESAPAL_CONSUMER_SECRET
        self.base = settings.PESAPAL_API_URL

        if not self.key or not self.secret:
            raise Exception("Pesapal KEY or SECRET missing. Check .env or environment variables.")

    def get_token(self):
        url = f"{self.base}/api/Auth/RequestToken"
        payload = {
            "consumer_key": self.key,
            "consumer_secret": self.secret,
        }

        resp = requests.post(url, json=payload)
        try:
            data = resp.json()
        except:
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
                "first_name": order.shipping_address.get("first_name", ""),
                "last_name": order.shipping_address.get("last_name", ""),
            },
        }

        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(url, json=payload, headers=headers)

        resp.raise_for_status()
        data = resp.json()

        return data["redirect_url"]

# IMPORTANT: create API fresh on each request
def get_pesapal_api():
    return PesapalAPI()
