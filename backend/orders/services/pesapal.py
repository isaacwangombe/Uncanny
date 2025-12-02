import requests
from django.conf import settings

class PesapalAPI:
    def __init__(self):
        self.key = settings.PESAPAL_CONSUMER_KEY
        self.secret = settings.PESAPAL_CONSUMER_SECRET
        self.base = settings.PESAPAL_API_URL

    def get_token(self):
        url = f"{self.base}/api/Auth/RequestToken"
        resp = requests.post(url, json={
            "consumer_key": self.key,
            "consumer_secret": self.secret
        })
        resp.raise_for_status()
        return resp.json()["token"]

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
            }
        }

        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(url, json=payload, headers=headers)
        resp.raise_for_status()

        return resp.json()["redirect_url"]

pesapal_api = PesapalAPI()
