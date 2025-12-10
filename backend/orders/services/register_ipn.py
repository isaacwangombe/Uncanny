import requests
from django.conf import settings

def register_ipn():
    url = f"{settings.PESAPAL_API_URL}/api/Transactions/RegisterIPN"
    payload = {
        "url": settings.PESAPAL_CALLBACK_URL,
        "ipn_notification_type": "POST"
    }

    # Pesapal authentication requires key & secret inside Basic Auth
    auth = (settings.PESAPAL_CONSUMER_KEY, settings.PESAPAL_CONSUMER_SECRET)

    res = requests.post(url, json=payload, auth=auth)

    print("STATUS:", res.status_code)
    print("RESPONSE:", res.text)

    try:
        data = res.json()
    except Exception:
        raise Exception(f"Invalid JSON from Pesapal: {res.text}")

    print("\n👉 COPY THIS AND PUT INTO `.env` FILE:")
    print("PESAPAL_IPN_ID=", data.get("ipn_id"))

    return data
