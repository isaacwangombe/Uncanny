import requests
from django.conf import settings


def get_token():
    url = f"{settings.PESAPAL_API_URL}/api/Auth/RequestToken"
    payload = {
        "consumer_key": settings.PESAPAL_CONSUMER_KEY,
        "consumer_secret": settings.PESAPAL_CONSUMER_SECRET,
    }

    res = requests.post(url, json=payload, timeout=10)
    print("TOKEN RESPONSE:", res.text)

    data = res.json()
    if "token" not in data:
        raise Exception(f"Failed to get token: {data}")
    return data["token"]


def register_ipn():
    token = get_token()

    # FIX: correct Pesapal endpoint
    url = f"{settings.PESAPAL_API_URL}/api/URLSetup/RegisterIPN"

    payload = {
        "url": settings.PESAPAL_CALLBACK_URL,
        "ipn_notification_type": "POST"
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    res = requests.post(url, json=payload, headers=headers)
    print("STATUS:", res.status_code)
    print("RESPONSE:", res.text)

    data = res.json()

    if "ipn_id" not in data:
        raise Exception(f"Failed to register IPN: {data}")

    print("\n👉 COPY THIS AND PUT INTO `.env` FILE:")
    print("PESAPAL_IPN_ID=", data["ipn_id"])
    return data
